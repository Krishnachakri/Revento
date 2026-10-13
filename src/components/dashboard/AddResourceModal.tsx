import React, { useState } from 'react';
import { Category, Resource } from '../../types/database';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { parseToCents } from '../../lib/currency';
import { uploadResourceImage, createResource, updateResource } from '../../lib/supabase';
import { useNotification } from '../../context/NotificationContext';
import { Upload, AlertCircle } from 'lucide-react';

interface AddResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  providerId: string;
  defaultCity?: string;
  onSuccess: (resource: Resource) => void;
  existingResource?: Resource | null;
}

export function AddResourceModal({
  isOpen,
  onClose,
  categories,
  providerId,
  defaultCity = 'Bengaluru',
  onSuccess,
  existingResource,
}: AddResourceModalProps) {
  const { showToast } = useNotification();

  const [title, setTitle] = useState(existingResource?.title || '');
  const [categoryId, setCategoryId] = useState(existingResource?.category_id || categories[0]?.id || '');
  const [description, setDescription] = useState(existingResource?.description || '');
  const [modelOrSpecs, setModelOrSpecs] = useState(existingResource?.model_or_specs || '');
  const [totalQuantity, setTotalQuantity] = useState(existingResource?.total_quantity || 10);
  const [pricePerDayRupees, setPricePerDayRupees] = useState(
    existingResource ? existingResource.price_per_day_cents / 100 : 3500
  );
  const [locationCity, setLocationCity] = useState(existingResource?.location_city || defaultCity);
  const [locationState, setLocationState] = useState(existingResource?.location_state || 'Karnataka');
  const [locationPincode, setLocationPincode] = useState(existingResource?.location_pincode || '560001');
  const [imageUrl, setImageUrl] = useState(
    existingResource?.image_urls?.[0] ||
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80'
  );
  const [isAvailable, setIsAvailable] = useState(existingResource?.is_available ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('File too large', 'Please select an image smaller than 5 MB.', 'error');
      return;
    }

    setUploadingImage(true);
    try {
      const uploadedUrl = await uploadResourceImage(file);
      setImageUrl(uploadedUrl);
      showToast('Image uploaded', 'Equipment image attached successfully.', 'success');
    } catch (err: any) {
      showToast('Upload error', err.message || 'Failed to upload image.', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validation
    if (!title.trim()) {
      setValidationError('Please provide an equipment title.');
      return;
    }
    if (!categoryId) {
      setValidationError('Please select an equipment category.');
      return;
    }
    if (!description.trim()) {
      setValidationError('Please provide a description.');
      return;
    }
    if (totalQuantity <= 0) {
      setValidationError('Total inventory quantity must be greater than zero.');
      return;
    }
    if (pricePerDayRupees < 0) {
      setValidationError('Daily rental price cannot be negative.');
      return;
    }
    if (!locationCity.trim()) {
      setValidationError('Please specify the location city.');
      return;
    }

    setIsSubmitting(true);
    try {
      const priceCents = parseToCents(pricePerDayRupees);

      const resourcePayload = {
        provider_id: providerId,
        category_id: categoryId,
        title: title.trim(),
        description: description.trim(),
        model_or_specs: modelOrSpecs.trim() || null,
        total_quantity: Number(totalQuantity),
        price_per_day_cents: priceCents,
        location_city: locationCity.trim(),
        location_state: locationState.trim() || null,
        location_pincode: locationPincode.trim() || null,
        image_urls: imageUrl ? [imageUrl] : [],
        is_available: isAvailable,
      };

      let result: Resource;
      if (existingResource) {
        result = await updateResource(existingResource.id, resourcePayload);
        showToast('Listing updated', `"${title}" has been updated.`, 'success');
      } else {
        result = await createResource(resourcePayload);
        showToast('Listing published', `"${title}" is now available on the B2B marketplace.`, 'success');
      }

      onSuccess(result);
      onClose();
    } catch (err: any) {
      setValidationError(err.message || 'Failed to save resource listing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={existingResource ? 'Edit Resource Listing' : 'List New Equipment Resource'}
      description="Add verified inventory to ReVento's coordinated B2B event catalog"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {validationError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">
              Equipment Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. JBL VTX A8 Compact Line Array Module"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-emerald-500 text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Resource Category *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-emerald-500 text-xs bg-white"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Model / Technical Specifications
            </label>
            <input
              type="text"
              placeholder="e.g. 110° dispersion, 350W LF / 160W HF, NL4"
              value={modelOrSpecs}
              onChange={(e) => setModelOrSpecs(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-emerald-500 text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Total Quantity in Stock *
            </label>
            <input
              type="number"
              min="1"
              required
              value={totalQuantity}
              onChange={(e) => setTotalQuantity(parseInt(e.target.value) || 1)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-emerald-500 text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Daily Rental Price (₹ INR / day) *
            </label>
            <input
              type="number"
              min="0"
              step="50"
              required
              value={pricePerDayRupees}
              onChange={(e) => setPricePerDayRupees(parseFloat(e.target.value) || 0)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-emerald-500 text-xs"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">
              Listing Description *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Detailed description of equipment condition, touring cases, cable packs, and deployment guidelines..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-emerald-500 text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Location City *</label>
            <input
              type="text"
              required
              placeholder="e.g. Bengaluru"
              value={locationCity}
              onChange={(e) => setLocationCity(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-emerald-500 text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">State / Province</label>
            <input
              type="text"
              placeholder="e.g. Karnataka"
              value={locationState}
              onChange={(e) => setLocationState(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-emerald-500 text-xs"
            />
          </div>

          {/* Image upload / URL */}
          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">
              Equipment Photo (Supabase Storage)
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                placeholder="Image URL or upload below..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-emerald-500 text-xs"
              />
              <label className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer font-medium text-slate-700 text-xs transition">
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>{uploadingImage ? 'Uploading...' : 'Upload File'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
              </label>
            </div>
            {imageUrl && (
              <div className="mt-2 flex items-center gap-2">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                />
                <span className="text-[11px] text-slate-500">Image attached and verified</span>
              </div>
            )}
          </div>

          <div className="sm:col-span-2 flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isAvailableCheck"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
            />
            <label htmlFor="isAvailableCheck" className="font-semibold text-slate-700">
              Immediately Available for Booking Requests
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="emerald"
            isLoading={isSubmitting}
          >
            {existingResource ? 'Save Listing Changes' : 'Publish Resource Listing'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
