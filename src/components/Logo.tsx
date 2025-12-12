import React from 'react';
import { Shield } from 'lucide-react';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center gap-3 mb-8">
      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center glow-subtle">
        <Shield className="w-5 h-5 text-primary" />
      </div>
      <span className="font-display font-semibold text-xl text-foreground">SecureAuth</span>
    </div>
  );
};

export default Logo;
