import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Button } from './Button'
import { Settings, X } from 'lucide-react'
import toast from 'react-hot-toast'

export function EditProfileModal({ isOpen, onClose }) {
  const { user, updateProfile } = useAuth()
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [interestsText, setInterestsText] = useState('')
  const [profilePicture, setProfilePicture] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    if (user && isOpen) {
      setName(user.name || '')
      setBio(user.bio || '')
      setInterestsText(user.interests?.join(', ') || '')
      setProfilePicture(user.profilePicture || '')
    }
  }, [user, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (name.length < 3) {
      toast.error('Name must be at least 3 characters');
      return;
    }

    setLoading(true)

    const interests = interestsText.split(',').map(i => i.trim()).filter(Boolean);

    const success = await updateProfile({ name, bio, interests, profilePicture });

    setLoading(false)
    if (success) {
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-xl border border-zinc-200/80 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        <div className="px-5 py-4 flex items-center justify-between border-b border-zinc-100/80 bg-zinc-50/50">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-zinc-500" />
            <h2 className="text-[15px] font-semibold text-zinc-900 tracking-tight">Edit Profile</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-200/50 text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>

            {/* Profile Picture Upload */}
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="relative group cursor-pointer rounded-full mb-3">
                {profilePicture ? (
                  <div className="w-20 h-20 rounded-full border border-zinc-200 overflow-hidden ring-4 ring-white shadow-sm flex-shrink-0">
                    <img src={profilePicture} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full border border-zinc-200 bg-zinc-50 flex items-center justify-center ring-4 ring-white shadow-sm flex-shrink-0">
                    <span className="text-2xl font-bold text-zinc-400">{name?.charAt(0)?.toUpperCase() || '?'}</span>
                  </div>
                )}

                <div className="absolute inset-0 bg-black/40 rounded-full items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex">
                  <span className="text-[10px] text-white font-medium">Upload</span>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    setUploadingImage(true);

                    const data = new FormData();
                    data.append('file', file);
                    data.append('upload_preset', 'syncup_profiles');
                    try {
                      const res = await fetch('https://api.cloudinary.com/v1_1/dtrkyfdza/image/upload', {
                        method: 'POST',
                        body: data
                      });
                      const imgUrl = await res.json();
                      setProfilePicture(imgUrl.secure_url);
                      toast.success('Image uploaded successfully');
                    } catch (err) {
                      toast.error('Failed to upload image');
                    } finally {
                      setUploadingImage(false);
                    }
                  }}
                />
              </div>
              <p className="text-[11px] text-zinc-500 font-medium">Click avatar to change profile photo</p>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 mb-1.5 uppercase tracking-wide">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-[13px] focus:outline-none focus:border-zinc-400 focus:bg-white transition-colors"
                autoComplete="off"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 mb-1.5 uppercase tracking-wide">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Tell us a little about yourself..."
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-[13px] focus:outline-none focus:border-zinc-400 focus:bg-white transition-colors resize-none placeholder:text-zinc-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 mb-1.5 uppercase tracking-wide">Interests</label>
              <input
                type="text"
                value={interestsText}
                onChange={(e) => setInterestsText(e.target.value)}
                placeholder="Reading, Photography, Coding..."
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-[13px] focus:outline-none focus:border-zinc-400 focus:bg-white transition-colors placeholder:text-zinc-400"
                autoComplete="off"
              />
              <p className="text-[11px] text-zinc-400 mt-1.5 font-medium ml-1">Separate interests with commas</p>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="px-4 py-2 text-[13px]"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-[13px] shadow-sm cursor-pointer"
                disabled={loading || uploadingImage}
              >
                {loading || uploadingImage ? 'Please Wait...' : 'Save Changes'}
              </Button>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}
