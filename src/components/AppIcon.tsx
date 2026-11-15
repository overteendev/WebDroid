import { useEffect, useRef } from 'react';

export interface AppIconProps {
  icon: string;
  size?: number;
  className?: string;
}

export function AppIcon({ icon, size = 23, className = '' }: AppIconProps) {
  const iconRef = useRef<HTMLElement>(null);

  useEffect(() => {
    iconRef.current?.style.setProperty('--fa-icon-size', `${size}px`);
  }, [size]);

  return (
    <i
      ref={iconRef}
      className={`${icon} fa-app-icon${className ? ` ${className}` : ''}`}
      aria-hidden="true"
    />
  );
}
