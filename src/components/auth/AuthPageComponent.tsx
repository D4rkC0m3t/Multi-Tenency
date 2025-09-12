import React from 'react';

interface AuthPageComponentProps {
  children: React.ReactNode;
}

export function AuthPageComponent({ children }: AuthPageComponentProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-green-600 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img src="/image-removebg-preview.png" alt="Company Logo" className="h-28 w-auto" />
        </div>
        <h1 className="mt-4 text-center text-4xl font-extrabold text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
          Inventory Management
        </h1>
        <p className="mt-2 text-center text-sm text-green-100">
          Complete Business Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {children}
      </div>
    </div>
  );
}
