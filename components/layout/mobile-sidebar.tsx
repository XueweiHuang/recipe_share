'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChefHat, Home, Search, BookOpen, User, Settings, PlusCircle, Heart, LogOut, UserCircle, Bookmark } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface MobileSidebarProps {
  user: any
  profile: any
  onLogout: () => void
  trigger: React.ReactNode
}

export function MobileSidebar({ user, profile, onLogout, trigger }: MobileSidebarProps) {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  if (!user) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          {trigger}
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <ChefHat className="h-6 w-6 text-orange-600" />
              RecipeShare
            </SheetTitle>
          </SheetHeader>
          <div className="mt-8 space-y-1 px-2">
            <Link href="/#features" className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors">
              <BookOpen className="h-5 w-5" />
              Features
            </Link>
            <Link href="/#how-it-works" className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors">
              <Search className="h-5 w-5" />
              How It Works
            </Link>
            <Separator className="my-3" />
            <Link href="/login" className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors">
              <UserCircle className="h-5 w-5" />
              Login
            </Link>
            <Link href="/signup" className="flex items-center gap-3 px-3 py-2 rounded-md bg-orange-600 text-white hover:bg-orange-700 transition-colors">
              <PlusCircle className="h-5 w-5" />
              Get Started
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ChefHat className="h-6 w-6 text-orange-600" />
            RecipeShare
          </SheetTitle>
        </SheetHeader>

        {/* User Info */}
        <div className="mt-6 mx-2 flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
          <Avatar className="h-12 w-12">
            <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.username || 'User'} />
            <AvatarFallback className="bg-orange-100 text-orange-600">
              {profile?.username?.substring(0, 2).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">@{profile?.username || 'user'}</p>
            <p className="text-xs text-gray-600 truncate">{user.email}</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="mt-6 space-y-1 px-2">
          <Link
            href="/"
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              isActive('/') 
                ? 'bg-orange-100 text-orange-600' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Home className="h-5 w-5" />
            Home
          </Link>

          <Link
            href="/recipes"
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              isActive('/recipes') 
                ? 'bg-orange-100 text-orange-600' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Search className="h-5 w-5" />
            Browse Recipes
          </Link>

          <Link
            href="/recipes/new"
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              isActive('/recipes/new') 
                ? 'bg-orange-100 text-orange-600' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <PlusCircle className="h-5 w-5" />
            Create Recipe
          </Link>

          <Link
            href="/saved"
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              isActive('/saved') 
                ? 'bg-orange-100 text-orange-600' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Bookmark className="h-5 w-5" />
            Saved Recipes
          </Link>

          <Separator className="my-3" />

          <Link
            href={`/profile/${profile?.username || 'user'}`}
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              pathname?.startsWith('/profile/') && !pathname?.includes('/settings')
                ? 'bg-orange-100 text-orange-600' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <User className="h-5 w-5" />
            My Profile
          </Link>

          <Link
            href="/profile/settings"
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              isActive('/profile/settings') 
                ? 'bg-orange-100 text-orange-600' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Settings className="h-5 w-5" />
            Settings
          </Link>

          <Separator className="my-3" />

          <button
            onClick={onLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-red-600 hover:bg-red-50 transition-colors w-full text-left"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
