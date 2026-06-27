import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  HiOutlineUserGroup, HiOutlineMapPin, HiOutlineTag, HiOutlineArrowLeft,
  HiOutlinePencilSquare, HiOutlineTrash, HiOutlineCheck, HiOutlineXMark,
  HiStar, HiOutlineCalendar, HiOutlineGlobeAlt, HiOutlineVideoCamera,
  HiOutlineShare, HiOutlineLockClosed,
} from 'react-icons/hi2';
import { podsApi } from '../../api/pods';
import { reviewsApi } from '../../api/reviews';
import { useAuthStore } from '../../store/authStore';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { usePageTitle } from '../../hooks/usePageTitle';
import { confirmDialog } from '../../store/confirmStore';
import Button from '../../components/ui/Button';
import Tabs from '../../components/ui/Tabs';
import Modal from '../../components/ui/Modal';
import Avatar from '../../components/ui/Avatar';
import Input from '../../components/ui/Input';
import StarRating from '../../components/ui/StarRating';
import LocationPicker, { LocationDisplay } from '../../components/ui/LocationPicker';
import ImageUpload from '../../components/ui/ImageUpload';

const ROLE_LABELS = { owner: 'Host', admin: 'Co-host', moderator: 'Moderator', member: 'Attendee' };
const ROLE_COLORS = {
  owner: 'bg-amber-50 text-amber-700',
  admin: 'bg-primary-50 text-primary-700',
  moderator: 'bg-blue-50 text-blue-700',
  member: 'bg-surface-100 text-surface-600',
};

const TYPE_META = {
  'virtual': { label: 'Virtual', icon: HiOutlineGlobeAlt, color: 'bg-blue-50 text-blue-700' },
  'in-person': { label: 'In person', icon: HiOutlineMapPin, color: 'bg-emerald-50 text-emerald-700' },
  'hybrid': { label: 'Hybrid', icon: HiOutlineVideoCamera, color: 'bg-purple-50 text-purple-700' },
  'online': { label: 'Virtual', icon: HiOutlineGlobeAlt, color: 'bg-blue-50 text-blue-700' },
  'offline': { label: 'In person', icon: HiOutlineMapPin, color: 'bg-emerald-50 text-emerald-700' },
};

function formatDateRange(start, end) {
  if (!start) return null;
  const s = new Date(start);
  const e = end ? new Date(end) : null;
  const sameDay = e && s.toDateString() === e.toDateString();
  const dateOpts = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
  const timeOpts = { hour: '2-digit', minute: '2-digit' };
  if (!e) return s.toLocaleString([], { ...dateOpts, ...timeOpts });
  if (sameDay) {
    return `${s.toLocaleDateString([], dateOpts)} · ${s.toLocaleTimeString([], timeOpts)} – ${e.toLocaleTimeString([], timeOpts)}`;
  }
  return `${s.toLocaleString([], { ...dateOpts, ...timeOpts })} → ${e.toLocaleString([], { ...dateOpts, ...timeOpts })}`;
}

