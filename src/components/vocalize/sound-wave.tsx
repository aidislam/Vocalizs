'use client';

import { cn } from '@/lib/utils';

interface SoundWaveProps {
  className?: string;
}

export function SoundWave({ className }: SoundWaveProps) {
  return (
    <div className={cn('flex items-end justify-center h-6 w-12 gap-1', className)}>
      <span
        className="w-1 bg-primary/80 animate-wave"
        style={{ animationDelay: '0s' }}
      />
      <span
        className="w-1 bg-primary/80 animate-wave"
        style={{ animationDelay: '0.2s' }}
      />
      <span
        className="w-1 bg-primary/80 animate-wave"
        style={{ animationDelay: '0.4s' }}
      />
      <span
        className="w-1 bg-primary/80 animate-wave"
        style={{ animationDelay: '0.6s' }}
      />
      <span
        className="w-1 bg-primary/80 animate-wave"
        style={{ animationDelay: '0.8s' }}
      />
    </div>
  );
}
