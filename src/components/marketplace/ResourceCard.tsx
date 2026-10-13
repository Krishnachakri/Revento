import React from 'react';
import { Resource } from '../../types/database';
import { formatCurrency } from '../../lib/currency';
import { MapPin, Building, CheckCircle2, Plus, Info } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface ResourceCardProps {
  resource: Resource;
  onViewDetails: (resource: Resource) => void;
  onAddToPlan?: (resource: Resource) => void;
}

export function ResourceCard({ resource, onViewDetails, onAddToPlan }: ResourceCardProps) {
  const isAvailable = resource.is_available && resource.total_quantity > 0;
  const image =
    resource.image_urls?.[0] ||
    'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col group">
      {/* Image container */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
        <img
          src={image}
          alt={resource.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Category tag */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {resource.category && (
            <span className="bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-lg">
              {resource.category.name}
            </span>
          )}
          {resource.is_seed ? (
            <span className="bg-amber-500/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider">
              Demo Seed
            </span>
          ) : (
            <span className="bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider">
              Verified Partner
            </span>
          )}
        </div>

        {/* Availability status badge */}
        <div className="absolute bottom-3 right-3">
          {isAvailable ? (
            <Badge variant="success" size="sm" dot>
              {resource.total_quantity} In Inventory
            </Badge>
          ) : (
            <Badge variant="error" size="sm" dot>
              Unavailable
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span>{resource.location_city}</span>
            {resource.location_state && <span>, {resource.location_state}</span>}
          </div>

          <h4 className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition-colors line-clamp-1">
            {resource.title}
          </h4>

          {resource.model_or_specs && (
            <p className="text-xs text-slate-500 font-mono mt-1 line-clamp-1 bg-slate-50 p-1.5 rounded-md border border-slate-100">
              {resource.model_or_specs}
            </p>
          )}

          <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
            {resource.description}
          </p>
        </div>

        {/* Provider and Pricing footer */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <Building className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="text-xs text-slate-600 truncate font-medium">
                {resource.provider?.company_name || resource.provider?.full_name || 'Verified Partner'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-base font-extrabold text-slate-900">
                {formatCurrency(resource.price_per_day_cents)}
              </span>
              <span className="text-[10px] text-slate-500 font-normal"> /day</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(resource)}
              className="flex-1 text-xs"
            >
              Specs & Dates
            </Button>
            {onAddToPlan && (
              <Button
                variant="emerald"
                size="sm"
                onClick={() => onAddToPlan(resource)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                className="text-xs"
              >
                Add to Plan
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
