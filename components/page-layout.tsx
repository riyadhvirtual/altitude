import { ReactNode } from 'react';

interface PageLayoutProps {
  title?: string | ReactNode;
  description?: string;
  children: ReactNode;
  headerRight?: ReactNode;
  className?: string;
}

export function PageLayout({
  title,
  description,
  children,
  headerRight,
  className = 'space-y-6',
}: PageLayoutProps) {
  return (
    <div className={className}>
      {(title || headerRight) && (
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          {(title || description) && (
            <div className="space-y-1 w-full md:w-auto">
              {title && (
                <h3 className="font-medium text-2xl md:text-3xl text-foreground break-normal">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-muted-foreground">{description}</p>
              )}
            </div>
          )}
          {headerRight && (
            <div className="flex items-center gap-2 md:ml-auto">
              {headerRight}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
