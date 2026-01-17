import { Skeleton } from '@/components/ui/skeleton'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'

export default function ProfileSettingsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Breadcrumbs 
          items={[
            { label: 'Loading...' },
            { label: 'Settings' }
          ]} 
        />
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-10 w-48" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>

        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="border rounded-lg p-6 bg-white">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-64 mb-4" />
            <div className="flex items-center gap-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="border rounded-lg p-6 bg-white">
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 justify-end">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    </div>
  )
}
