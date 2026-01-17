## Getting Started Checklist

### Initial Setup
- [x] Create Next.js project with TypeScript and Tailwind
- [x] Install required dependencies (@supabase/supabase-js, @supabase/ssr, react-hook-form, zod, lucide-react)
- [ ] Set up Supabase project at https://supabase.com
- [ ] Configure environment variables in `.env.local`
- [x] Initialize shadcn/ui components (button, card, input, badge, separator)

### Database & Authentication  
- [x] Create database schema in Supabase SQL Editor
- [x] Set up Row Level Security policies
- [x] Configure Supabase Storage buckets
- [x] Implement authentication flows (login, signup, logout)
- [x] Create authentication middleware

### Core Features
- [x] Build landing page with header and footer
- [x] Build dynamic header component with authentication state
- [x] Implement conditional home page display (auth-based UI)
- [x] Implement recipe creation form
- [x] Create recipe display components
- [x] Build user profile pages (settings & public view)
- [x] Implement responsive mobile sidebar
- [x] Add featured recipes section to homepage (shows 6 latest for logged-in users)
- [x] Create recipe browsing page (/recipes) with grid layout
- [x] Implement Load More pagination for recipe browsing
- [ ] Add recipe search functionality
- [ ] Add recipe filtering (difficulty, cook time, categories)
- [ ] Implement social features (like, save, comment, follow)

### Deployment
- [ ] Test all features locally
- [ ] Deploy to Vercel
- [ ] Configure production environment variables
- [ ] Test production deployment
- [ ] Set up custom domain (optional)

---

## Implementation Steps

### Phase 1: Foundation (Week 1-2)

#### Step 1: Project Setup

**Create Next.js project:**
```bash
npx create-next-app@latest recipe-platform --typescript --tailwind --app
cd recipe-platform
```

**Install dependencies:**
```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install @supabase/ssr
npm install react-hook-form zod @hookform/resolvers
npm install lucide-react
npx shadcn-ui@latest init
```

**Install shadcn/ui components (as needed):**
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add form
npx shadcn-ui@latest add input
npx shadcn-ui@latest add card
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add select
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add separator
```

**Project structure:**
```
recipe-platform/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (protected)/
│   │   ├── recipes/
│   │   │   ├── new/
│   │   │   └── [id]/edit/
│   │   ├── profile/
│   │   └── saved/
│   ├── recipes/
│   │   └── [id]/
│   ├── profile/
│   │   └── [username]/
│   ├── search/
│   ├── categories/
│   │   └── [slug]/
│   ├── api/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   ├── auth/
│   ├── recipes/
│   └── layout/
├── lib/
│   ├── supabase/
│   ├── utils/
│   └── validations/
├── types/
└── public/
```

#### Step 2: Supabase Configuration

**Create Supabase project:**
1. Go to https://supabase.com
2. Create new project
3. Wait for database provisioning
4. Get project URL and anon key from Settings > API

**Environment variables (`.env.local`):**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Create Supabase client (`lib/supabase/client.ts`):**
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Create server client (`lib/supabase/server.ts`):**
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}
```

**Database Schema (Run in Supabase SQL Editor):**

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recipes table
CREATE TABLE recipes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  cook_time INTEGER, -- in minutes
  prep_time INTEGER, -- in minutes
  servings INTEGER,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  status TEXT CHECK (status IN ('draft', 'published')) DEFAULT 'published',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ingredients table
CREATE TABLE ingredients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  quantity TEXT,
  unit TEXT,
  "order" INTEGER NOT NULL
);

-- Instructions table
CREATE TABLE instructions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  step_number INTEGER NOT NULL,
  description TEXT NOT NULL
);

-- Recipe images table
CREATE TABLE recipe_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  "order" INTEGER NOT NULL
);

-- Categories table
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL
);

-- Recipe categories junction table
CREATE TABLE recipe_categories (
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (recipe_id, category_id)
);

-- Likes table
CREATE TABLE likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

-- Saved recipes table
CREATE TABLE saved_recipes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

