export type ActionItemsViewMode = '리스트' | '매트릭스';
export type ActionItemPriority = 'DO' | 'SCHEDULE' | 'DELEGATE' | 'DELETE';
export type ActionItemLevel = 'high' | 'low';
export type ActionItemStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface ActionItem {
  id: string;
  meeting_id: string;
  assignee_id: string;
  description: string;
  priority: ActionItemPriority;
  urgency: ActionItemLevel;
  importance: ActionItemLevel;
  status: ActionItemStatus;
  deadline: string;
  created_at: string;
}

export interface User {
  id: string;
  name: string;
}

export interface NewActionItemInput {
  description: string;
  assignee_id: string;
  priority: ActionItemPriority;
  status: ActionItemStatus;
  deadline: string;
}
