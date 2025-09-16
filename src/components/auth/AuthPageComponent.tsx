import React from 'react';

interface AuthPageComponentProps {
  children: React.ReactNode;
}

export function AuthPageComponent({ children }: AuthPageComponentProps) {
  return (
    <div className="relative">
      {children}
    </div>
  );
}
