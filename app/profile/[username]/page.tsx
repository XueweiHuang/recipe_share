import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, ChefHat, Clock, Users } from 'lucide-react'
import Link from 'next/link'

export async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const supabase = await createClient()

  // Fetch profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (profileError || !profile) {
    notFound()
  }

  // Fetch user's published recipes
  const { data: recipes, error: recipesError } = await supabase
    .from('recipes')
    .select('*')
    .eq('user_id', profile.id)
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  const userRecipes = recipes || []
  const userInitials = profile.username
    ? profile.username.substring(0, 2).toUpperCase()
    : 'U'

  // Format date
  const joinDate = new Date(profile.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <Avatar className="h-32 w-32">
                <AvatarImage src={profile.avatar_url || undefined} alt={profile.username} />
                <AvatarFallback className="bg-orange-100 text-orange-600 text-4xl">
                  {userInitials}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {profile.full_name || profile.username}
                  </h1>
                </div>
                <p className="text-gray-600 mb-4">@{profile.username}</p>

                {profile.bio && (
                  <p className="text-gray-700 mb-4">{profile.bio}</p>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {joinDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChefHat className="h-4 w-4" />
                    <span>{userRecipes.length} {userRecipes.length === 1 ? 'Recipe' : 'Recipes'}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recipes Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Recipes</h2>
        </div>

        {userRecipes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ChefHat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No recipes yet</p>
              <p className="text-sm text-gray-500">
                {profile.username} hasn't shared any recipes yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userRecipes.map((recipe) => {
              const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0)

              return (
                <Link key={recipe.id} href={`/recipes/${recipe.id}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle className="line-clamp-2">{recipe.title}</CardTitle>
                        {recipe.difficulty && (
                          <Badge variant="secondary" className="capitalize ml-2 flex-shrink-0">
                            {recipe.difficulty}
                          </Badge>
                        )}
                      </div>
                      {recipe.description && (
                        <CardDescription className="line-clamp-2">
                          {recipe.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                        {totalTime > 0 && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{totalTime} min</span>
                          </div>
                        )}
                        {recipe.servings && (
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{recipe.servings} servings</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfilePage
