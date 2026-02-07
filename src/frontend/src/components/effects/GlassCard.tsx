import { type ReactNode } from 'react';
import { Card } from '../ui/card';
import { Tilt } from './Tilt';
import { cn } from '../../lib/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  disableTilt?: boolean;
  onClick?: () => void;
}

export function GlassCard({ children, className, disableTilt = false, onClick }: GlassCardProps) {
  const cardContent = (
    <Card className={cn('glass-surface', className)} onClick={onClick}>
      {children}
    </Card>
  );

  if (disableTilt) {
    return cardContent;
  }

  return <Tilt>{cardContent}</Tilt>;
}
