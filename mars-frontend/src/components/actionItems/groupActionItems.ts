import type { ActionItem } from './types';

export function groupActionItems<T extends string>(
  items: ActionItem[],
  key: keyof ActionItem,
) {
  return items.reduce(
    (groups, item) => {
      const groupKey = item[key] as T;
      groups[groupKey] = [...(groups[groupKey] ?? []), item];
      return groups;
    },
    {} as Record<T, ActionItem[]>,
  );
}
