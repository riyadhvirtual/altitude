import { ReactNode } from 'react';

import { Navbar } from '@/components/navbar';

interface NavbarPageLayoutProps {
  title?: string | ReactNode;
  children: ReactNode;
  headerRight?: ReactNode;
  className?: string;
}

export function NavbarPageLayout({
  title,
  children,
  headerRight,
  className = 'space-y-4 sm:space-y-6',
}: NavbarPageLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          <div className={className}>
            {(title || headerRight) && (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {title && (
                  <div className="space-y-1">
                    <h1 className="text-xl font-semibold text-foreground sm:text-2xl lg:text-3xl">
                      {title}
                    </h1>
                  </div>
                )}
                {headerRight && (
                  <div className="flex items-center gap-2 sm:ml-auto">
                    {headerRight}
                  </div>
                )}
              </div>
            )}
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
