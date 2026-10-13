import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { isSupabaseConfigured } from '../../lib/supabase';
import { Database, CheckCircle, ExternalLink, ShieldCheck, Key } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SupabaseConfigModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [copiedSql, setCopiedSql] = useState(false);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Supabase & Backend Architecture"
      description="Production PostgreSQL, Row Level Security, and Real-time Coordination Engine"
      maxWidth="2xl"
    >
      <div className="space-y-5 text-sm text-slate-600">
        {/* Status card */}
        <div className="flex items-center justify-between p-4 rounded-xl border bg-slate-50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isSupabaseConfigured ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-slate-900 flex items-center gap-2">
                Backend Status:
                {isSupabaseConfigured ? (
                  <Badge variant="success" dot>Live Supabase Cloud Connected</Badge>
                ) : (
                  <Badge variant="warning" dot>Local High-Fidelity Store Active</Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isSupabaseConfigured
                  ? 'All records, storage, and RLS policies are executing against your Supabase project.'
                  : 'Operating in self-contained deterministic mode with pre-seeded equipment inventory and complete booking flow.'}
              </p>
            </div>
          </div>
        </div>

        {/* Security & RLS summary */}
        <div className="p-4 rounded-xl border border-slate-200 space-y-2">
          <h4 className="font-semibold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Security & Row Level Security (RLS) Enforced:
          </h4>
          <ul className="text-xs space-y-1.5 list-disc list-inside text-slate-600">
            <li><strong>Profiles:</strong> Users can edit only their own profile records.</li>
            <li><strong>Resources:</strong> Providers can manage only their own equipment. Prevents deleting resources with active bookings.</li>
            <li><strong>Events & Requirements:</strong> Only the owning organizer can read, update, or remove event plans.</li>
            <li><strong>Booking Requests:</strong> Shared securely only between the creating organizer and the receiving provider.</li>
            <li><strong>Concurrency RPC:</strong> Stored procedure <code>accept_booking_request</code> re-verifies inventory availability before confirming bookings.</li>
          </ul>
        </div>

        {/* Migrations info */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-slate-900 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-slate-600" />
              SQL Migrations Included:
            </span>
          </div>
          <div className="text-xs font-mono bg-white p-3 rounded-lg border border-slate-200 space-y-1 text-slate-700">
            <div>supabase/migrations/20261013000001_initial_schema.sql (Tables, Indexes, RLS, RPCs)</div>
            <div>supabase/migrations/20261013000002_seed_data.sql (Demo providers & listings)</div>
            <div>supabase/migrations/20261013000003_storage.sql (resource-images bucket policies)</div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>
            Got it
          </Button>
          <a
            href="https://supabase.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200"
          >
            <span>Supabase Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </Modal>
  );
}
