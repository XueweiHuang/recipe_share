'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import RecipeCard from './recipe-card'
import EmptyState from './empty-state'
import { Card, CardContent } from '@/components/ui/card'

interface RecipeSearchProps {
  initialRecipes: any[]
  isLoggedIn: boolean
}

export default function RecipeSearch({ initialRecipes, isLoggedIn }: RecipeSearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [recipes, setRecipes] = useState(initialRecipes)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [difficulty, setDifficulty] = useState(searchParams.get('difficulty') || 'all')
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest')
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const categoryParam = searchParams.get('categories')
    return categoryParam ? categoryParam.split(',') : []
  })
  const [categories, setCategories] = useState<any[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [totalCount, setTotalCount] = useState(initialRecipes.length)

  useEffect(() => {
    loadCategories()
  }, [])

  async function loadCategories() {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name')
    if (data) setCategories(data)
  }

  function toggleCategory(categoryId: string) {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  useEffect(() => {
    // Update URL with search params
    const params = new URLSearchParams()
    if (searchQuery) params.set('q', searchQuery)
    if (difficulty !== 'all') params.set('difficulty', difficulty)
    if (sortBy !== 'newest') params.set('sort', sortBy)
    if (selectedCategories.length > 0) params.set('categories', selectedCategories.join(','))
    
    const newUrl = params.toString() ? `/recipes?${params.toString()}` : '/recipes'
    router.push(newUrl, { scroll: false })
  }, [searchQuery, difficulty, sortBy, selectedCategories])

  async function handleSearch() {
    setLoading(true)
    try {
      let query = supabase
        .from('recipes')
        .select(`
          id,
          title,
          description,
          cook_time,
          servings,
          difficulty,
          created_at,
          profiles:user_id (
            username,
            avatar_url
          ),
          recipe_images!left (
            image_url,
            is_primary
          ),
          recipe_categories (
            categories (
              id,
              name,
              slug
            )
          )
        `, { count: 'exact' })
        .eq('status', 'published')

      // Search filter
      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
      }

      // Difficulty filter
      if (difficulty !== 'all') {
        query = query.eq('difficulty', difficulty)
      }

      // Sort
      switch (sortBy) {
        case 'oldest':
          query = query.order('created_at', { ascending: true })
          break
        case 'quickest':
          query = query.order('cook_time', { ascending: true, nullsFirst: false })
          break
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false })
          break
      }

      const { data, error, count } = await query.limit(50)

      if (error) throw error

      const mappedRecipes = data?.map((recipe: any) => ({
        id: recipe.id,
        title: recipe.title,
        description: recipe.description,
        cookTime: recipe.cook_time,
        servings: recipe.servings,
        difficulty: recipe.difficulty,
        primaryImage: recipe.recipe_images?.find((img: any) => img.is_primary)?.image_url || null,
        author: {
          username: recipe.profiles?.username || 'Unknown',
          avatarUrl: recipe.profiles?.avatar_url || null,
        },
        categories: recipe.recipe_categories?.map((rc: any) => rc.categories).filter(Boolean) || [],
      })) || []

      // Filter by category (client-side)
      let filteredRecipes = mappedRecipes
      if (selectedCategories.length > 0) {
        filteredRecipes = mappedRecipes.filter(recipe => 
          selectedCategories.some(selectedCatId =>
            recipe.categories.some((cat: any) => cat.id === selectedCatId)
          )
        )
      }

      setRecipes(filteredRecipes)
      setTotalCount(filteredRecipes.length)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    handleSearch()
  }, [difficulty, sortBy, selectedCategories])

  function clearFilters() {
    setSearchQuery('')
    setDifficulty('all')
    setSortBy('newest')
    setSelectedCategories([])
    setRecipes(initialRecipes)
    setTotalCount(initialRecipes.length)
    router.push('/recipes')
  }

  const hasActiveFilters = searchQuery || difficulty !== 'all' || sortBy !== 'newest' || selectedCategories.length > 0

  return (
    <>
      {/* Search and Filter Bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search Input */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search recipes by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch} disabled={loading} className="bg-orange-600 hover:bg-orange-700">
                {loading ? 'Searching...' : 'Search'}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? 'bg-orange-50' : ''}
              >
                <SlidersHorizontal className="h-5 w-5" />
              </Button>
            </div>

            {/* Filters (collapsible) */}
            {showFilters && (
              <div className="space-y-4 pt-4 border-t">
                {/* Categories - Multi-select with checkboxes */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Categories (select multiple)</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {categories.map(category => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`filter-${category.id}`}
                          checked={selectedCategories.includes(category.id)}
                          onCheckedChange={() => toggleCategory(category.id)}
                        />
                        <Label htmlFor={`filter-${category.id}`} className="cursor-pointer text-sm">
                          {category.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Difficulty and Sort */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Difficulty</label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sort By</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                        <SelectItem value="quickest">Quickest First</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-600">Active filters:</span>
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    Search: "{searchQuery}"
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setSearchQuery('')}
                    />
                  </Badge>
                )}
                {selectedCategories.map(categoryId => {
                  const category = categories.find(c => c.id === categoryId)
                  return category ? (
                    <Badge key={categoryId} variant="secondary" className="gap-1">
                      {category.name}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => toggleCategory(categoryId)}
                      />
                    </Badge>
                  ) : null
                })}
                {difficulty !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    {difficulty}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setDifficulty('all')}
                    />
                  </Badge>
                )}
                {sortBy !== 'newest' && (
                  <Badge variant="secondary" className="gap-1">
                    {sortBy === 'oldest' ? 'Oldest' : 'Quickest'}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setSortBy('newest')}
                    />
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-orange-600 hover:text-orange-700"
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-gray-600">
          {loading ? 'Searching...' : `Found ${totalCount} ${totalCount === 1 ? 'recipe' : 'recipes'}`}
        </p>
      </div>

      {/* Recipe Grid */}
      {recipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} {...recipe} />
          ))}
        </div>
      ) : (
        <EmptyState isLoggedIn={isLoggedIn} />
      )}
    </>
  )
}
