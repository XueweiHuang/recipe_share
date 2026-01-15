'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChefHat, LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"

export function Header() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <ChefHat className="h-8 w-8 text-orange-600" />
          <span className="text-2xl font-bold text-gray-900">RecipeShare</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/#features" className="text-gray-600 hover:text-orange-600 transition-colors">
            Features
          </Link>
          <Link href="/#how-it-works" className="text-gray-600 hover:text-orange-600 transition-colors">
            How It Works
          </Link>
          {user && (
            <Link href="/recipes" className="text-gray-600 hover:text-orange-600 transition-colors">
              Recipes
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {loading ? (
            <div className="h-9 w-32 animate-pulse bg-gray-200 rounded-md" />
          ) : user ? (
            <>
              <span className="text-sm text-gray-600 hidden sm:inline max-w-[200px] truncate">
                {user.email}
              </span>
              <Button variant="ghost" onClick={handleLogout} className="gap-2 cursor-pointer">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="bg-orange-600 hover:bg-orange-700">
                <Link href="/signup">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