export default function PodDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { requireAuth } = useRequireAuth();
  const [pod, setPod] = useState(null);
  const [podStats, setPodStats] = useState({ averageRating: 0, reviewCount: 0 });
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(false);
  const [activeTab, setActiveTab] = useState('about');
  const [members, setMembers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [showEditPod, setShowEditPod] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  usePageTitle(pod?.name || 'Activity');

  const myMembership = members.find((m) => (m.user?._id || m.user) === user?._id) ||
    (pod ? { status: pod.myStatus, role: pod.myRole } : null);
  const isOwner = pod?.isOwner || myMembership?.role === 'owner';
  const isAdmin = isOwner || myMembership?.role === 'admin';
  const isMod = isAdmin || myMembership?.role === 'moderator';
  const myStatus = myMembership?.status;
  const isMember = myStatus === 'approved';
  const isPending = myStatus === 'pending';

  const fetchPod = async () => {
    try {
      const res = await podsApi.getBySlug(slug);
      setPod(res.data);
      const r = await reviewsApi.getPodReviews(res.data._id, { limit: 1 });
      setPodStats(r.data?.stats || { averageRating: 0, reviewCount: 0 });
    } catch {}
  };

  const fetchMembers = async () => {
    if (!pod?._id) return;
    try {
      const res = await podsApi.getMembers(pod._id, { limit: 100 });
      setMembers(res.data?.results || res.data || []);
    } catch {}
  };

  useEffect(() => {
    (async () => {
      await fetchPod();
      setLoading(false);
    })();
  }, [slug]);

  useEffect(() => {
    if (!pod?._id) return;
    fetchMembers();
    if (activeTab === 'reviews') {
      reviewsApi.getPodReviews(pod._id, { limit: 50 })
        .then((res) => {
          setReviews(res.data?.results || []);
          setPodStats(res.data?.stats || { averageRating: 0, reviewCount: 0 });
        })
        .catch(() => {});
    }
  }, [pod?._id, activeTab]);

  const handleJoin = () => {
    requireAuth(async () => {
      setActioning(true);
      try {
        await podsApi.join(pod._id);
        if (pod.requiresApproval) {
          toast.success('Request sent to host');
        } else {
          toast.success('You\'re going!');
        }
        await fetchPod();
        await fetchMembers();
      } catch (err) {
        toast.error(err.message || 'Failed to join');
      }
      setActioning(false);
    });
  };

  const handleLeave = async () => {
    const ok = await confirmDialog(
      isPending
        ? { title: 'Cancel your request?', message: 'Your pending request to join will be withdrawn.', confirmLabel: 'Cancel request', cancelLabel: 'Keep', tone: 'danger' }
        : { title: 'Leave this activity?', message: "You'll be removed from the attendee list.", confirmLabel: 'Leave', tone: 'danger' }
    );
    if (!ok) return;
    setActioning(true);
    try {
      await podsApi.leave(pod._id);
      toast.success(isPending ? 'Request cancelled' : 'No longer attending');
      await fetchPod();
      await fetchMembers();
    } catch (err) {
      toast.error(err.message || 'Failed to leave');
    }
    setActioning(false);
  };

  const handleDeletePod = async () => {
    try {
      await podsApi.remove(pod._id);
      toast.success('Activity deleted');
      navigate('/pods');
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  const handleApprove = async (userId) => {
    try {
      await podsApi.approveMember(pod._id, userId);
      toast.success('Attendee approved');
      await fetchMembers();
      await fetchPod();
    } catch (err) {
      toast.error(err.message || 'Failed to approve');
    }
  };

  const handleReject = async (userId) => {
    try {
      await podsApi.rejectMember(pod._id, userId);
      toast.success('Request rejected');
      await fetchMembers();
    } catch (err) {
      toast.error(err.message || 'Failed to reject');
    }
  };

  const handleRemoveMember = async (userId) => {
    const ok = await confirmDialog({ title: 'Remove this attendee?', message: 'They will be removed from this activity.', confirmLabel: 'Remove', tone: 'danger' });
    if (!ok) return;
    try {
      await podsApi.removeMember(pod._id, userId);
      toast.success('Attendee removed');
      await fetchMembers();
      await fetchPod();
    } catch (err) {
      toast.error(err.message || 'Failed to remove');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border border-surface-200 rounded-xl p-8 animate-pulse">
          <div className="w-16 h-16 bg-surface-100 rounded-xl" />
          <div className="mt-4 h-6 bg-surface-100 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!pod) {
    return (
      <div className="max-w-4xl mx-auto bg-white border border-surface-200 rounded-xl p-12 text-center">
        <p className="text-surface-600">Activity not found</p>
        <Link to="/discover" className="mt-4 inline-block text-sm text-primary-600 hover:text-primary-700 font-medium">
          Browse other activities
        </Link>
      </div>
    );
  }

  const type = TYPE_META[pod.eventType] || TYPE_META['in-person'];
  const TypeIcon = type.icon;
  const dateLabel = formatDateRange(pod.startDate, pod.endDate);
  const isPast = pod.endDate && new Date(pod.endDate) < new Date();
  const isFull = pod.memberCount >= pod.maxMembers;

  const tabs = [
    { key: 'about', label: 'About' },
    { key: 'attendees', label: `Attendees · ${pod.memberCount}` },
    ...(isPast ? [{ key: 'reviews', label: `Reviews${podStats.reviewCount ? ` · ${podStats.reviewCount}` : ''}` }] : []),
  ];

  const handleShare = async () => {
    const url = `${window.location.origin}/pods/${pod.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Share link copied to clipboard');
    } catch {
      toast.error('Could not copy link');
    }
  };

  const handleAddToCalendar = () => {
    if (!pod.startDate || !pod.endDate) {
      toast.error('Activity has no date set yet');
      return;
    }
    const fmt = (d) => new Date(d).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//SyncUp//Activity//EN',
      'BEGIN:VEVENT',
      `UID:${pod._id}@syncup`,
      `DTSTAMP:${fmt(new Date())}`,
      `DTSTART:${fmt(pod.startDate)}`,
      `DTEND:${fmt(pod.endDate)}`,
      `SUMMARY:${pod.name.replace(/[\n,;]/g, ' ')}`,
      `DESCRIPTION:${(pod.description || '').replace(/\n/g, ' ').replace(/[,;]/g, '')}`,
      pod.location ? `LOCATION:${pod.location.replace(/[\n,;]/g, ' ')}` : '',
      `URL:${window.location.origin}/pods/${pod.slug}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].filter(Boolean).join('\r\n');
    const blob = new Blob([ics], { type: 'text/calendar' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${pod.slug}.ics`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const pendingMembers = members.filter((m) => m.status === 'pending');
  const approvedMembersFromApi = members.filter((m) => m.status === 'approved');
  const hostInList = approvedMembersFromApi.some((m) => m.role === 'owner');
  const approvedMembers = !hostInList && pod.owner && typeof pod.owner === 'object'
    ? [{ _id: `synthetic-owner-${pod._id}`, user: pod.owner, role: 'owner', status: 'approved' }, ...approvedMembersFromApi]
    : approvedMembersFromApi;

  let primaryAction = null;
  if (!isOwner) {
    if (isMember) {
      primaryAction = <Button variant="secondary" onClick={handleLeave} loading={actioning}>Not going</Button>;
    } else if (isPending) {
      primaryAction = <Button variant="secondary" onClick={handleLeave} loading={actioning}>Request sent</Button>;
    } else if (isPast) {
      primaryAction = <Button variant="secondary" disabled>Activity ended</Button>;
    } else if (isFull) {
      primaryAction = <Button variant="secondary" disabled>Full</Button>;
    } else {
      primaryAction = (
        <Button onClick={handleJoin} loading={actioning}>
          {pod.requiresApproval ? 'Request to join' : 'I\'m going'}
        </Button>
      );
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-surface-500 hover:text-surface-900 transition-colors">
        <HiOutlineArrowLeft className="w-4 h-4" /> Back
      </button>

      {isOwner && pod.visibility === 'private' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3">
          <HiOutlineLockClosed className="w-4 h-4 text-amber-700 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-amber-900 font-medium">This activity is private.</p>
            <p className="text-xs text-amber-700">Share this page's URL with anyone you want to invite — only people with the link can find it.</p>
          </div>
          <button onClick={handleShare} className="px-3 py-1.5 text-xs font-medium bg-white border border-amber-300 text-amber-800 rounded-md hover:bg-amber-100 transition-colors flex items-center gap-1 flex-shrink-0">
            <HiOutlineShare className="w-3.5 h-3.5" /> Copy link
          </button>
        </div>
      )}

      <div className="bg-white border border-surface-200 rounded-xl overflow-hidden">
        {pod.banner ? (
          <div className="aspect-[16/6] bg-surface-100 relative overflow-hidden">
            <img src={pod.banner} alt={pod.name} className="w-full h-full object-cover object-center" />
          </div>
        ) : (
          <div className="h-32 bg-gradient-to-r from-primary-100 to-primary-50" />
        )}
        <div className="px-8 pb-8 -mt-12 relative z-10">
          <div className="w-20 h-20 rounded-2xl bg-white border border-surface-200 flex items-center justify-center text-primary-600 shadow-sm">
            <HiOutlineUserGroup className="w-10 h-10" />
          </div>
          <div className="mt-4 flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-semibold text-surface-900">{pod.name}</h1>
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full capitalize ${type.color}`}>
                  <TypeIcon className="w-3.5 h-3.5" /> {type.label}
                </span>
                {pod.visibility === 'private' && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-surface-100 text-surface-600">
                    <HiOutlineLockClosed className="w-3 h-3" /> Private
                  </span>
                )}
                {isPast && <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-surface-100 text-surface-500">Past</span>}
              </div>
              <p className="mt-2 text-sm text-surface-500">{pod.description}</p>
              {pod.owner && typeof pod.owner === 'object' && (
                <Link to={`/u/${pod.owner.username}`} className="mt-3 inline-flex items-center gap-2 text-sm text-surface-600 hover:text-primary-700 transition-colors">
                  <Avatar src={pod.owner.profileImage} name={pod.owner.fullName} size="xs" />
                  <span>Hosted by <span className="font-medium text-surface-900">{pod.owner.fullName}</span></span>
                </Link>
              )}
              {podStats.reviewCount > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <StarRating value={podStats.averageRating} size="sm" />
                  <span className="text-xs text-surface-500">{podStats.averageRating.toFixed(1)} · {podStats.reviewCount} {podStats.reviewCount === 1 ? 'review' : 'reviews'}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={handleShare} className="p-2 rounded-lg border border-surface-200 text-surface-600 hover:bg-surface-50 transition-colors" title="Copy share link">
                <HiOutlineShare className="w-4 h-4" />
              </button>
              <button onClick={handleAddToCalendar} className="p-2 rounded-lg border border-surface-200 text-surface-600 hover:bg-surface-50 transition-colors" title="Add to calendar">
                <HiOutlineCalendar className="w-4 h-4" />
              </button>
              {isOwner && (
                <>
                  <button onClick={() => setShowEditPod(true)} className="p-2 rounded-lg border border-surface-200 text-surface-600 hover:bg-surface-50 transition-colors" title="Edit">
                    <HiOutlinePencilSquare className="w-4 h-4" />
                  </button>
                  <button onClick={() => setShowDeleteConfirm(true)} className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors" title="Delete">
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </>
              )}
              {primaryAction}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-2.5 px-4 py-3 bg-surface-50 rounded-lg">
              <HiOutlineCalendar className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-surface-400">When</p>
                <p className={`font-medium ${dateLabel ? 'text-surface-900' : 'text-surface-400 italic'}`}>{dateLabel || 'Date to be announced'}</p>
              </div>
            </div>
            {pod.eventType !== 'virtual' && pod.location && (
              <div className="flex items-start gap-2.5 px-4 py-3 bg-surface-50 rounded-lg">
                <HiOutlineMapPin className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs text-surface-400">Where</p>
                  <p className="text-surface-900 font-medium truncate">{pod.location}</p>
                </div>
              </div>
            )}
            {pod.eventType !== 'in-person' && pod.meetingUrl && (
              <div className="flex items-start gap-2.5 px-4 py-3 bg-surface-50 rounded-lg">
                <HiOutlineGlobeAlt className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs text-surface-400">Meeting link</p>
                  {isMember || isOwner ? (
                    <a href={pod.meetingUrl} target="_blank" rel="noreferrer noopener" className="text-primary-700 font-medium hover:underline truncate block">
                      {pod.meetingUrl}
                    </a>
                  ) : (
                    <p className="text-surface-500 italic">Visible after joining</p>
                  )}
                </div>
              </div>
            )}
            <div className="flex items-start gap-2.5 px-4 py-3 bg-surface-50 rounded-lg">
              <HiOutlineUserGroup className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-surface-400">Attendees</p>
                <p className="text-surface-900 font-medium">{pod.memberCount} / {pod.maxMembers}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-surface-500">
            <span className="capitalize">{pod.visibility}</span>
            <span>•</span>
            <span>{pod.category}{pod.customCategory ? ` · ${pod.customCategory}` : ''}</span>
          </div>

          {pod.tags?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {pod.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-surface-50 rounded-full text-xs text-surface-600">
                  <HiOutlineTag className="w-3 h-3" />{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {activeTab === 'about' && (
          <div className="space-y-6">
            <div className="bg-white border border-surface-200 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-surface-900">Details</h3>
              <p className="mt-3 text-sm text-surface-600 leading-relaxed whitespace-pre-wrap">{pod.description}</p>
            </div>
            {pod.coordinates?.lat && pod.eventType !== 'virtual' && (
              <div className="bg-white border border-surface-200 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-surface-900 mb-3">Location</h3>
                <LocationDisplay coordinates={pod.coordinates} locationName={pod.location} />
              </div>
            )}
            {pod.rules?.length > 0 && (
              <div className="bg-white border border-surface-200 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-surface-900">Rules</h3>
                <ol className="mt-3 space-y-2">
                  {pod.rules.map((rule, i) => (
                    <li key={i} className="flex gap-3 text-sm text-surface-600">
                      <span className="text-surface-400 font-medium">{i + 1}.</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}

        {activeTab === 'attendees' && (
          <div className="space-y-6">
            {isMod && pendingMembers.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">Pending requests · {pendingMembers.length}</h3>
                <div className="space-y-2">
                  {pendingMembers.map((m) => (
                    <div key={m._id} className="flex items-center gap-3 p-3 bg-white border border-surface-200 rounded-xl">
                      <Link to={`/u/${m.user?.username}`} className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar src={m.user?.profileImage} name={m.user?.fullName} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-surface-900 truncate">{m.user?.fullName}</p>
                          <p className="text-xs text-surface-500 truncate">@{m.user?.username}</p>
                        </div>
                      </Link>
                      <button onClick={() => handleApprove(m.user?._id)} className="p-1.5 rounded-md bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors" title="Approve">
                        <HiOutlineCheck className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleReject(m.user?._id)} className="p-1.5 rounded-md text-surface-400 hover:bg-red-50 hover:text-red-600 transition-colors" title="Decline">
                        <HiOutlineXMark className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">Going · {approvedMembers.length}</h3>
              <div className="space-y-2">
                {approvedMembers.map((m) => {
                  const isSelf = (m.user?._id || m.user) === user?._id;
                  const canManage = isAdmin && !isSelf && m.role !== 'owner';
                  return (
                    <div key={m._id} className="flex items-center gap-3 p-3 bg-white border border-surface-200 rounded-xl">
                      <Link to={`/u/${m.user?.username}`} className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar src={m.user?.profileImage} name={m.user?.fullName} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-surface-900 truncate">{m.user?.fullName}{isSelf && <span className="text-xs text-surface-400 font-normal ml-1">(you)</span>}</p>
                          <p className="text-xs text-surface-500 truncate">@{m.user?.username}</p>
                        </div>
                      </Link>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ROLE_COLORS[m.role]}`}>{ROLE_LABELS[m.role]}</span>
                      {canManage && (
                        <button onClick={() => handleRemoveMember(m.user._id)} className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition-colors">Remove</button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <div className="bg-white border border-surface-200 rounded-xl p-6 flex items-center gap-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-surface-900">{podStats.averageRating > 0 ? podStats.averageRating.toFixed(1) : '—'}</p>
                <StarRating value={podStats.averageRating} size="sm" />
                <p className="text-xs text-surface-500 mt-1">{podStats.reviewCount} {podStats.reviewCount === 1 ? 'review' : 'reviews'}</p>
              </div>
              <div className="flex-1 text-sm text-surface-500">
                Reviews come from people who attended this activity. They appear after the activity ends.
              </div>
            </div>

            {reviews.length === 0 ? (
              <div className="bg-white border border-surface-200 rounded-xl p-12 text-center">
                <HiStar className="w-10 h-10 mx-auto text-surface-300" />
                <p className="mt-2 text-sm text-surface-500">No reviews yet</p>
              </div>
            ) : (
              reviews.map((r) => (
                <div key={r._id} className="bg-white border border-surface-200 rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <Link to={`/u/${r.reviewer?.username}`}>
                      <Avatar src={r.reviewer?.profileImage} name={r.reviewer?.fullName} size="sm" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <Link to={`/u/${r.reviewer?.username}`} className="text-sm font-medium text-surface-900 hover:text-primary-700">{r.reviewer?.fullName}</Link>
                          <p className="text-xs text-surface-400">{new Date(r.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                        <StarRating value={r.rating} size="sm" />
                      </div>
                      {r.comment && <p className="mt-2 text-sm text-surface-700">{r.comment}</p>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </motion.div>

      <EditPodModal
        open={showEditPod}
        onClose={() => setShowEditPod(false)}
        pod={pod}
        onUpdated={fetchPod}
      />
      <Modal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete this activity?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDeletePod}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-surface-600">
          This will permanently delete <strong>{pod.name}</strong>. This cannot be undone.
        </p>
      </Modal>
    </div>
  );
}

function EditPodModal({ open, onClose, pod, onUpdated }) {
  const [form, setForm] = useState({ description: '', visibility: 'public', requiresApproval: false, meetingUrl: '' });
  const [loading, setLoading] = useState(false);
  const [coordinates, setCoordinates] = useState(null);
  const [banner, setBanner] = useState('');

  useEffect(() => {
    if (pod) {
      setForm({
        description: pod.description || '',
        visibility: pod.visibility || 'public',
        requiresApproval: !!pod.requiresApproval,
        meetingUrl: pod.meetingUrl || '',
      });
      setCoordinates(pod.coordinates?.lat ? pod.coordinates : null);
      setBanner(pod.banner || '');
    }
  }, [pod]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form };
      if (coordinates?.lat && pod.eventType !== 'virtual') {
        payload.location = coordinates.displayName || pod.location;
        payload.coordinates = {
          lat: coordinates.lat,
          lng: coordinates.lng,
          displayName: coordinates.displayName || pod.location,
        };
      }
      if (banner !== pod.banner) payload.banner = banner;
      await podsApi.update(pod._id, payload);
      toast.success('Activity updated');
      await onUpdated();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to update');
    }
    setLoading(false);
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit activity" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <ImageUpload label="Cover image" value={banner} onChange={setBanner} helpText="JPG or PNG, up to 8MB" aspect="video" />
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-surface-700">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            className="w-full px-3.5 py-2.5 bg-white border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none"
          />
        </div>
        {pod?.eventType !== 'virtual' && (
          <LocationPicker
            label="Location"
            value={coordinates}
            onChange={setCoordinates}
            placeholder="Search or click on the map"
          />
        )}
        {pod?.eventType !== 'in-person' && (
          <Input label="Meeting link" value={form.meetingUrl} onChange={(e) => setForm({ ...form, meetingUrl: e.target.value })} placeholder="https://..." />
        )}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-surface-700">Visibility</label>
          <select value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value })} className="w-full px-3.5 py-2.5 bg-white border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
            <option value="public">Public — Listed in Browse</option>
            <option value="private">Private — Hidden, share link only</option>
          </select>
        </div>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.requiresApproval} onChange={(e) => setForm({ ...form, requiresApproval: e.target.checked })} className="accent-primary-600" />
          <span className="text-sm text-surface-700">Require approval for attendees</span>
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>Save changes</Button>
        </div>
      </form>
    </Modal>
  );
}
