'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { BellIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import UserProfile from '@/components/auth/UserProfile'

function getBreadcrumbFromPath(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs: { name: string; href: string }[] = []
  
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    const href = '/' + segments.slice(0, i + 1).join('/')
    
    // Convert segment to readable text
    const name = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
    
    breadcrumbs.push({ name, href })
  }
  
  return breadcrumbs
}

export function TopNav() {
  const pathname = usePathname()
  const { user } = useUser()
  const breadcrumbs = getBreadcrumbFromPath(pathname)
  const currentPage = breadcrumbs[breadcrumbs.length - 1]?.name || 'Dashboard'

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="flex-1">
        <nav className="flex" aria-label="Breadcrumb">
          <ol role="list" className="flex items-center space-x-4">
            {breadcrumbs.map((breadcrumb, index) => (
              <li key={breadcrumb.href}>
                <div className="flex items-center">
                  {index > 0 && (
                    <svg
                      className="h-5 w-5 flex-shrink-0 text-gray-300 mr-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                    </svg>
                  )}
                  <span
                    className={`text-sm font-medium ${
                      index === breadcrumbs.length - 1
                        ? 'text-gray-900'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {breadcrumb.name}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-x-4 lg:gap-x-6">
        {/* Search */}
        <button
          type="button"
          className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
        >
          <span className="sr-only">Search</span>
          <MagnifyingGlassIcon className="h-6 w-6" aria-hidden="true" />
        </button>

        {/* Notifications */}
        <button
          type="button"
          className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
        >
          <span className="sr-only">View notifications</span>
          <BellIcon className="h-6 w-6" aria-hidden="true" />
        </button>

        {/* Separator */}
        <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />

        {/* Profile dropdown */}
        <UserProfile />
      </div>
    </div>
  )
} 