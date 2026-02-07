import { type ReactNode } from 'react';
import { Card } from '../ui/card';
import { Tilt } from './Tilt';
import { cn } from '../../lib/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  disableTilt?: boolean;
}

export function GlassCard({ children, className, disableTilt = false }: GlassCardProps) {
  const cardContent = (
    <Card className={cn('glass-surface', className)}>
      {children}
    </Card>
  );

  if (disableTilt) {
    return cardContent;
  }

  return <Tilt>{cardContent}</Tilt>;
}
