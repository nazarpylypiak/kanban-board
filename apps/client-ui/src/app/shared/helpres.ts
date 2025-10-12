import { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/dist/types/types';

export function getIsDropIndicatorHidden(
  index: number,
  sourceIndex: number,
  closestEdge: Edge | null
) {
  const isBeforeSource = index === sourceIndex - 1;
  const isAfterSource = index === sourceIndex + 1;

  return (
    (isBeforeSource && closestEdge === 'bottom') ||
    (isAfterSource && closestEdge === 'top')
  );
}
