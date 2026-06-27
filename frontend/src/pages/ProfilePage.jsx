import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { HiOutlineEnvelope, HiOutlineCheckCircle } from 'react-icons/hi2';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/auth';
import { usePageTitle } from '../hooks/usePageTitle';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Tabs from '../components/ui/Tabs';
import Avatar from '../components/ui/Avatar';
import CityAutocomplete from '../components/ui/CityAutocomplete';

const personalSchema = z.object({
  fullName: z.string().min(2, 'Name is too short').max(50).optional(),
  username: z.string().min(3, 'At least 3 characters').max(30).regex(/^[a-zA-Z0-9_]+$/, 'Letters, numbers, underscores only').optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  profession: z.string().max(100).optional(),
  college: z.string().max(100).optional(),
  website: z.string().url('Enter a valid URL').optional().or(z.literal('')),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export default function ProfilePage() {
  usePageTitle('Profile');
  const { user, setUser, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personal');

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto bg-white border border-surface-200 rounded-xl p-12 text-center">
        <p className="text-surface-600">Sign in to view your profile</p>
        <button onClick={() => navigate('/login')} className="mt-4 px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
          Sign in
        </button>
      </div>
    );
  }

  const tabs = [
    { key: 'personal', label: 'Personal info' },
    { key: 'security', label: 'Security' },
    { key: 'verification', label: 'Verification' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-surface-900">Account settings</h1>
        <p className="mt-1 text-surface-500">Manage your personal information, security, and preferences</p>
      </div>

      <ProfileHeader user={user} setUser={setUser} />

      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {activeTab === 'personal' && <PersonalInfoForm user={user} setUser={setUser} />}
        {activeTab === 'security' && <SecurityForm />}
        {activeTab === 'verification' && <VerificationPanel user={user} />}
      </motion.div>
    </motion.div>
  );
}

function ProfileHeader({ user, setUser }) {
  const [uploading, setUploading] = useState(false);

  const handleAvatarChange = async (dataUrl) => {
    if (!dataUrl) return;
    setUploading(true);
    try {
      const res = await authApi.updateProfile({ profileImage: dataUrl });
      setUser(res.data);
      toast.success('Profile photo updated');
    } catch (err) {
      toast.error(err.message || 'Failed to upload photo');
    }
    setUploading(false);
  };

  const handleRemove = async () => {
    setUploading(true);
    try {
      const res = await authApi.updateProfile({ profileImage: '' });
      setUser(res.data);
      toast.success('Profile photo removed');
    } catch (err) {
      toast.error(err.message || 'Failed to remove photo');
    }
    setUploading(false);
  };

  return (
    <div className="bg-white border border-surface-200 rounded-xl p-6">
      <div className="flex items-start gap-5">
        <div className="relative">
          <Avatar src={user?.profileImage} name={user?.fullName} size="lg" />
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-surface-900 truncate">{user?.fullName}</p>
          <p className="text-sm text-surface-500 truncate">@{user?.username}</p>
          <p className="text-sm text-surface-400 truncate">{user?.email}</p>
          <div className="mt-3 flex items-center gap-2">
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-md cursor-pointer transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  if (f.size > 8 * 1024 * 1024) {
                    toast.error('Image must be 8MB or smaller');
                    return;
                  }
                  const reader = new FileReader();
                  reader.onload = (ev) => handleAvatarChange(ev.target.result);
                  reader.readAsDataURL(f);
                }}
                className="hidden"
              />
              {user?.profileImage ? 'Change photo' : 'Upload photo'}
            </label>
            {user?.profileImage && (
              <button
                type="button"
                onClick={handleRemove}
                className="px-3 py-1.5 text-xs font-medium text-surface-600 hover:text-red-600 transition-colors"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PersonalInfoForm({ user, setUser }) {
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(personalSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      username: user?.username || '',
      bio: user?.bio || '',
      location: user?.location || '',
      profession: user?.profession || '',
      college: user?.college || '',
      website: user?.website || '',
    },
  });

  const locationValue = watch('location');

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const payload = {};
      Object.keys(data).forEach((key) => {
        if (data[key] !== undefined && data[key] !== user[key]) {
          payload[key] = data[key];
        }
      });
      if (Object.keys(payload).length === 0) {
        toast.info('No changes to save');
        setSaving(false);
        return;
      }
      const res = await authApi.updateProfile(payload);
      setUser(res.data);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    }
    setSaving(false);
  };

  const autoGenerated = user?.username?.startsWith('temp_') || user?.username?.startsWith('google_') || user?.username?.startsWith('github_');

  return (
    <div className="space-y-4">
      {autoGenerated && (
        <div className="px-4 py-3 bg-amber-50 border border-amber-100 rounded-lg text-sm text-amber-800">
          Your username was auto-generated. Pick something memorable so people can find you.
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-surface-200 rounded-xl p-6 space-y-4">
        <Input label="Full name" placeholder="Your name" error={errors.fullName?.message} {...register('fullName')} />
        <Input label="Username" placeholder="yourname" error={errors.username?.message} {...register('username')} />

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-surface-700">Bio</label>
          <textarea
            {...register('bio')}
            rows={3}
            placeholder="Tell us about yourself..."
            className="w-full px-3.5 py-2.5 bg-white border border-surface-200 rounded-lg text-sm placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none"
          />
          {errors.bio && <p className="text-xs text-red-500">{errors.bio.message}</p>}
        </div>

        <CityAutocomplete
          label="Location"
          value={locationValue || ''}
          onChange={(val) => setValue('location', val)}
          placeholder="Search city e.g. Vadodara, Mumbai"
          error={errors.location?.message}
        />
        <Input label="Profession" placeholder="What do you do?" error={errors.profession?.message} {...register('profession')} />
        <Input label="College / University" placeholder="Where did you study?" error={errors.college?.message} {...register('college')} />
        <Input label="Website" placeholder="https://yourwebsite.com" error={errors.website?.message} {...register('website')} />

        <div className="pt-2">
          <Button type="submit" loading={saving}>Save changes</Button>
        </div>
      </form>
    </div>
  );
}

function SecurityForm() {
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm({ resolver: zodResolver(passwordSchema) });

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await authApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password changed');
      reset();
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-surface-200 rounded-xl p-6 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-surface-900">Change password</h3>
          <p className="mt-1 text-xs text-surface-500">Use a strong password you don't use elsewhere</p>
        </div>
        <Input label="Current password" type="password" error={errors.currentPassword?.message} {...register('currentPassword')} />
        <Input label="New password" type="password" placeholder="At least 8 characters" error={errors.newPassword?.message} {...register('newPassword')} />
        <Input label="Confirm new password" type="password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
        <div className="pt-2">
          <Button type="submit" loading={saving}>Update password</Button>
        </div>
      </form>
    </div>
  );
}

function VerificationPanel({ user }) {
  const [sendingEmail, setSendingEmail] = useState(false);

  const handleSendVerificationEmail = async () => {
    setSendingEmail(true);
    try {
      await authApi.sendVerificationEmail();
      toast.success('Verification email sent. Check your inbox.');
    } catch (err) {
      toast.error(err.message || 'Failed to send email');
    }
    setSendingEmail(false);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-surface-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 flex-shrink-0">
            <HiOutlineEnvelope className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-surface-900">Email</h3>
              {user?.isEmailVerified && (
                <span className="inline-flex items-center gap-1 text-xs text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full">
                  <HiOutlineCheckCircle className="w-3 h-3" /> Verified
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-surface-500 truncate">{user?.email}</p>
            {!user?.isEmailVerified && (
              <Button size="sm" variant="secondary" loading={sendingEmail} onClick={handleSendVerificationEmail} className="mt-3">
                Send verification email
              </Button>
            )}
            {user?.isEmailVerified && (
              <p className="mt-1 text-xs text-surface-400">Your email is verified.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
