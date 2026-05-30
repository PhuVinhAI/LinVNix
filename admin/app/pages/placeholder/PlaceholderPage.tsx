interface PlaceholderPageProps {
  title: string
  description?: string
}

/**
 * Placeholder Page Component
 * Used for pages that are not yet implemented
 */
export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        <p className="mt-4 text-muted-foreground">
          {description || 'Trang này đang được phát triển'}
        </p>
      </div>
    </div>
  )
}
