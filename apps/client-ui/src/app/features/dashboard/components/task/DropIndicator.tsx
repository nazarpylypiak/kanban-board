import { type Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/dist/types/types';

import { CSSProperties, HTMLAttributes } from 'react';

interface Props {
  edge: Edge;
  gap: string;
}
export function DropIndicator({ edge, gap }: Props) {
  const edgeStyles: Record<Edge, HTMLAttributes<HTMLElement>['className']> = {
    top: 'top-[--line-offset] before:top-[--offset-terminal]',
    right: 'right-[--line-offset] before:right-[--offset-terminal]',
    bottom: 'bottom-[--line-offset] before:bottom-[--offset-terminal]',
    left: 'left-[--line-offset] before:left-[--offset-terminal]'
  };
  const strokeSize = 2;
  const terminalSize = 8;
  const offsetToAlignTerminalWithLine = (strokeSize - terminalSize) / 2;
  const lineOffset = `calc(-0.5 * (${gap} + ${strokeSize}px))`;
  const orientationStype =
    'h-[--line-thickness] left-[--terminal-radius] right-0 before:left-[--negative-terminal-size]';

  return (
    <div
      style={
        {
          '--line-thickness': `${strokeSize}px`,
          '--line-offset': `${lineOffset}`,
          '--terminal-size': `${terminalSize}px`,
          '--terminal-radius': `${terminalSize / 2}px`,
          '--negative-terminal-size': `-${terminalSize}px`,
          '--offset-terminal': `${offsetToAlignTerminalWithLine}px`
        } as CSSProperties
      }
      className={`absolute z-10 bg-blue-700 pointer-events-none before:content-[''] before:w-[--terminal-size] before:h-[--terminal-size] box-border before:absolute before:border-[length:--line-thickness] before:border-solid before:border-blue-700 before:rounded-full ${orientationStype} ${edgeStyles[edge]}`}
    ></div>
  );
}
