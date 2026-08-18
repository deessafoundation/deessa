/**
 * Breadcrumb Navigation Component
 * 
 * Provides visual breadcrumb navigation for users and structured data for SEO
 * Following Google's breadcrumb best practices
 */

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface BreadcrumbItem {
  label: string
  href: string
  current?: boolean
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  // Always include home as first item
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    ...items,
  ]

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        'flex items-center space-x-1 text-sm text-muted-foreground',
        className
      )}
    >
      <ol className="flex items-center space-x-1">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1
          const isFirst = index === 0

          return (
            <li key={item.href} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground/50" />
              )}
              {isLast ? (
                <span
                  className="font-medium text-foreground"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-foreground transition-colors inline-flex items-center gap-1"
                >
                  {isFirst && <Home className="h-4 w-4" />}
                  {isFirst ? (
                    <span className="sr-only">{item.label}</span>
                  ) : (
                    <span>{item.label}</span>
                  )}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

/**
 * Breadcrumb container with consistent styling
 */
export function BreadcrumbContainer({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'border-b bg-muted/30 py-3 px-4 sm:px-6 lg:px-8',
        className
      )}
    >
      <div className="max-w-7xl mx-auto">{children}</div>
    </div>
  )
}

/**
 * Example Usage:
 * 
 * <BreadcrumbContainer>
 *   <Breadcrumb
 *     items={[
 *       { label: 'Stories', href: '/stories' },
 *       { label: 'Helping Children with Autism', href: '/stories/helping-children-with-autism' },
 *     ]}
 *   />
 * </BreadcrumbContainer>
 */
