import { ShieldAlert } from 'lucide-react';

export function RateLimitExceededPage() {
  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        <div className="flex min-h-screen flex-col items-center justify-center text-center">
          <ShieldAlert className="mb-4 h-16 w-16 text-destructive" />
          <h1 className="text-4xl font-bold tracking-tight">
            Too Many Requests
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            You have exceeded the rate limit. Please wait a moment before trying
            again.
          </p>
        </div>
      </body>
    </html>
  );
}