-- Comments table
CREATE TABLE comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Follows table
CREATE TABLE follows (
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Indexes for better query performance
CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_recipes_status ON recipes(status);
CREATE INDEX idx_recipes_created_at ON recipes(created_at DESC);
CREATE INDEX idx_ingredients_recipe_id ON ingredients(recipe_id);
CREATE INDEX idx_instructions_recipe_id ON instructions(recipe_id);
CREATE INDEX idx_recipe_images_recipe_id ON recipe_images(recipe_id);
CREATE INDEX idx_likes_recipe_id ON likes(recipe_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_saved_recipes_user_id ON saved_recipes(user_id);
CREATE INDEX idx_comments_recipe_id ON comments(recipe_id);
CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_follows_following_id ON follows(following_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**Row Level Security Policies:**

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Recipes policies
CREATE POLICY "Published recipes are viewable by everyone"
  ON recipes FOR SELECT
  USING (status = 'published' OR auth.uid() = user_id);

CREATE POLICY "Users can insert own recipes"
  ON recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipes"
  ON recipes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipes"
  ON recipes FOR DELETE
  USING (auth.uid() = user_id);

-- Ingredients policies
CREATE POLICY "Ingredients viewable if recipe is viewable"
  ON ingredients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = ingredients.recipe_id
      AND (recipes.status = 'published' OR recipes.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage ingredients of own recipes"
  ON ingredients FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = ingredients.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

-- Instructions policies (similar to ingredients)
CREATE POLICY "Instructions viewable if recipe is viewable"
  ON instructions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = instructions.recipe_id
      AND (recipes.status = 'published' OR recipes.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage instructions of own recipes"
  ON instructions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = instructions.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

-- Recipe images policies (similar to ingredients)
CREATE POLICY "Recipe images viewable if recipe is viewable"
  ON recipe_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_images.recipe_id
      AND (recipes.status = 'published' OR recipes.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage images of own recipes"
  ON recipe_images FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_images.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

-- Categories policies
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (true);

-- Recipe categories policies
CREATE POLICY "Recipe categories viewable by everyone"
  ON recipe_categories FOR SELECT
  USING (true);

CREATE POLICY "Users can manage categories of own recipes"
  ON recipe_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_categories.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

-- Likes policies
CREATE POLICY "Likes are viewable by everyone"
  ON likes FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own likes"
  ON likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes"
  ON likes FOR DELETE
  USING (auth.uid() = user_id);

-- Saved recipes policies
CREATE POLICY "Users can view own saved recipes"
  ON saved_recipes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save recipes"
  ON saved_recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave recipes"
  ON saved_recipes FOR DELETE
  USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Comments are viewable by everyone"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);

-- Follows policies
CREATE POLICY "Follows are viewable by everyone"
  ON follows FOR SELECT
  USING (true);

CREATE POLICY "Users can follow others"
  ON follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow others"
  ON follows FOR DELETE
  USING (auth.uid() = follower_id);
```

**Storage Buckets Setup (Run in Supabase SQL Editor):**

```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('recipe-images', 'recipe-images', true),
  ('avatars', 'avatars', true);

-- Storage policies for recipe-images
CREATE POLICY "Anyone can view recipe images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'recipe-images');

CREATE POLICY "Authenticated users can upload recipe images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'recipe-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update own recipe images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'recipe-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own recipe images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'recipe-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for avatars
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

**Insert default categories:**

```sql
INSERT INTO categories (name, slug) VALUES
  ('Breakfast', 'breakfast'),
  ('Lunch', 'lunch'),
  ('Dinner', 'dinner'),
  ('Dessert', 'dessert'),
  ('Appetizer', 'appetizer'),
  ('Snack', 'snack'),
  ('Beverage', 'beverage'),
  ('Vegan', 'vegan'),
  ('Vegetarian', 'vegetarian'),
  ('Gluten-Free', 'gluten-free'),
  ('Keto', 'keto'),
  ('Paleo', 'paleo');
```

#### Step 3: Authentication System

**Type definitions (`types/database.ts`):**

```typescript
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string | null
          bio: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          full_name?: string | null
          bio?: string | null
          avatar_url?: string | null
        }
        Update: {
          username?: string
          full_name?: string | null
          bio?: string | null
          avatar_url?: string | null
        }
      }
      recipes: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          cook_time: number | null
          prep_time: number | null
          servings: number | null
          difficulty: 'easy' | 'medium' | 'hard' | null
          status: 'draft' | 'published'
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          title: string
          description?: string | null
          cook_time?: number | null
          prep_time?: number | null
          servings?: number | null
          difficulty?: 'easy' | 'medium' | 'hard' | null
          status?: 'draft' | 'published'
        }
      }
      // Add other table types as needed
    }
  }
}
```

**Middleware (`middleware.ts`):**

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protected routes
  if (request.nextUrl.pathname.startsWith('/recipes/new') ||
      request.nextUrl.pathname.startsWith('/profile/settings') ||
      request.nextUrl.pathname.startsWith('/saved')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Redirect authenticated users away from auth pages
  if ((request.nextUrl.pathname === '/login' || 
       request.nextUrl.pathname === '/signup') && user) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

**Login page (`app/(auth)/login/page.tsx`):**

```typescript
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
            >
              Google
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

**Signup page (`app/(auth)/signup/page.tsx`):**

```typescript
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name: fullName,
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/login')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>Create a new account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Sign Up'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Login
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

**Auth callback (`app/auth/callback/route.ts`):**

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(new URL('/', requestUrl.origin))
}
```

#### Step 4: Basic Layout & Navigation

**Root layout (`app/layout.tsx`):**

```typescript
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {# Recipe Sharing Platform - Specification & Implementation Guide

> **Agent Instructions**: This document serves as the complete specification for building a recipe sharing platform. Follow the implementation steps sequentially. All code should use TypeScript, follow Next.js 14+ App Router conventions, and integrate with Supabase.

## Executive Summary

A modern recipe sharing platform built with Next.js and Supabase that enables users to upload, browse, and discover recipes from a community of home cooks and food enthusiasts.

## Product Vision

Create an intuitive, visually appealing platform where users can share their favorite recipes, discover new dishes, and build a personal collection of culinary creations.

## Core Features

### 1. User Authentication & Profiles
- Email/password registration and login via Supabase Auth
- Social authentication (Google, GitHub)
- User profile pages with bio, profile picture, and recipe collection
- Ability to edit profile information

### 2. Recipe Upload & Management
- Create new recipes with rich text editor
- Upload multiple recipe photos
- Add ingredients with quantities and units
- Step-by-step cooking instructions
- Cooking time, servings, difficulty level
- Category/tags (breakfast, dinner, dessert, vegan, etc.)
- Edit and delete own recipes
- Draft/published status

### 3. Recipe Browsing & Discovery
- Homepage feed with latest recipes
- Search functionality by recipe name, ingredients, or tags
- Filter by category, difficulty, cooking time
- Sort by newest, most popular, trending
- Recipe detail page with full information
- Responsive image gallery

### 4. Social Features
- Like/favorite recipes
- Save recipes to personal collection
- Follow other users
- Comment on recipes
- Share recipes (future: social media integration)

### 5. User Collections
- Personal recipe book of saved/uploaded recipes
- Organize recipes into custom collections
- Private/public collection settings

## Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React hooks, Context API for global state
- **Image Handling**: Next.js Image component with optimization
- **Forms**: React Hook Form with Zod validation
- **Rich Text Editor**: Tiptap or react-quill

### Backend & Database
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (for recipe images)
- **Real-time**: Supabase Realtime (for likes, comments)

### Deployment & Infrastructure
- **Hosting**: Vercel
- **CDN**: Vercel Edge Network / Supabase CDN
- **Environment**: Environment variables for API keys

## Database Schema

### Tables

**users** (managed by Supabase Auth, extended with profiles table)
- id (UUID, primary key)
- email
- created_at

**profiles**
- id (UUID, primary key, foreign key to auth.users)
- username (unique)
- full_name
- bio
- avatar_url
- created_at
- updated_at

**recipes**
- id (UUID, primary key)
- user_id (foreign key to profiles)
- title
- description
- cook_time (integer, minutes)
- prep_time (integer, minutes)
- servings (integer)
- difficulty (enum: easy, medium, hard)
- status (enum: draft, published)
- created_at
- updated_at

**ingredients**
- id (UUID, primary key)
- recipe_id (foreign key to recipes)
- name
- quantity
- unit
- order (integer, for sorting)

**instructions**
- id (UUID, primary key)
- recipe_id (foreign key to recipes)
- step_number (integer)
- description (text)

**recipe_images**
- id (UUID, primary key)
- recipe_id (foreign key to recipes)
- image_url
- is_primary (boolean)
- order (integer)

**categories**
- id (UUID, primary key)
- name (unique)
- slug

**recipe_categories**
- recipe_id (foreign key to recipes)
- category_id (foreign key to categories)
- (composite primary key)

**likes**
- id (UUID, primary key)
- user_id (foreign key to profiles)
- recipe_id (foreign key to recipes)
- created_at
- (unique constraint on user_id + recipe_id)

**saved_recipes**
- id (UUID, primary key)
- user_id (foreign key to profiles)
- recipe_id (foreign key to recipes)
- created_at
- (unique constraint on user_id + recipe_id)

**comments**
- id (UUID, primary key)
- user_id (foreign key to profiles)
- recipe_id (foreign key to recipes)
- content (text)
- created_at
- updated_at

**follows**
- follower_id (foreign key to profiles)
- following_id (foreign key to profiles)
- created_at
- (composite primary key on follower_id + following_id)

## Feature Implementation Guide

### Phase 1: Foundation (Week 1-2)

**Step 1: Project Setup**
```bash
npx create-next-app@latest recipe-platform --typescript --tailwind --app
cd recipe-platform
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install shadcn-ui
npx shadcn-ui@latest init
```

**Step 2: Supabase Configuration**
- Create Supabase project
- Set up environment variables (.env.local):
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
- Create database tables using SQL migrations
- Set up Row Level Security (RLS) policies
- Configure storage buckets for recipe images

**Step 3: Authentication System**
- Create Supabase client utilities
- Build login/signup pages
- Implement authentication middleware
- Create protected routes
- Add session management

**Step 4: Basic Layout & Navigation**
- [x] Header with navigation
- [x] Footer
- [x] Responsive sidebar
- [x] User menu dropdown
- [x] Global header in root layout (consistent across all pages)
- [x] Breadcrumb navigation component
- [x] Breadcrumbs on all sub-pages (recipes, recipe detail, profiles, settings, create recipe)

**Future Enhancement - Phase 1:** ✅ Completed
- [x] Back button navigation via breadcrumbs
- [x] Breadcrumb navigation (e.g., Home > Browse Recipes > Recipe Title)
- [ ] History-based navigation helpers (optional, browser back button works)

### Phase 2: Core Recipe Features (Week 3-4)

**Step 5: Recipe Creation** ✅
- [x] Build recipe upload form with validation
- [x] Implement image upload to Supabase Storage
- [x] Create ingredient list builder (add/remove inputs)
- [x] Create instruction step builder
- [x] Add category/tag selection
- [x] Save recipe to database

**Step 6: Recipe Display** ✅
- [x] Create recipe card component for lists
- [x] Build recipe detail page
- [x] Display ingredients and instructions
- [x] Show recipe metadata (time, servings, difficulty)
- [x] Show recipe author information

**Step 7: Recipe Browsing** ✅ (Complete!)
- [x] Create dedicated /recipes page
- [x] Recipe grid layout (responsive: 1/2/3 columns)
- [x] Load More button pagination
- [x] Featured recipes section on homepage (6 recipes for logged-in users)
- [x] Empty state component
- [x] Recipe card with image, metadata, and author info
- [x] Edit recipe page with pre-filled form
- [x] Delete recipe with confirmation dialog
- [x] Recipe ownership validation
- [x] Search functionality (title and description)
- [x] Filter by difficulty
- [x] Filter by category
- [x] Sort options (newest, oldest, quickest)
- [x] Loading skeletons for all pages
- [x] Category selection in recipe creation form
- [x] Category badges on recipe cards
- [x] Category filter in search
- [x] Categories in edit form

### Phase 3: User Features (Week 5)

**Step 8: User Profiles**
- Profile page layout
- Display user's recipes
- Profile editing form
- Avatar upload
- User statistics (recipe count, followers)

**Step 9: Social Interactions**
- Like/unlike functionality
- Save/unsave recipes
- Comment system
- Follow/unfollow users
- Activity feed

**Note:** Once social features are implemented, like and save counts will be added to recipe cards for better user engagement.

### Phase 4: Enhancement & Polish (Week 6)

**Step 10: Search & Discovery**
- Advanced search with filters
- Trending recipes algorithm
- Recipe recommendations
- Related recipes

**Step 11: User Experience**
- Loading states and skeletons
- Error handling and messages
- Optimistic UI updates
- Toast notifications
- Image optimization

**Step 12: Testing & Deployment**
- Unit tests for utilities
- Integration tests for key flows
- Deploy to Vercel
- Set up production database
- Configure custom domain

## API Routes Structure

```
/api
  /auth
    /callback
  /recipes
    /[id]
    /search
  /users
    /[id]
  /upload
```

## Key Pages & Routes

```
/ - Homepage (public recipe feed)
/login - Authentication
/signup - Registration
/recipes/new - Create recipe (protected)
/recipes/[id] - Recipe detail
/recipes/[id]/edit - Edit recipe (protected)
/profile/[username] - User profile
/profile/settings - Edit profile (protected)
/my-recipes - User's recipes (protected)
/saved - Saved recipes (protected)
/search - Search results
/categories/[slug] - Category page
```

## Security Considerations

1. **Row Level Security**: Enable RLS on all tables
2. **Image Validation**: Check file types and sizes on upload
3. **Input Sanitization**: Validate all user inputs
4. **Authentication**: Protect sensitive routes with middleware
5. **Rate Limiting**: Implement on API routes
6. **CORS**: Configure properly for API access

## Performance Optimization

1. **Image Optimization**: Use Next.js Image component, WebP format
2. **Lazy Loading**: Implement for recipe lists
3. **Database Indexing**: Index frequently queried columns
4. **Caching**: Use Next.js caching strategies
5. **Code Splitting**: Automatic with Next.js App Router
6. **CDN**: Leverage Vercel's Edge Network

## Future Enhancements (Post-MVP)

- Recipe ratings and reviews
- Shopping list generation
- Meal planning calendar
- Recipe scaling calculator
- Nutrition information
- Print-friendly recipe view
- Recipe import from URL
- Mobile app (React Native)
- Recipe collections/cookbooks
- Social media sharing integration
- Email notifications
- Recipe versioning
- Ingredient substitution suggestions
- Video upload support

## Success Metrics

- User registration rate
- Recipe upload rate
- Daily/Monthly active users
- Average session duration
- Recipe views and engagement (likes, saves, comments)
- Search success rate
- User retention rate

## Development Timeline

- **Phase 1**: 2 weeks (Foundation)
- **Phase 2**: 2 weeks (Core Features)
- **Phase 3**: 1 week (User Features)
- **Phase 4**: 1 week (Polish & Deploy)

**Total MVP Development**: 6 weeks

## Resources Needed

- 1 Full-stack Developer (Next.js + Supabase)
- 1 UI/UX Designer (optional, can use shadcn/ui defaults)
- Supabase Pro plan ($25/month for production)
- Vercel Pro plan (optional, $20/month)
- Custom domain ($10-15/year)

## Getting Started Checklist

- [x] Create Next.js project
- [x] Set up Supabase project
- [x] Configure environment variables
- [x] Create database schema
- [x] Set up authentication
- [x] Build landing page with dynamic header
- [ ] Implement recipe CRUD
- [ ] Add user profiles
- [ ] Deploy to Vercel
- [ ] Test end-to-end
- [ ] Launch MVP