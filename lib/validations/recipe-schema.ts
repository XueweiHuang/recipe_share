import { z } from 'zod'

export const ingredientSchema = z.object({
  name: z.string().min(1, 'Ingredient name is required'),
  quantity: z.string().optional(),
  unit: z.string().optional(),
})

export const instructionSchema = z.object({
  description: z.string().min(1, 'Instruction is required'),
})

export const recipeSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().optional(),
  cookTime: z.number().min(1, 'Cook time must be at least 1 minute').max(1440, 'Cook time must be less than 24 hours'),
  prepTime: z.number().min(1, 'Prep time must be at least 1 minute').max(1440, 'Prep time must be less than 24 hours'),
  servings: z.number().min(1, 'Servings must be at least 1').max(100, 'Servings must be less than 100'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  status: z.enum(['draft', 'published']).default('published'),
  ingredients: z.array(ingredientSchema).min(1, 'At least one ingredient is required'),
  instructions: z.array(instructionSchema).min(1, 'At least one instruction is required'),
})

export type RecipeFormData = z.infer<typeof recipeSchema>
export type Ingredient = z.infer<typeof ingredientSchema>
export type Instruction = z.infer<typeof instructionSchema>
