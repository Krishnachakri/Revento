import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Compass, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 space-y-4">
      <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
        <Compass className="w-8 h-8" />
      </div>
      <h2 className="text-3xl font-extrabold text-slate-900">404 - Page Not Found</h2>
      <p className="text-xs text-slate-500 max-w-sm">
        The resource or page you requested could not be located on the ReVento platform.
      </p>
      <div className="pt-2">
        <Link to="/">
          <Button variant="emerald" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Return to Homepage
          </Button>
        </Link>
      </div>
    </div>
  );
}
