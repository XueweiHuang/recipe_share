import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Heart, Users, BookOpen, Sparkles, ChefHat, ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import RecipeCard from "@/components/recipes/recipe-card"

export async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch featured recipes if user is logged in
  let featuredRecipes = null
  if (user) {
    const { data } = await supabase
      .from('recipes')
      .select(`
        id,
        title,
        description,
        cook_time,
        servings,
        difficulty,
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
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(6)

    featuredRecipes = data?.map((recipe: any) => ({
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
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="text-center max-w-4xl mx-auto">
          <Badge className="mb-4 bg-orange-100 text-orange-700 hover:bg-orange-200">
            <Sparkles className="w-3 h-3 mr-1" />
            Join 10,000+ Home Cooks
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Share & Discover
            <span className="text-orange-600"> Amazing Recipes</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
            Join our community of food lovers. Share your favorite recipes, discover new dishes, and build your personal cookbook.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {user ? (
              <>
                <Button size="lg" asChild className="bg-orange-600 hover:bg-orange-700 text-lg px-8 py-6">
                  <Link href="/recipes/new">Create New Recipe</Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6">
                  <Link href="/recipes">Browse Recipes</Link>
                </Button>
              </>
            ) : (
              <Button size="lg" asChild className="bg-orange-600 hover:bg-orange-700 text-lg px-8 py-6">
                <Link href="/signup">Start Sharing Recipes</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20 bg-white rounded-3xl shadow-sm">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Everything You Need
          </h2>
          <p className="text-xl text-gray-600">
            Powerful features to share and organize your recipes
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <BookOpen className="h-12 w-12 text-orange-600 mb-4" />
              <CardTitle>Easy Recipe Creation</CardTitle>
              <CardDescription>
                Upload your recipes with photos, ingredients, and step-by-step instructions in minutes.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Search className="h-12 w-12 text-orange-600 mb-4" />
              <CardTitle>Smart Search & Discovery</CardTitle>
              <CardDescription>
                Find recipes by ingredients, cuisine, dietary preferences, or cooking time.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Heart className="h-12 w-12 text-orange-600 mb-4" />
              <CardTitle>Save Your Favorites</CardTitle>
              <CardDescription>
                Like and save recipes to build your personal cookbook for easy access anytime.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-12 w-12 text-orange-600 mb-4" />
              <CardTitle>Follow Food Creators</CardTitle>
              <CardDescription>
                Connect with other home cooks and get updates when they share new recipes.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <ChefHat className="h-12 w-12 text-orange-600 mb-4" />
              <CardTitle>Step-by-Step Guidance</CardTitle>
              <CardDescription>
                Clear instructions with cooking times, difficulty levels, and serving sizes.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Sparkles className="h-12 w-12 text-orange-600 mb-4" />
              <CardTitle>Beautiful Recipe Cards</CardTitle>
              <CardDescription>
                Showcase your dishes with stunning photo galleries and elegant layouts.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Featured Recipes Section */}
      {user && featuredRecipes && featuredRecipes.length > 0 && (
        <section className="container mx-auto px-4 py-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">
                Featured Recipes
              </h2>
              <p className="text-xl text-gray-600">
                Discover the latest culinary creations from our community
              </p>
            </div>
            <Button variant="outline" asChild className="hidden md:flex">
              <Link href="/recipes">
                Browse All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {featuredRecipes.map((recipe: any) => (
              <RecipeCard key={recipe.id} {...recipe} />
            ))}
          </div>

          <div className="text-center md:hidden">
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/recipes">
                Browse All Recipes
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      )}

      {/* How It Works Section */}
      <section id="how-it-works" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600">
            Get started in three simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl font-bold text-orange-600">1</span>
            </div>
            <h3 className="text-2xl font-bold mb-4">Create Account</h3>
            <p className="text-gray-600">
              Sign up for free in seconds. No credit card required.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl font-bold text-orange-600">2</span>
            </div>
            <h3 className="text-2xl font-bold mb-4">Share Recipes</h3>
            <p className="text-gray-600">
              Upload your favorite recipes with photos and detailed instructions.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl font-bold text-orange-600">3</span>
            </div>
            <h3 className="text-2xl font-bold mb-4">Discover & Connect</h3>
            <p className="text-gray-600">
              Browse recipes from other cooks and build your collection.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="container mx-auto px-4 py-20">
          <Card className="bg-gradient-to-r from-orange-600 to-orange-500 border-0 text-white">
            <CardContent className="py-16 text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Share Your Recipes?
              </h2>
              <p className="text-xl mb-8 text-orange-50 max-w-2xl mx-auto">
                Join thousands of home cooks sharing their culinary creations with the world.
              </p>
              <Button size="lg" variant="secondary" asChild className="text-lg px-8 py-6">
                <Link href="/signup">Get Started for Free</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t bg-gray-50 mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className={`grid gap-8 ${user ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ChefHat className="h-6 w-6 text-orange-600" />
                <span className="text-xl font-bold text-gray-900">RecipeShare</span>
              </div>
              <p className="text-gray-600">
                Share & discover amazing recipes from food lovers worldwide.
              </p>
            </div>
            {user && (
              <div>
                <h4 className="font-bold text-gray-900 mb-4">Platform</h4>
                <ul className="space-y-2 text-gray-600">
                  <li><Link href="/recipes" className="hover:text-orange-600">Browse Recipes</Link></li>
                  <li><Link href="/categories" className="hover:text-orange-600">Categories</Link></li>
                  <li><Link href="/search" className="hover:text-orange-600">Search</Link></li>
                </ul>
              </div>
            )}
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-2 text-gray-600">
                <li><Link href="/about" className="hover:text-orange-600">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-orange-600">Contact</Link></li>
                <li><Link href="/blog" className="hover:text-orange-600">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-600">
                <li><Link href="/privacy" className="hover:text-orange-600">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-orange-600">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-gray-600">
            <p>&copy; 2026 RecipeShare. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
