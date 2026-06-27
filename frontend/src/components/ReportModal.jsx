import { useState } from 'react';
import { toast } from 'sonner';
import { HiOutlineFlag } from 'react-icons/hi2';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { reportsApi } from '../api/reports';

const REASONS = [
  { value: 'spam', label: 'Spam or scam' },
  { value: 'harassment', label: 'Harassment or hate speech' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'misinformation', label: 'False or misleading information' },
  { value: 'impersonation', label: 'Impersonation' },
  { value: 'other', label: 'Something else' },
];

export default function ReportModal({ open, onClose, targetType, targetId, targetName }) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) {
      toast.error('Pick a reason');
      return;
    }
    setLoading(true);
    try {
      await reportsApi.create({ targetType, targetId, reason, description });
      toast.success('Report submitted. Thank you.');
      setReason('');
      setDescription('');
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to submit report');
    }
    setLoading(false);
  };

  return (
    <Modal open={open} onClose={onClose} title={`Report ${targetName || 'content'}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-surface-500">
          Help us understand what's wrong. We review every report and take appropriate action.
        </p>

        <div className="space-y-2">
          {REASONS.map((r) => (
            <label key={r.value} className={`flex items-center gap-3 px-4 py-2.5 border rounded-lg cursor-pointer transition-colors ${reason === r.value ? 'border-primary-500 bg-primary-50/50' : 'border-surface-200 hover:bg-surface-50'}`}>
              <input
                type="radio"
                value={r.value}
                checked={reason === r.value}
                onChange={(e) => setReason(e.target.value)}
                className="accent-primary-600"
              />
              <span className="text-sm text-surface-700">{r.label}</span>
            </label>
          ))}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-surface-700">Tell us more (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Add any context that would help us review this..."
            maxLength={500}
            className="w-full px-3.5 py-2.5 bg-white border border-surface-200 rounded-lg text-sm placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading} variant="danger">
            <HiOutlineFlag className="w-4 h-4 mr-1.5" /> Submit report
          </Button>
        </div>
      </form>
    </Modal>
  );
}
