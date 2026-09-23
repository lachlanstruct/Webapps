import React, { useMemo } from 'react';
import katex from 'katex';

interface MathEquationProps {
  math: string;
  block?: boolean;
  displayMode?: boolean;
  className?: string;
}

export const MathEquation: React.FC<MathEquationProps> = ({
  math,
  block,
  displayMode,
  className = '',
}) => {
  const isBlock = displayMode ?? block ?? false;

  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: isBlock,
        throwOnError: false,
      });
    } catch {
      return math;
    }
  }, [math, isBlock]);

  return (
    <span
      className={`${isBlock ? 'my-1.5 block text-center overflow-x-auto py-0.5' : 'inline-block'} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
