import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { HiOutlineGlobeAlt, HiOutlineMapPin, HiOutlineSquares2X2 } from 'react-icons/hi2';
import { podsApi } from '../../api/pods';
import { useAuthStore } from '../../store/authStore';
import { usePageTitle } from '../../hooks/usePageTitle';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import LocationPicker from '../../components/ui/LocationPicker';
import ImageUpload from '../../components/ui/ImageUpload';

const schema = z.object({
  name: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().min(10, 'Tell people what to expect').max(2000),
  category: z.string().min(1, 'Pick a category'),
  customCategory: z.string().optional(),
  tags: z.string().optional(),
  visibility: z.enum(['public', 'private']),
  eventType: z.enum(['virtual', 'in-person', 'hybrid']),
  meetingUrl: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  startDate: z.string().min(1, 'Start date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endDate: z.string().min(1, 'End date is required'),
  endTime: z.string().min(1, 'End time is required'),
  maxMembers: z.coerce.number().int().min(1).max(100000).optional(),
  rules: z.string().optional(),
  requiresApproval: z.boolean().optional(),
}).refine((d) => {
  const start = new Date(`${d.startDate}T${d.startTime}`);
  const end = new Date(`${d.endDate}T${d.endTime}`);
  return end > start;
}, {
  message: 'End must be after start',
  path: ['endTime'],
}).refine((d) => d.category !== 'Other' || (d.customCategory && d.customCategory.trim().length > 0), {
  message: 'Please specify the category',
  path: ['customCategory'],
});

const CATEGORIES = ['Hackathons', 'Adventures', 'Sports', 'Tech', 'Workshops', 'Music', 'Art', 'Networking', 'Travel', 'Wellness', 'Gaming', 'Food', 'Photography', 'Books', 'Other'];

const TYPE_OPTIONS = [
  { value: 'in-person', label: 'In person', icon: HiOutlineMapPin, description: 'Meet at a venue' },
  { value: 'virtual', label: 'Virtual', icon: HiOutlineGlobeAlt, description: 'Meet online' },
  { value: 'hybrid', label: 'Hybrid', icon: HiOutlineSquares2X2, description: 'Both online and in person' },
];

export default function CreatePodPage() {
  usePageTitle('Host an activity');
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [coordinates, setCoordinates] = useState(null);
  const [banner, setBanner] = useState('');

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { visibility: 'public', requiresApproval: false, eventType: 'in-person', maxMembers: 50 },
  });

  const eventType = watch('eventType');
  const category = watch('category');

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto bg-white border border-surface-200 rounded-xl p-12 text-center">
        <p className="text-surface-600">Sign in to host an activity</p>
        <button onClick={() => navigate('/login')} className="mt-4 px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
          Sign in
        </button>
      </div>
    );
  }

  const onSubmit = async (data) => {
    setApiError('');
    setLoading(true);
    try {
      const payload = {
        name: data.name,
        description: data.description,
        category: data.category,
        customCategory: data.category === 'Other' ? (data.customCategory || '') : '',
        visibility: data.visibility,
        eventType: data.eventType,
        meetingUrl: data.eventType !== 'in-person' ? (data.meetingUrl || '') : '',
        startDate: new Date(`${data.startDate}T${data.startTime}`).toISOString(),
        endDate: new Date(`${data.endDate}T${data.endTime}`).toISOString(),
        maxMembers: data.maxMembers || 50,
        tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        rules: data.rules ? data.rules.split('\n').map((r) => r.trim()).filter(Boolean) : [],
        requiresApproval: !!data.requiresApproval,
      };
      if (coordinates && coordinates.lat && data.eventType !== 'virtual') {
        payload.location = coordinates.displayName || coordinates.name || '';
        payload.coordinates = {
          lat: coordinates.lat,
          lng: coordinates.lng,
          displayName: coordinates.displayName || coordinates.name || '',
        };
      }
      if (banner) payload.banner = banner;
      const res = await podsApi.create(payload);
      navigate(`/pods/${res.data.slug}`);
    } catch (err) {
      setApiError(err.message || 'Failed to create activity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-surface-900">Host a new activity</h1>
        <p className="mt-1 text-surface-500">Set up your event so people can find it and join in</p>
      </div>

      <div className="bg-white border border-surface-200 rounded-xl p-8">
        {apiError && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">{apiError}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <ImageUpload
            label="Cover image (optional)"
            value={banner}
            onChange={setBanner}
            helpText="JPG or PNG, up to 8MB"
            aspect="video"
          />
          <Input label="Activity title" placeholder="e.g. Mumbai Web3 Hackathon, Sunday Sunrise Trek" error={errors.name?.message} {...register('name')} />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-surface-700">What's happening?</label>
            <textarea
              {...register('description')}
              rows={4}
              placeholder="What's the activity, what should attendees expect, what to bring, prerequisites..."
              className="w-full px-3.5 py-2.5 bg-white border border-surface-200 rounded-lg text-sm placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none"
            />
            {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-surface-700">Category</label>
            <select {...register('category')} className="w-full px-3.5 py-2.5 bg-white border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
              <option value="">Select a category</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <p className="text-xs text-red-500">{errors.category.message}</p>}
          </div>

          {category === 'Other' && (
            <Input
              label="Specify category"
              placeholder="What is this activity about?"
              error={errors.customCategory?.message}
              {...register('customCategory')}
            />
          )}

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-surface-700">Format</label>
            <div className="grid grid-cols-3 gap-2">
              {TYPE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const selected = eventType === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setValue('eventType', opt.value, { shouldValidate: true })}
                    className={`flex flex-col items-center text-center gap-1 px-3 py-3 rounded-lg border transition-all ${
                      selected ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-surface-200 text-surface-600 hover:border-primary-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{opt.label}</span>
                    <span className="text-[10px] text-surface-400 leading-tight">{opt.description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-surface-700">When does it happen?</label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <p className="text-xs text-surface-400">Start date</p>
                <input
                  type="date"
                  {...register('startDate')}
                  className="w-full px-3.5 py-2.5 bg-white border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
                {errors.startDate && <p className="text-xs text-red-500">{errors.startDate.message}</p>}
              </div>
              <div className="space-y-1">
                <p className="text-xs text-surface-400">Start time</p>
                <input
                  type="time"
                  {...register('startTime')}
                  className="w-full px-3.5 py-2.5 bg-white border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
                {errors.startTime && <p className="text-xs text-red-500">{errors.startTime.message}</p>}
              </div>
              <div className="space-y-1">
                <p className="text-xs text-surface-400">End date</p>
                <input
                  type="date"
                  {...register('endDate')}
                  className="w-full px-3.5 py-2.5 bg-white border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
                {errors.endDate && <p className="text-xs text-red-500">{errors.endDate.message}</p>}
              </div>
              <div className="space-y-1">
                <p className="text-xs text-surface-400">End time</p>
                <input
                  type="time"
                  {...register('endTime')}
                  className="w-full px-3.5 py-2.5 bg-white border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
                {errors.endTime && <p className="text-xs text-red-500">{errors.endTime.message}</p>}
              </div>
            </div>
          </div>

          {eventType !== 'virtual' && (
            <LocationPicker
              label="Where is it happening?"
              value={coordinates}
              onChange={setCoordinates}
              placeholder="Search venue, address or click on the map"
            />
          )}

          {eventType !== 'in-person' && (
            <Input label="Meeting link" placeholder="https://meet.google.com/... or Zoom link" error={errors.meetingUrl?.message} {...register('meetingUrl')} />
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input label="Max attendees" type="number" min="1" {...register('maxMembers')} />
            <Input label="Tags" placeholder="comma, separated" {...register('tags')} />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-surface-700">Rules (one per line, optional)</label>
            <textarea
              {...register('rules')}
              rows={3}
              placeholder="Be respectful&#10;Bring your laptop&#10;Arrive 15 minutes early"
              className="w-full px-3.5 py-2.5 bg-white border border-surface-200 rounded-lg text-sm placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-surface-700">Visibility</label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-start gap-2 px-4 py-3 border border-surface-200 rounded-lg cursor-pointer hover:border-primary-300 transition-colors has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50">
                <input type="radio" value="public" {...register('visibility')} className="accent-primary-600 mt-0.5" />
                <span className="flex-1">
                  <span className="text-sm font-medium block">Public</span>
                  <span className="text-xs text-surface-500">Listed in Browse, anyone can find it</span>
                </span>
              </label>
              <label className="flex items-start gap-2 px-4 py-3 border border-surface-200 rounded-lg cursor-pointer hover:border-primary-300 transition-colors has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50">
                <input type="radio" value="private" {...register('visibility')} className="accent-primary-600 mt-0.5" />
                <span className="flex-1">
                  <span className="text-sm font-medium block">Private</span>
                  <span className="text-xs text-surface-500">Hidden from Browse. Share the activity URL to let people join.</span>
                </span>
              </label>
            </div>
          </div>

          <label className="flex items-center gap-2 pt-2">
            <input type="checkbox" {...register('requiresApproval')} className="accent-primary-600 rounded" />
            <span className="text-sm text-surface-700">Require approval for attendees</span>
          </label>

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" loading={loading} className="flex-1">Publish activity</Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
