'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Plus, X, ChefHat } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Ingredient, Instruction } from '@/lib/validations/recipe-schema'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'

export function NewRecipePage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [cookTime, setCookTime] = useState('')
  const [prepTime, setPrepTime] = useState('')
  const [servings, setServings] = useState('')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy')
  const [status, setStatus] = useState<'draft' | 'published'>('published')

  // Dynamic lists
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: '', quantity: '', unit: '' }
  ])
  const [instructions, setInstructions] = useState<Instruction[]>([
    { description: '' }
  ])

  useEffect(() => {
    loadCategories()
  }, [])

  async function loadCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')
    
    if (error) {
      console.error('Error loading categories:', error)
      setError('Failed to load categories')
    }
    
    if (data) {
      console.log('Loaded categories:', data)
      setCategories(data)
    } else {
      console.log('No categories found in database')
    }
  }

  function toggleCategory(categoryId: string) {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: '', unit: '' }])
  }

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    const updated = [...ingredients]
    updated[index] = { ...updated[index], [field]: value }
    setIngredients(updated)
  }

  const addInstruction = () => {
    setInstructions([...instructions, { description: '' }])
  }

  const removeInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index))
  }

  const updateInstruction = (index: number, value: string) => {
    const updated = [...instructions]
    updated[index] = { description: value }
    setInstructions(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('You must be logged in to create a recipe')
      }

      // Validate required fields
      if (!title.trim()) throw new Error('Title is required')
      if (!cookTime || !prepTime || !servings) throw new Error('All time and serving fields are required')
      if (ingredients.filter(i => i.name.trim()).length === 0) throw new Error('At least one ingredient is required')
      if (instructions.filter(i => i.description.trim()).length === 0) throw new Error('At least one instruction is required')

      // Insert recipe
      const { data: recipe, error: recipeError } = await supabase
        .from('recipes')
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          cook_time: parseInt(cookTime),
          prep_time: parseInt(prepTime),
          servings: parseInt(servings),
          difficulty,
          status,
        })
        .select()
        .single()

      if (recipeError) throw recipeError

      // Insert ingredients
      const validIngredients = ingredients
        .filter(i => i.name.trim())
        .map((ingredient, index) => ({
          recipe_id: recipe.id,
          name: ingredient.name.trim(),
          quantity: ingredient.quantity?.trim() || null,
          unit: ingredient.unit?.trim() || null,
          order: index + 1,
        }))

      if (validIngredients.length > 0) {
        const { error: ingredientsError } = await supabase
          .from('ingredients')
          .insert(validIngredients)

        if (ingredientsError) throw ingredientsError
      }

      // Insert instructions
      const validInstructions = instructions
        .filter(i => i.description.trim())
        .map((instruction, index) => ({
          recipe_id: recipe.id,
          step_number: index + 1,
          description: instruction.description.trim(),
        }))

      if (validInstructions.length > 0) {
        const { error: instructionsError } = await supabase
          .from('instructions')
          .insert(validInstructions)

        if (instructionsError) throw instructionsError
      }

      // Insert recipe categories
      if (selectedCategories.length > 0) {
        const categoryLinks = selectedCategories.map(categoryId => ({
          recipe_id: recipe.id,
          category_id: categoryId,
        }))

        const { error: categoriesError } = await supabase
          .from('recipe_categories')
          .insert(categoryLinks)

        if (categoriesError) throw categoriesError
      }

      // Success - redirect to recipe page
      router.push(`/recipes/${recipe.id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to create recipe')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Breadcrumbs items={[{ label: 'Create Recipe' }]} />
        
        <div className="flex items-center gap-3 mb-8">
          <ChefHat className="h-8 w-8 text-orange-600" />
          <h1 className="text-4xl font-bold text-gray-900">Create New Recipe</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Tell us about your recipe</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Recipe Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Grandma's Chocolate Chip Cookies"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us about this recipe..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prepTime">Prep Time (minutes) *</Label>
                  <Input
                    id="prepTime"
                    type="number"
                    value={prepTime}
                    onChange={(e) => setPrepTime(e.target.value)}
                    min="1"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cookTime">Cook Time (minutes) *</Label>
                  <Input
                    id="cookTime"
                    type="number"
                    value={cookTime}
                    onChange={(e) => setCookTime(e.target.value)}
                    min="1"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="servings">Servings *</Label>
                  <Input
                    id="servings"
                    type="number"
                    value={servings}
                    onChange={(e) => setServings(e.target.value)}
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty *</Label>
                  <Select value={difficulty} onValueChange={(value: any) => setDifficulty(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-3">
                <Label>Categories (Optional)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={category.id}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() => toggleCategory(category.id)}
                      />
                      <label
                        htmlFor={category.id}
                        className="text-sm cursor-pointer select-none"
                      >
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>
                {selectedCategories.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {categories
                      .filter(cat => selectedCategories.includes(cat.id))
                      .map(cat => (
                        <Badge key={cat.id} variant="secondary">
                          {cat.name}
                        </Badge>
                      ))
                    }
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Ingredients */}
          <Card>
            <CardHeader>
              <CardTitle>Ingredients</CardTitle>
              <CardDescription>List all the ingredients needed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                    <Input
                      placeholder="Ingredient name"
                      value={ingredient.name}
                      onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                    />
                    <Input
                      placeholder="Quantity"
                      value={ingredient.quantity || ''}
                      onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                    />
                    <Input
                      placeholder="Unit (e.g. cups)"
                      value={ingredient.unit || ''}
                      onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                    />
                  </div>
                  {ingredients.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeIngredient(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addIngredient} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Ingredient
              </Button>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
              <CardDescription>Step-by-step cooking directions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {instructions.map((instruction, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-semibold">
                    {index + 1}
                  </div>
                  <Textarea
                    placeholder={`Step ${index + 1}`}
                    value={instruction.description}
                    onChange={(e) => updateInstruction(index, e.target.value)}
                    rows={2}
                    className="flex-1"
                  />
                  {instructions.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeInstruction(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addInstruction} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Step
              </Button>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {loading ? 'Creating...' : 'Create Recipe'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NewRecipePage
