import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import type { EventStatus } from '@/types';

interface EventStatusBadgeProps {
  status: EventStatus;
}

const statusConfig: Record<EventStatus, { label: string; icon: typeof Clock; className: string }> = {
  pending: {
    label: 'En attente',
    icon: Clock,
    className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  },
  approved: {
    label: 'Approuvé',
    icon: CheckCircle,
    className: 'bg-green-500/10 text-green-500 border-green-500/20',
  },
  rejected: {
    label: 'Rejeté',
    icon: XCircle,
    className: 'bg-red-500/10 text-red-500 border-red-500/20',
  },
};

export function EventStatusBadge({ status }: EventStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={config.className}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
}
