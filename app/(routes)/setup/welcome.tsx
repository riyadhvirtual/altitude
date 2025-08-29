'use client';

import { ArrowRight, CheckCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface WelcomeProps {
  onNext: () => void;
}

export default function Welcome({ onNext }: WelcomeProps) {
  return (
    <div className="w-full max-w-md text-center">
      <div className="mb-8">
        <h2 className="font-bold text-3xl text-foreground">
          Congratulations! 🎉
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          You&apos;ve successfully installed Altitude!
        </p>
      </div>

      <div className="mb-8 space-y-3">
        <div className="flex items-center justify-center gap-3 text-muted-foreground text-sm">
          <CheckCircle
            className="h-4 w-4"
            style={{ color: 'var(--success)' }}
          />
          <span>System requirements verified</span>
        </div>
        <div className="flex items-center justify-center gap-3 text-muted-foreground text-sm">
          <CheckCircle
            className="h-4 w-4"
            style={{ color: 'var(--success)' }}
          />
          <span>Database connection established</span>
        </div>
        <div className="flex items-center justify-center gap-3 text-muted-foreground text-sm">
          <CheckCircle
            className="h-4 w-4"
            style={{ color: 'var(--success)' }}
          />
          <span>Application ready to configure</span>
        </div>
      </div>

      <div className="mb-8 rounded-lg p-4 bg-muted">
        <p className="text-muted-foreground text-sm">
          Now let&apos;s set up your virtual airline! We&apos;ll guide you
          through creating your admin account and configuring your airline
          details.
        </p>
      </div>

      <Button className="w-full" onClick={onNext}>
        Let&apos;s Get Started
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
