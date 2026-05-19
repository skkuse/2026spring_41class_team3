import type { LucideIcon } from 'lucide-react';
import { CheckCircle2, Circle, Clock3 } from 'lucide-react';
import type {
  ActionItemPriority,
  ActionItemStatus,
} from './types';

export const priorityConfig: Record<
  ActionItemPriority,
  { label: string; markerClass: string }
> = {
  DO: {
    label: '우선순위 높음',
    markerClass: 'bg-primary',
  },
  SCHEDULE: {
    label: '보통',
    markerClass: 'bg-chart-4',
  },
  DELEGATE: {
    label: '보통',
    markerClass: 'bg-chart-4',
  },
  DELETE: {
    label: '낮음',
    markerClass: 'bg-muted-foreground',
  },
};

export const priorityLegend = [
  { label: '우선순위 높음', markerClass: 'bg-primary' },
  { label: '보통', markerClass: 'bg-chart-4' },
  { label: '낮음', markerClass: 'bg-muted-foreground' },
];

export const statusColumns: Array<{
  key: ActionItemStatus;
  title: string;
  icon: LucideIcon;
  accent: string;
}> = [
  { key: 'TODO', title: '할 일', icon: Circle, accent: 'text-muted-foreground' },
  { key: 'IN_PROGRESS', title: '진행 중', icon: Clock3, accent: 'text-chart-2' },
  { key: 'DONE', title: '완료', icon: CheckCircle2, accent: 'text-chart-4' },
];

export const matrixQuadrants: Array<{
  key: ActionItemPriority;
  title: string;
  subtitle: string;
  marker: string;
}> = [
  {
    key: 'DO',
    title: '즉시 처리',
    subtitle: '중요하고 급한 일이에요. 지금 바로 확인해보세요.',
    marker: 'border-primary/60',
  },
  {
    key: 'SCHEDULE',
    title: '일정 등록',
    subtitle: '중요하지만 급하진 않아요. 적절한 시간을 정해두세요.',
    marker: 'border-chart-4/60',
  },
  {
    key: 'DELEGATE',
    title: '위임',
    subtitle: '급한 일이지만 직접 하지 않아도 괜찮아요.\n맡길 사람을 정해보세요.',
    marker: 'border-chart-4/60',
  },
  {
    key: 'DELETE',
    title: '제거',
    subtitle: '지금은 우선순위가 낮아요. 과감히 정리해도 괜찮아요.',
    marker: 'border-muted-foreground/40',
  },
];
