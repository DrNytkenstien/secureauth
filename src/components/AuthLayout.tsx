import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      {/* Radial gradient overlay */}
      <div className="absolute inset-0 gradient-radial pointer-events-none" />
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
