import React, { useMemo } from 'react';
import katex from 'katex';

interface MathEquationProps {
  math: string;
  block?: boolean;
  className?: string;
}

export const MathEquation: React.FC<MathEquationProps> = ({
  math,
  block = false,
  className = '',
}) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: block,
        throwOnError: false,
      });
    } catch {
      return math;
    }
  }, [math, block]);

  return (
    <span
      className={`${block ? 'my-1.5 block text-center overflow-x-auto py-0.5' : 'inline-block'} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
