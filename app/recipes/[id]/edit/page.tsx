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
import { Plus, X, ChefHat, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Ingredient, Instruction } from '@/lib/validations/recipe-schema'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'

export function EditRecipePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recipeId, setRecipeId] = useState<string | null>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  // Form state
  const [recipeTitle, setRecipeTitle] = useState('')
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
    async function init() {
      const resolvedParams = await params
      setRecipeId(resolvedParams.id)
      loadCategories()
      loadRecipe(resolvedParams.id)
    }
    init()
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

  async function loadRecipe(id: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Fetch recipe with related data
      const { data: recipe, error: recipeError } = await supabase
        .from('recipes')
        .select(`
          *,
          ingredients (id, name, quantity, unit, order),
          instructions (id, step_number, description),
          recipe_categories (category_id)
        `)
        .eq('id', id)
        .single()

      if (recipeError) throw recipeError

      // Check ownership
      if (recipe.user_id !== user.id) {
        router.push(`/recipes/${id}`)
        return
      }

      // Set form values
      setRecipeTitle(recipe.title)
      setTitle(recipe.title)
      setDescription(recipe.description || '')
      setCookTime(recipe.cook_time?.toString() || '')
      setPrepTime(recipe.prep_time?.toString() || '')
      setServings(recipe.servings?.toString() || '')
      setDifficulty(recipe.difficulty || 'easy')
      setStatus(recipe.status || 'published')

      // Set existing categories
      if (recipe.recipe_categories) {
        const categoryIds = recipe.recipe_categories.map((rc: any) => rc.category_id)
        setSelectedCategories(categoryIds)
      }

      // Set ingredients
      if (recipe.ingredients && recipe.ingredients.length > 0) {
        const sortedIngredients = recipe.ingredients
          .sort((a: any, b: any) => a.order - b.order)
          .map((ing: any) => ({
            name: ing.name,
            quantity: ing.quantity || '',
            unit: ing.unit || ''
          }))
        setIngredients(sortedIngredients)
      }

      // Set instructions
      if (recipe.instructions && recipe.instructions.length > 0) {
        const sortedInstructions = recipe.instructions
          .sort((a: any, b: any) => a.step_number - b.step_number)
          .map((inst: any) => ({
            description: inst.description
          }))
        setInstructions(sortedInstructions)
      }

      setLoading(false)
    } catch (err: any) {
      setError(err.message || 'Failed to load recipe')
      setLoading(false)
    }
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      if (!recipeId) throw new Error('Recipe ID not found')
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('You must be logged in')

      // Validate
      if (!title.trim()) throw new Error('Title is required')
      if (ingredients.filter(i => i.name.trim()).length === 0) {
        throw new Error('At least one ingredient is required')
      }
      if (instructions.filter(i => i.description.trim()).length === 0) {
        throw new Error('At least one instruction is required')
      }

      // Update recipe
      const { error: recipeError } = await supabase
        .from('recipes')
        .update({
          title: title.trim(),
          description: description.trim() || null,
          cook_time: cookTime ? parseInt(cookTime) : null,
          prep_time: prepTime ? parseInt(prepTime) : null,
          servings: servings ? parseInt(servings) : null,
          difficulty,
          status,
        })
        .eq('id', recipeId)

      if (recipeError) throw recipeError

      // Delete existing ingredients and instructions
      await supabase.from('ingredients').delete().eq('recipe_id', recipeId)
      await supabase.from('instructions').delete().eq('recipe_id', recipeId)

      // Insert new ingredients
      const validIngredients = ingredients
        .filter(i => i.name.trim())
        .map((ingredient, index) => ({
          recipe_id: recipeId,
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

      // Insert new instructions
      const validInstructions = instructions
        .filter(i => i.description.trim())
        .map((instruction, index) => ({
          recipe_id: recipeId,
          step_number: index + 1,
          description: instruction.description.trim(),
        }))

      if (validInstructions.length > 0) {
        const { error: instructionsError } = await supabase
          .from('instructions')
          .insert(validInstructions)

        if (instructionsError) throw instructionsError
      }

      // Update categories
      // Delete existing category associations
      await supabase.from('recipe_categories').delete().eq('recipe_id', recipeId)

      // Insert new category associations
      if (selectedCategories.length > 0) {
        const recipeCategoriesToInsert = selectedCategories.map(categoryId => ({
          recipe_id: recipeId,
          category_id: categoryId,
        }))
        const { error: categoryError } = await supabase
          .from('recipe_categories')
          .insert(recipeCategoriesToInsert)

        if (categoryError) throw categoryError
      }

      // Redirect to recipe detail page
      router.push(`/recipes/${recipeId}`)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to update recipe')
      setSaving(false)
    }
  }

  if (loading || !recipeId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Breadcrumbs 
          items={[
            { label: 'Browse Recipes', href: '/recipes' },
            { label: recipeTitle, href: `/recipes/${recipeId}` },
            { label: 'Edit' }
          ]} 
        />
        
        <div className="flex items-center gap-3 mb-8">
          <ChefHat className="h-8 w-8 text-orange-600" />
          <h1 className="text-4xl font-bold text-gray-900">Edit Recipe</h1>
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
              <CardDescription>Update your recipe details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Recipe Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Chocolate Chip Cookies"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of your recipe"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prepTime">Prep Time (min)</Label>
                  <Input
                    id="prepTime"
                    type="number"
                    value={prepTime}
                    onChange={(e) => setPrepTime(e.target.value)}
                    placeholder="15"
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cookTime">Cook Time (min)</Label>
                  <Input
                    id="cookTime"
                    type="number"
                    value={cookTime}
                    onChange={(e) => setCookTime(e.target.value)}
                    placeholder="30"
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="servings">Servings</Label>
                  <Input
                    id="servings"
                    type="number"
                    value={servings}
                    onChange={(e) => setServings(e.target.value)}
                    placeholder="4"
                    min="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
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
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>Select relevant categories for your recipe (optional)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {categories.map(category => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={category.id}
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={() => toggleCategory(category.id)}
                    />
                    <Label htmlFor={category.id} className="cursor-pointer">{category.name}</Label>
                  </div>
                ))}
              </div>

              {selectedCategories.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  <span className="text-sm text-muted-foreground">Selected:</span>
                  {selectedCategories.map(catId => {
                    const category = categories.find(c => c.id === catId)
                    return category ? (
                      <Badge key={catId} variant="secondary">
                        {category.name}
                      </Badge>
                    ) : null
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ingredients */}
          <Card>
            <CardHeader>
              <CardTitle>Ingredients</CardTitle>
              <CardDescription>List all ingredients needed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-2">
                    <div className="md:col-span-5">
                      <Input
                        placeholder="Ingredient name"
                        value={ingredient.name}
                        onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-3">
                      <Input
                        placeholder="Quantity"
                        value={ingredient.quantity}
                        onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-4">
                      <Input
                        placeholder="Unit (e.g., cups, tsp)"
                        value={ingredient.unit}
                        onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                      />
                    </div>
                  </div>
                  {ingredients.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeIngredient(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addIngredient}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Ingredient
              </Button>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
              <CardDescription>Step-by-step cooking instructions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {instructions.map((instruction, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-semibold mt-2">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <Textarea
                      placeholder="Describe this step"
                      value={instruction.description}
                      onChange={(e) => updateInstruction(index, e.target.value)}
                      rows={2}
                    />
                  </div>
                  {instructions.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeInstruction(index)}
                      className="mt-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addInstruction}
                className="w-full"
              >
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
              onClick={() => router.push(`/recipes/${recipeId}`)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditRecipePage
