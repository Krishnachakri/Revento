import React, { useState, useEffect } from 'react';
import { Resource, Category } from '../types/database';
import { getResources, getCategories } from '../lib/supabase';
import { ResourceCard } from '../components/marketplace/ResourceCard';
import { ResourceDetailModal } from '../components/marketplace/ResourceDetailModal';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { formatCurrency, parseToCents } from '../lib/currency';
import { Search, Filter, MapPin, Store, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { useEvent } from '../context/EventContext';
import { useNotification } from '../context/NotificationContext';

export function MarketplacePage() {
  const { categories } = useEvent();
  const { showToast } = useNotification();

  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [maxPriceRupees, setMaxPriceRupees] = useState<number>(30000);
  const [activeModalResource, setActiveModalResource] = useState<Resource | null>(null);

  const fetchFilteredResources = async () => {
    setIsLoading(true);
    try {
      const data = await getResources({
        categoryId: selectedCategory === 'all' ? undefined : selectedCategory,
        city: selectedCity === 'all' ? undefined : selectedCity,
        search: searchQuery.trim() || undefined,
      });

      // Filter by max price client-side
      const filtered = data.filter((r) => r.price_per_day_cents <= parseToCents(maxPriceRupees));
      setResources(filtered);
    } catch (err) {
      console.error('Error fetching marketplace resources:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFilteredResources();
  }, [selectedCategory, selectedCity, searchQuery, maxPriceRupees]);

  const cities = ['Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Verified B2B Equipment Catalog
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Resource Marketplace
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Search genuine audio, lighting, video, staging, and generator inventory across certified suppliers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchFilteredResources}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Catalog
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Keyword search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search JBL, Robe, P2.6 LED, truss..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-emerald-500 text-xs"
            />
          </div>

          {/* Category dropdown */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-emerald-500 text-xs bg-white"
            >
              <option value="all">All Equipment Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* City dropdown */}
          <div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-emerald-500 text-xs bg-white"
            >
              <option value="all">All Cities & Regions</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Max Price Range */}
          <div>
            <div className="flex items-center justify-between text-[11px] text-slate-600 mb-1">
              <span>Max Daily Rate:</span>
              <strong className="text-slate-900">₹{maxPriceRupees.toLocaleString('en-IN')}/day</strong>
            </div>
            <input
              type="range"
              min="1000"
              max="30000"
              step="1000"
              value={maxPriceRupees}
              onChange={(e) => setMaxPriceRupees(parseInt(e.target.value))}
              className="w-full accent-emerald-600"
            />
          </div>
        </div>

        {/* Category Pills shortcut */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 pb-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex-shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex-shrink-0 ${
                selectedCategory === c.id
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Resource Cards Grid */}
      {isLoading ? (
        <div className="text-center py-20 text-slate-500 text-sm">
          Loading verified equipment listings from database...
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <Store className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="text-sm font-bold text-slate-900">No equipment matches current filters</h4>
          <p className="text-xs text-slate-500">
            Try adjusting your search query, increasing maximum daily rate, or selecting another category.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedCategory('all');
              setSelectedCity('all');
              setSearchQuery('');
              setMaxPriceRupees(30000);
            }}
          >
            Clear All Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((res) => (
            <ResourceCard
              key={res.id}
              resource={res}
              onViewDetails={(r) => setActiveModalResource(r)}
            />
          ))}
        </div>
      )}

      {/* Resource Detail Modal */}
      <ResourceDetailModal
        resource={activeModalResource}
        isOpen={Boolean(activeModalResource)}
        onClose={() => setActiveModalResource(null)}
      />
    </div>
  );
}
