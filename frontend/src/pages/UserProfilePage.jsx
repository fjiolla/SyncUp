import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  HiOutlineMapPin, HiOutlineBriefcase, HiOutlineAcademicCap, HiOutlineGlobeAlt,
  HiOutlineCheckBadge, HiOutlineUserPlus, HiOutlineUserMinus, HiOutlineClock,
  HiOutlineFlag, HiOutlineNoSymbol, HiOutlineArrowLeft, HiOutlineEllipsisHorizontal,
  HiOutlineLockClosed, HiOutlineChatBubbleLeftRight,
} from 'react-icons/hi2';
import { usersApi } from '../api/users';
import { followApi } from '../api/follow';
import { blocksApi } from '../api/blocks';
import { chatApi } from '../api/chat';
import { useAuthStore } from '../store/authStore';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { usePageTitle } from '../hooks/usePageTitle';
import { confirmDialog } from '../store/confirmStore';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ReportModal from '../components/ReportModal';

export default function UserProfilePage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { requireAuth } = useRequireAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [listModal, setListModal] = useState(null);
  const [listData, setListData] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  usePageTitle(profile?.fullName || 'Profile');

  useEffect(() => {
    setLoading(true);
    usersApi.getByUsername(username)
      .then((res) => setProfile(res.data))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [username]);

  const refetchProfile = async () => {
    try {
      const res = await usersApi.getByUsername(username);
      setProfile(res.data);
    } catch {}
  };

  const handleFollowAction = () => {
    requireAuth(async () => {
      if (profile.followState === 'following') {
        const ok = await confirmDialog({
          title: `Unfollow @${profile.username}?`,
          message: 'You will stop seeing their connections and updates.',
          confirmLabel: 'Unfollow',
          tone: 'danger',
        });
        if (!ok) return;
      } else if (profile.followState === 'requested') {
        const ok = await confirmDialog({
          title: 'Cancel follow request?',
          message: `Your pending request to follow @${profile.username} will be withdrawn.`,
          confirmLabel: 'Cancel request',
          cancelLabel: 'Keep',
          tone: 'danger',
        });
        if (!ok) return;
      }

      setFollowing(true);
      try {
        if (profile.followState === 'following') {
          await followApi.unfollow(profile._id);
          toast.success(`Unfollowed @${profile.username}`);
        } else if (profile.followState === 'requested') {
          await followApi.cancelRequest(profile._id);
          toast.success('Request cancelled');
        } else {
          await followApi.follow(profile._id);
          toast.success('Follow request sent');
        }
        await refetchProfile();
      } catch (err) {
        toast.error(err.message || 'Action failed');
        await refetchProfile();
      }
      setFollowing(false);
    });
  };

  const handleBlock = () => {
    requireAuth(async () => {
      const ok = await confirmDialog({
        title: `Block @${profile.username}?`,
        message: "You won't see each other on SyncUp, and existing connections will be removed.",
        confirmLabel: 'Block',
        tone: 'danger',
      });
      if (!ok) return;
      try {
        await blocksApi.block(profile._id);
        toast.success('User blocked');
        navigate('/');
      } catch (err) {
        toast.error(err.message || 'Failed to block');
      }
    });
  };

  const handleMessage = () => {
    requireAuth(async () => {
      try {
        await chatApi.getOrCreateConversation(profile._id);
        navigate('/chat');
      } catch (err) {
        toast.error(err.message || 'Could not open conversation');
      }
    });
  };

  const openList = (kind) => {
    if (!profile?.canViewLists && !profile?.isSelf) {
      toast.error('Follow this user to see their connections');
      return;
    }
    setListModal(kind);
    setListLoading(true);
    setListData([]);
    const promise =
      kind === 'followers' ? followApi.getFollowers(profile._id, { limit: 50 }) :
      kind === 'following' ? followApi.getFollowing(profile._id, { limit: 50 }) :
      followApi.getMutuals(profile._id);
    promise
      .then((res) => {
        const items = res.data?.results || res.data || [];
        const normalized = items.map((it) => it.follower || it.following || it);
        setListData(normalized);
      })
      .catch(() => setListData([]))
      .finally(() => setListLoading(false));
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white border border-surface-200 rounded-xl p-8 animate-pulse">
          <div className="w-24 h-24 rounded-full bg-surface-100" />
          <div className="mt-4 h-6 bg-surface-100 rounded w-1/3" />
          <div className="mt-2 h-4 bg-surface-100 rounded w-1/4" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto bg-white border border-surface-200 rounded-xl p-12 text-center">
        <p className="text-surface-600">User not found</p>
        <Link to="/" className="mt-4 inline-block text-sm text-primary-600 hover:text-primary-700 font-medium">
          Back to home
        </Link>
      </div>
    );
  }

  const memberSince = new Date(profile.createdAt).toLocaleDateString([], { month: 'long', year: 'numeric' });

  const renderFollowButton = () => {
    if (profile.isSelf) return null;
    if (profile.followState === 'following') {
      return (
        <Button onClick={handleFollowAction} loading={following} variant="secondary">
          <HiOutlineUserMinus className="w-4 h-4 mr-1.5" /> Following
        </Button>
      );
    }
    if (profile.followState === 'requested') {
      return (
        <Button onClick={handleFollowAction} loading={following} variant="secondary">
          <HiOutlineClock className="w-4 h-4 mr-1.5" /> Requested
        </Button>
      );
    }
    return (
      <Button onClick={handleFollowAction} loading={following} variant="primary">
        <HiOutlineUserPlus className="w-4 h-4 mr-1.5" /> {profile.followsYou ? 'Follow back' : 'Follow'}
      </Button>
    );
  };

  const lockedStat = (n, label, kind) => (
    <button
      onClick={() => openList(kind)}
      disabled={!profile.canViewLists && !profile.isSelf}
      className={`bg-white border border-surface-200 rounded-xl p-4 text-center transition-colors ${
        profile.canViewLists || profile.isSelf ? 'hover:bg-surface-50 cursor-pointer' : 'cursor-not-allowed'
      }`}
    >
      <p className="text-xl font-bold text-surface-900 flex items-center justify-center gap-1">
        {n}
        {!profile.canViewLists && !profile.isSelf && <HiOutlineLockClosed className="w-3.5 h-3.5 text-surface-400" />}
      </p>
      <p className="text-xs text-surface-500 mt-0.5">{label}</p>
    </button>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-surface-500 hover:text-surface-900 transition-colors">
        <HiOutlineArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="bg-white border border-surface-200 rounded-xl overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-primary-100 to-primary-50" />
        <div className="px-8 pb-8 -mt-12">
          <div className="flex items-end justify-between gap-4">
            <Avatar src={profile.profileImage} name={profile.fullName} size="xl" className="ring-4 ring-white" />
            {!profile.isSelf && (
              <div className="flex items-center gap-2 pb-2">
                {renderFollowButton()}
                <button
                  onClick={handleMessage}
                  className="p-2 rounded-lg border border-surface-200 text-surface-600 hover:bg-surface-50 transition-colors"
                  title="Message"
                >
                  <HiOutlineChatBubbleLeftRight className="w-4 h-4" />
                </button>
                <div className="relative">
                  <button onClick={() => setShowMenu((v) => !v)} className="p-2 rounded-lg border border-surface-200 text-surface-600 hover:bg-surface-50 transition-colors">
                    <HiOutlineEllipsisHorizontal className="w-4 h-4" />
                  </button>
                  {showMenu && (
                    <div className="absolute right-0 mt-1 w-44 bg-white border border-surface-200 rounded-lg shadow-lg overflow-hidden z-10">
                      <button onClick={() => { setShowMenu(false); requireAuth(() => setShowReport(true)); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-surface-700 hover:bg-surface-50 transition-colors">
                        <HiOutlineFlag className="w-4 h-4" /> Report user
                      </button>
                      <button onClick={() => { setShowMenu(false); handleBlock(); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                        <HiOutlineNoSymbol className="w-4 h-4" /> Block user
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-surface-900">{profile.fullName}</h1>
              {profile.isEmailVerified && (
                <span title="Email verified" className="inline-flex items-center gap-1 text-xs text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full">
                  <HiOutlineCheckBadge className="w-3.5 h-3.5" /> Verified
                </span>
              )}
              {profile.followsYou && profile.followState !== 'following' && (
                <span className="text-xs text-surface-500 bg-surface-100 px-2 py-0.5 rounded-full">Follows you</span>
              )}
            </div>
            <p className="text-sm text-surface-500">@{profile.username}</p>
            {profile.bio && <p className="mt-3 text-sm text-surface-700 whitespace-pre-wrap">{profile.bio}</p>}

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-surface-500">
              {profile.location && (
                <span className="flex items-center gap-1.5"><HiOutlineMapPin className="w-4 h-4" />{profile.location}</span>
              )}
              {profile.profession && (
                <span className="flex items-center gap-1.5"><HiOutlineBriefcase className="w-4 h-4" />{profile.profession}</span>
              )}
              {profile.college && (
                <span className="flex items-center gap-1.5"><HiOutlineAcademicCap className="w-4 h-4" />{profile.college}</span>
              )}
              {profile.website && (
                <a href={profile.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-primary-600 hover:text-primary-700">
                  <HiOutlineGlobeAlt className="w-4 h-4" />Website
                </a>
              )}
            </div>

            {profile.mutualCount > 0 && !profile.isSelf && (
              <button onClick={() => openList('mutuals')} className="mt-4 flex items-center gap-2 text-xs text-surface-500 hover:text-primary-700 transition-colors">
                <div className="flex -space-x-2">
                  {profile.mutuals?.slice(0, 3).map((m) => (
                    <Avatar key={m._id} src={m.profileImage} name={m.fullName} size="xs" className="ring-2 ring-white" />
                  ))}
                </div>
                <span>{profile.mutualCount} {profile.mutualCount === 1 ? 'mutual' : 'mutuals'}</span>
              </button>
            )}

            {profile.interests?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {profile.interests.map((i) => (
                  <span key={i} className="px-2.5 py-1 bg-surface-50 rounded-full text-xs text-surface-600">{i}</span>
                ))}
              </div>
            )}

            <p className="mt-4 text-xs text-surface-400">Member since {memberSince}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {lockedStat(profile.followerCount, 'Followers', 'followers')}
        {lockedStat(profile.followingCount, 'Following', 'following')}
        <div className="bg-white border border-surface-200 rounded-xl p-4 text-center">
          <p className="text-xl font-bold text-surface-900">{profile.podCount}</p>
          <p className="text-xs text-surface-500 mt-0.5">Activities</p>
        </div>
      </div>

      {!profile.isSelf && !profile.canViewLists && (
        <div className="bg-white border border-surface-200 rounded-xl p-4 flex items-center gap-3 text-sm text-surface-500">
          <HiOutlineLockClosed className="w-4 h-4 text-surface-400 flex-shrink-0" />
          <span>Follow @{profile.username} to see their followers, following, and your mutuals.</span>
        </div>
      )}

      <ReportModal
        open={showReport}
        onClose={() => setShowReport(false)}
        targetType="user"
        targetId={profile._id}
        targetName={`@${profile.username}`}
      />

      <Modal open={!!listModal} onClose={() => setListModal(null)} title={listModal === 'followers' ? 'Followers' : listModal === 'following' ? 'Following' : 'Mutuals'}>
        {listLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-surface-50 rounded-lg animate-pulse" />)}
          </div>
        ) : listData.length === 0 ? (
          <p className="text-sm text-surface-500 text-center py-6">Nothing here yet</p>
        ) : (
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {listData.map((u) => (
              <Link
                key={u._id}
                to={`/u/${u.username}`}
                onClick={() => setListModal(null)}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-50 transition-colors"
              >
                <Avatar src={u.profileImage} name={u.fullName} size="sm" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-surface-900 truncate">{u.fullName}</p>
                  <p className="text-xs text-surface-500 truncate">@{u.username}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
