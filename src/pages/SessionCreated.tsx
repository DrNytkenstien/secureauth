import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Shield, Sparkles, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/components/AuthLayout';

const SessionCreated: React.FC = () => {
  const [showContent, setShowContent] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || localStorage.getItem('userEmail') || 'your email';
  const sessionId = (location.state?.sessionId as string) || localStorage.getItem('sessionId');

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      if (sessionId) {
        await fetch('http://localhost:5000/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });
      }
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      localStorage.removeItem('sessionId');
      localStorage.removeItem('userEmail');
      setIsLoggingOut(false);
      navigate('/');
    }
  };

  return (
    <AuthLayout>
      <div className={`w-full max-w-md transition-all duration-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-8 text-center glow-subtle">
          <div className="relative mx-auto w-20 h-20 mb-6">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <div className="relative w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center glow-primary">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
          </div>

          <h1 className="font-display text-2xl font-semibold text-foreground mb-2">
            Session Created
          </h1>
          <p className="text-muted-foreground mb-8">
            You've been successfully authenticated as{' '}
            <span className="text-foreground font-medium">{email}</span>
          </p>

          <div className="bg-secondary/50 border border-border rounded-xl p-4 mb-8">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Active Session</span>
              </div>
              <span className="text-xs text-muted-foreground">Just now</span>
            </div>
            <div className="space-y-2 text-left">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Session ID</span>
                <span className="text-foreground font-mono text-xs truncate">{sessionId ? `${sessionId.slice(0, 8)}...` : '—'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Duration</span>
                <span className="text-foreground">24 hours</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => navigate('/dashboard')}
              className="w-full"
            >
              Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <Button
              onClick={handleLogout}
              disabled={isLoggingOut}
              variant="outline"
              className="w-full"
            >
              {isLoggingOut ? 'Logging out...' : <><LogOut className="mr-2 h-4 w-4" /> Logout</>}
            </Button>
          </div>

          <div className="mt-8 pt-8 border-t border-border space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="text-muted-foreground">
                  Your session is secure and will remain active for the next 24 hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default SessionCreated;
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Shield, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/components/AuthLayout';

const SessionCreated: React.FC = () => {
  const [showContent, setShowContent] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || 'your email';
  const sessionId = location.state?.sessionId || localStorage.getItem('sessionId');

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthLayout>
      <div className={`w-full max-w-md transition-all duration-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-8 text-center glow-subtle">
          {/* Success icon with glow effect */}
          <div className="relative mx-auto w-20 h-20 mb-6">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <div className="relative w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center glow-primary">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
          </div>
          
          <h1 className="font-display text-2xl font-semibold text-foreground mb-2">
            Session Created
          </h1>
          <p className="text-muted-foreground mb-8">
            You've been successfully authenticated as{' '}
            <span className="text-foreground font-medium">{email}</span>
          </p>

          {/* Session info card */}
          <div className="bg-secondary/50 border border-border rounded-xl p-4 mb-8">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Active Session</span>
              </div>
              <span className="text-xs text-muted-foreground">Just now</span>
            </div>
            <div className="space-y-2 text-left">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Session ID</span>
                <span className="text-foreground font-mono text-xs truncate">{sessionId ? sessionId.slice(0, 8) + '...' : '—'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Expires</span>
                <span className="text-foreground">In 7 days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <span className="flex items-center gap-1 text-primary">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Active
                </span>
              </div>
            </div>
          </div>

          <Button
            try {
              if (sessionId) {
                await fetch('http://localhost:5000/api/auth/logout', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ sessionId }),
                });
              }
            } catch (err) {
              console.error('Logout failed', err);
            } finally {
              localStorage.removeItem('sessionId');
              localStorage.removeItem('userEmail');
              navigate('/');
            }
            onClick={() => window.location.reload()}
          >
            <Sparkles className="w-4 h-4" />
            Go to Dashboard
          </Button>
            onClick={() => navigate('/dashboard')}
          <Button
            variant="ghost"
            size="lg"
            className="w-full"
            onClick={() => navigate('/')}
          >
            Sign in with different email
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default SessionCreated;
