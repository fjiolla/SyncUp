import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

export function CreatePodModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    date: '',
    time: '',
    locationCity: '',
    locationExact: '',
    mapLink: '',
    maxMembers: '',
    minAge: 18,
    maxAge: 100,
    minTrustScore: 0,
    requireVerified: false,
    tags: ''
  });

  const [citySearch, setCitySearch] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [suggestedCities, setSuggestedCities] = useState([]);
  const [isSearchingCities, setIsSearchingCities] = useState(false);
  
// Duplicate block removed

  // Open-Meteo real global city API search
  useEffect(() => {
    if (citySearch.length < 3) {
      setSuggestedCities([]);
      setShowCityDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingCities(true);
      try {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(citySearch)}&count=5&language=en&format=json`);
        const data = await res.json();
        if (data.results) {
          const cities = data.results.map(c => [c.name, c.admin1, c.country].filter(Boolean).join(', '));
          setSuggestedCities([...new Set(cities)]);
          setShowCityDropdown(true);
        } else {
          setSuggestedCities([]);
        }
      } catch (err) {
        console.error("Failed to fetch cities");
      } finally {
        setIsSearchingCities(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [citySearch]);

  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        description: '',
        category: '',
        date: '',
        time: '',
        locationCity: '',
        locationExact: '',
        mapLink: '',
        maxMembers: '',
        minAge: 18,
        maxAge: 100,
        minTrustScore: 0,
        requireVerified: false,
        tags: ''
      });
      setCitySearch('');
      setShowCityDropdown(false);
      setSuggestedCities([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.date || !formData.time || !formData.locationCity || !formData.locationExact) return; 
    
    // Pass data back up
    onSubmit({
      title: formData.title,
      description: formData.description,
      category: formData.category,
      date: formData.date,
      time: formData.time,
      dateTime: new Date(`${formData.date}T${formData.time}`).toISOString(),
      location: `${formData.locationExact}, ${formData.locationCity}`,
      mapLink: formData.mapLink,
      minAge: formData.minAge,
      maxAge: formData.maxAge,
      minTrustScore: formData.minTrustScore,
      requireVerified: formData.requireVerified,
      maxMembers: formData.maxMembers,
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : (formData.category ? [formData.category] : ['General']),
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[95vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 tracking-tight">Create Pod</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[calc(100vh-140px)] custom-scrollbar">
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1.5">Pod Title *</label>
              <input 
                id="title"
                type="text" 
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm"
                placeholder="e.g. Weekend Badminton Group"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
              <textarea 
                id="description"
                rows={3}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm resize-none"
                placeholder="What is this pod about?"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                <select 
                  id="category"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm bg-white"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  <option value="">Select category...</option>
                  <option value="Sports">Sports</option>
                  <option value="Design">Design</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Social">Social</option>
                  <option value="Gaming">Gaming</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="maxMembers" className="block text-sm font-medium text-gray-700 mb-1.5">Max Members</label>
                <input 
                  id="maxMembers"
                  type="number" 
                  min="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm"
                  placeholder="e.g. 10"
                  value={formData.maxMembers}
                  onChange={e => setFormData({...formData, maxMembers: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Min Age</label>
                <input 
                  type="number" 
                  min="18"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm"
                  value={formData.minAge}
                  onChange={e => setFormData({...formData, minAge: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Max Age</label>
                <input 
                  type="number" 
                  min="18"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm"
                  value={formData.maxAge}
                  onChange={e => setFormData({...formData, maxAge: e.target.value})}
                  placeholder="e.g. 35"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Min Trust Score</label>
                <input 
                  type="number" 
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm"
                  value={formData.minTrustScore}
                  onChange={e => setFormData({...formData, minTrustScore: e.target.value})}
                  placeholder="e.g. 50"
                />
              </div>
              <div className="flex items-center mt-6">
                <input 
                  type="checkbox" 
                  id="requireVerified"
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                  checked={formData.requireVerified}
                  onChange={e => setFormData({...formData, requireVerified: e.target.checked})}
                />
                <label htmlFor="requireVerified" className="text-[13px] font-semibold text-gray-700 uppercase tracking-wide cursor-pointer">
                  Require Verified User
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Date *</label>
                <input 
                  type="date" 
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Time *</label>
                <input 
                  type="time" 
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm"
                  value={formData.time}
                  onChange={e => setFormData({...formData, time: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1.5">Tags (Comma Separated)</label>
              <input 
                id="tags"
                type="text" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm"
                placeholder="e.g. Hiking, Outdoors, Weekend"
                value={formData.tags}
                onChange={e => setFormData({...formData, tags: e.target.value})}
              />
            </div>

            <div className="space-y-4 pt-2 border-t border-gray-100/50">
              <div className="relative">
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">City, State, Country *</label>
                <div className="relative">
                  <input 
                    type="text" 
                    required
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm"
                    placeholder="e.g. Vadodara, Gujarat, India"
                    value={citySearch}
                    onChange={e => {
                      setCitySearch(e.target.value);
                      if (e.target.value !== formData.locationCity) setFormData({...formData, locationCity: ''});
                    }}
                    onBlur={() => setTimeout(() => setShowCityDropdown(false), 200)}
                    onFocus={() => { if (suggestedCities.length > 0) setShowCityDropdown(true); }}
                  />
                  {isSearchingCities && (
                    <div className="absolute right-3 top-2.5 w-4 h-4 rounded-full border-2 border-zinc-200 border-t-blue-500 animate-spin" />
                  )}
                </div>

                {showCityDropdown && suggestedCities.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {suggestedCities.map(city => (
                      <div 
                        key={city}
                        className="px-3 py-2 text-[13px] text-gray-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-colors"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setCitySearch(city);
                          setFormData({...formData, locationCity: city});
                          setShowCityDropdown(false);
                        }}
                      >
                        {city}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5 flex justify-between uppercase tracking-wide">
                  <span>Exact Location *</span>
                </label>
                <input 
                  type="text" 
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm mb-2"
                  placeholder="e.g. Mocha Cafe, SG Highway"
                  value={formData.locationExact}
                  onChange={e => setFormData({...formData, locationExact: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5 flex justify-between uppercase tracking-wide">
                  <span>Google Maps Link (Optional)</span>
                </label>
                <input 
                  type="url" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm"
                  placeholder="https://maps.google.com/..."
                  value={formData.mapLink}
                  onChange={e => setFormData({...formData, mapLink: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Pod
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
