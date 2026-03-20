import React, { useState } from 'react'
import { Search, Command } from 'lucide-react'
import { SocialPodCard } from '../components/ui/SocialPodCard'
import { usePods } from '../context/PodsContext'
import { useSearchParams } from 'react-router-dom'

export default function Home() {
  const { pods, activeFilter, setActiveFilter } = usePods()
  const [searchParams, setSearchParams] = useSearchParams()
  const dateFilter = searchParams.get('date')
  const textSearchParam = searchParams.get('search')
  
  // Local advanced filters
  const [categoryFilter, setCategoryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [tagsFilter, setTagsFilter] = useState('');
  const [minAgeFilter, setMinAgeFilter] = useState('');
  const [maxAgeFilter, setMaxAgeFilter] = useState('');
  const [minTrustScoreFilter, setMinTrustScoreFilter] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState(false);
  const [minMembersFilter, setMinMembersFilter] = useState('');
  const [maxMembersFilter, setMaxMembersFilter] = useState('');
  const [timeRangeFilter, setTimeRangeFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Get recommended pods
  let recommendedActivities = [...pods];
  
  // If no explicit date or search is applied, filter out joined pods to act as a pure discover feed
  if (!dateFilter && !textSearchParam) {
     recommendedActivities = recommendedActivities.filter(p => !p.isJoined)
  }
  if (activeFilter) {
    recommendedActivities = recommendedActivities.filter(p => 
      p.category === activeFilter || p.tags?.includes(activeFilter)
    )
  }

  if (dateFilter) {
    recommendedActivities = recommendedActivities.filter(p => {
      if (!p.date) return false;
      const d = new Date(p.date);
      const podDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return podDateStr === dateFilter;
    });
  }

  if (textSearchParam) {
    const q = textSearchParam.toLowerCase();
    recommendedActivities = recommendedActivities.filter(p => 
      p.title.toLowerCase().includes(q) || 
      p.category.toLowerCase().includes(q) || 
      p.tags?.some(t => t.toLowerCase().includes(q))
    );
  }

  if (categoryFilter) {
    recommendedActivities = recommendedActivities.filter(p => p.category === categoryFilter);
  }

  if (locationFilter) {
    recommendedActivities = recommendedActivities.filter(p => p.location?.toLowerCase().includes(locationFilter.toLowerCase()));
  }

  if (tagsFilter) {
    const searchTags = tagsFilter.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
    recommendedActivities = recommendedActivities.filter(p => 
      searchTags.some(t => p.tags?.some(pt => pt.toLowerCase().includes(t)))
    );
  }

  if (minAgeFilter) {
    recommendedActivities = recommendedActivities.filter(p => (p.minAge || 18) >= parseInt(minAgeFilter));
  }

  if (maxAgeFilter) {
    recommendedActivities = recommendedActivities.filter(p => (p.maxAge || 100) <= parseInt(maxAgeFilter));
  }

  if (minTrustScoreFilter) {
    recommendedActivities = recommendedActivities.filter(p => (p.minTrustScore || 0) >= parseInt(minTrustScoreFilter));
  }

  if (verifiedFilter) {
    recommendedActivities = recommendedActivities.filter(p => p.requireVerified === true);
  }

  if (minMembersFilter) {
    recommendedActivities = recommendedActivities.filter(p => p.maxMembers >= parseInt(minMembersFilter));
  }

  if (maxMembersFilter) {
    recommendedActivities = recommendedActivities.filter(p => p.maxMembers <= parseInt(maxMembersFilter));
  }

  if (timeRangeFilter) {
    recommendedActivities = recommendedActivities.filter(p => {
      if (!p.date) return false;
      const hour = new Date(p.date).getHours();
      if (timeRangeFilter === 'Morning') return hour >= 5 && hour < 12;
      if (timeRangeFilter === 'Afternoon') return hour >= 12 && hour < 17;
      if (timeRangeFilter === 'Evening') return hour >= 17 && hour < 22;
      if (timeRangeFilter === 'Night') return hour >= 22 || hour < 5;
      return true;
    });
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 delay-75 fill-mode-both pb-12 max-w-5xl mx-auto">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-zinc-100">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 mb-2">Discover</h1>
          <p className="text-[15px] text-zinc-500 font-medium">Find your next favorite activity and meet the community.</p>
        </div>
        
        {/* Omnibar Trigger Button */}
        <button 
          className="flex items-center w-full md:w-72 px-4 py-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/80 hover:border-zinc-300 rounded-lg text-[13px] font-medium text-zinc-500 transition-all shadow-sm"
          onClick={() => window.dispatchEvent(new CustomEvent('open-omnibar'))}
        >
          <Search className="w-4 h-4 mr-2.5 text-zinc-400" />
          <span>Search...</span>
        </button>
      </div>

      {/* Filter Panel */}
      <div className="flex flex-col gap-4 mt-[-16px]">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-1.5 text-[13px] font-semibold rounded-md border transition-colors shadow-sm cursor-pointer ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'}`}
          >
            {showFilters ? 'Hide Filters' : 'Advanced Filters'}
          </button>
          
          {(activeFilter || dateFilter || textSearchParam || categoryFilter || locationFilter || tagsFilter || minAgeFilter || maxAgeFilter || minTrustScoreFilter || verifiedFilter || minMembersFilter || maxMembersFilter || timeRangeFilter) && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[13px] text-zinc-500 font-medium">Active:</span>
              
              {textSearchParam && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium text-zinc-700 bg-zinc-100 border border-zinc-200/80 rounded-md shadow-sm">
                  Search: "{textSearchParam}"
                  <button onClick={() => { 
                    const newParams = new URLSearchParams(searchParams);
                    newParams.delete('search');
                    setSearchParams(newParams); 
                  }} className="text-zinc-400 hover:text-red-500 hover:bg-zinc-200 rounded p-0.5 ml-1 transition-colors cursor-pointer">×</button>
                </span>
              )}
              {activeFilter && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium text-zinc-700 bg-zinc-100 border border-zinc-200/80 rounded-md shadow-sm">
                  Tag: {activeFilter}
                  <button onClick={() => setActiveFilter('')} className="text-zinc-400 hover:text-red-500 hover:bg-zinc-200 rounded p-0.5 ml-1 transition-colors cursor-pointer">×</button>
                </span>
              )}
              {dateFilter && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium text-zinc-700 bg-blue-50 border border-blue-200/80 rounded-md shadow-sm">
                  Date: {dateFilter}
                  <button onClick={() => { 
                    const newParams = new URLSearchParams(searchParams);
                    newParams.delete('date');
                    setSearchParams(newParams); 
                  }} className="text-blue-400 hover:text-red-500 hover:bg-blue-100 rounded p-0.5 ml-1 transition-colors cursor-pointer">×</button>
                </span>
              )}
              {categoryFilter && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium text-purple-700 bg-purple-50 border border-purple-200/80 rounded-md shadow-sm">
                  Category: {categoryFilter}
                  <button onClick={() => setCategoryFilter('')} className="text-purple-400 hover:text-red-500 hover:bg-purple-100 rounded p-0.5 ml-1 transition-colors cursor-pointer">×</button>
                </span>
              )}
              {locationFilter && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium text-green-700 bg-green-50 border border-green-200/80 rounded-md shadow-sm">
                  Location: {locationFilter}
                  <button onClick={() => setLocationFilter('')} className="text-green-400 hover:text-red-500 hover:bg-green-100 rounded p-0.5 ml-1 transition-colors cursor-pointer">×</button>
                </span>
              )}
              {tagsFilter && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium text-orange-700 bg-orange-50 border border-orange-200/80 rounded-md shadow-sm">
                  Tags: {tagsFilter}
                  <button onClick={() => setTagsFilter('')} className="text-orange-400 hover:text-red-500 hover:bg-orange-100 rounded p-0.5 ml-1 transition-colors cursor-pointer">×</button>
                </span>
              )}
              {verifiedFilter && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium text-indigo-700 bg-indigo-50 border border-indigo-200/80 rounded-md shadow-sm">
                  Verified Only
                  <button onClick={() => setVerifiedFilter(false)} className="text-indigo-400 hover:text-red-500 hover:bg-indigo-100 rounded p-0.5 ml-1 transition-colors cursor-pointer">×</button>
                </span>
              )}
              {(minAgeFilter || maxAgeFilter) && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium text-teal-700 bg-teal-50 border border-teal-200/80 rounded-md shadow-sm">
                  Age: {minAgeFilter || 'any'} - {maxAgeFilter || 'any'}
                  <button onClick={() => { setMinAgeFilter(''); setMaxAgeFilter(''); }} className="text-teal-400 hover:text-red-500 hover:bg-teal-100 rounded p-0.5 ml-1 transition-colors cursor-pointer">×</button>
                </span>
              )}
              {minTrustScoreFilter && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium text-pink-700 bg-pink-50 border border-pink-200/80 rounded-md shadow-sm">
                  Score {'>='} {minTrustScoreFilter}
                  <button onClick={() => setMinTrustScoreFilter('')} className="text-pink-400 hover:text-red-500 hover:bg-pink-100 rounded p-0.5 ml-1 transition-colors cursor-pointer">×</button>
                </span>
              )}
              {(minMembersFilter || maxMembersFilter) && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium text-cyan-700 bg-cyan-50 border border-cyan-200/80 rounded-md shadow-sm">
                  Members: {minMembersFilter || '0'} - {maxMembersFilter || 'max'}
                  <button onClick={() => { setMinMembersFilter(''); setMaxMembersFilter(''); }} className="text-cyan-400 hover:text-red-500 hover:bg-cyan-100 rounded p-0.5 ml-1 transition-colors cursor-pointer">×</button>
                </span>
              )}
              {timeRangeFilter && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium text-amber-700 bg-amber-50 border border-amber-200/80 rounded-md shadow-sm">
                  Time: {timeRangeFilter}
                  <button onClick={() => setTimeRangeFilter('')} className="text-amber-400 hover:text-red-500 hover:bg-amber-100 rounded p-0.5 ml-1 transition-colors cursor-pointer">×</button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Expanded Filters UI */}
        {showFilters && (
          <div className="p-5 bg-zinc-50 border border-zinc-200/80 rounded-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-in slide-in-from-top-2 duration-200">
            <div>
              <label className="block text-[12px] font-bold text-zinc-600 uppercase tracking-wider mb-1.5">Category</label>
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] text-zinc-700 shadow-sm focus:outline-none focus:border-blue-400"
              >
                <option value="">All Categories</option>
                <option value="Sports">Sports</option>
                <option value="Design">Design</option>
                <option value="Engineering">Engineering</option>
                <option value="Social">Social</option>
                <option value="Gaming">Gaming</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-bold text-zinc-600 uppercase tracking-wider mb-1.5">Location</label>
              <input 
                type="text" 
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                placeholder="e.g. Mumbai..."
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] text-zinc-700 shadow-sm focus:outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-zinc-600 uppercase tracking-wider mb-1.5">Tags</label>
              <input 
                type="text" 
                value={tagsFilter}
                onChange={(e) => setTagsFilter(e.target.value)}
                placeholder="e.g. Hiking, Outdoors..."
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] text-zinc-700 shadow-sm focus:outline-none focus:border-blue-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-bold text-zinc-600 uppercase tracking-wider mb-1.5">Min Age</label>
                <input type="number" min="18" value={minAgeFilter} onChange={e => setMinAgeFilter(e.target.value)} className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] text-zinc-700 shadow-sm focus:outline-none" placeholder="18" />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-zinc-600 uppercase tracking-wider mb-1.5">Max Age</label>
                <input type="number" min="18" value={maxAgeFilter} onChange={e => setMaxAgeFilter(e.target.value)} className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] text-zinc-700 shadow-sm focus:outline-none" placeholder="100" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-bold text-zinc-600 uppercase tracking-wider mb-1.5">Min Members</label>
                <input type="number" min="0" value={minMembersFilter} onChange={e => setMinMembersFilter(e.target.value)} className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] text-zinc-700 shadow-sm focus:outline-none" placeholder="2" />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-zinc-600 uppercase tracking-wider mb-1.5">Max Members</label>
                <input type="number" min="0" value={maxMembersFilter} onChange={e => setMaxMembersFilter(e.target.value)} className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] text-zinc-700 shadow-sm focus:outline-none" placeholder="50" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-bold text-zinc-600 uppercase tracking-wider mb-1.5">Time Range</label>
                <select value={timeRangeFilter} onChange={e => setTimeRangeFilter(e.target.value)} className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] text-zinc-700 shadow-sm focus:outline-none">
                  <option value="">Any Time</option>
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Evening">Evening</option>
                  <option value="Night">Night</option>
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-bold text-zinc-600 uppercase tracking-wider mb-1.5">Trust / Verif.</label>
                <div className="flex items-center gap-2 mt-1 relative">
                  <input type="number" min="0" value={minTrustScoreFilter} onChange={e => setMinTrustScoreFilter(e.target.value)} className="w-[80px] px-3 py-1.5 bg-white border border-zinc-200 rounded-md text-[13px] text-zinc-700 shadow-sm focus:outline-none" placeholder="Score+" title="Minimum Trust Score" />
                  <div className="flex items-center ml-1">
                    <input type="checkbox" id="vFilter" checked={verifiedFilter} onChange={e => setVerifiedFilter(e.target.checked)} className="mr-1.5" />
                    <label htmlFor="vFilter" className="text-[11px] font-bold text-zinc-600" title="Only verified pods">Verif.</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recommended Pods Section */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-5">
          <div className="space-y-0.5">
            <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
              Recommended For You
            </h2>
            <p className="text-[13px] text-zinc-500 font-medium">Discover activities happening around you</p>
          </div>
          <button className="text-[13px] font-semibold text-zinc-900 hover:text-black border border-zinc-200 px-3 py-1.5 rounded-md hover:bg-zinc-50 transition-colors">
            View All
          </button>
        </div>
        
        {/* Using auto-rows to allow the featured card to expand correctly if needed, and dense packing */}
        {recommendedActivities.length === 0 ? (
          (()=>{
            const areFiltersApplied = !!(
              activeFilter || dateFilter || textSearchParam || categoryFilter || 
              locationFilter || tagsFilter || minAgeFilter || maxAgeFilter || 
              minTrustScoreFilter || verifiedFilter || minMembersFilter || 
              maxMembersFilter || timeRangeFilter
            );

            return (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center border border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
                <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-zinc-400" />
                </div>
                <h3 className="text-[15px] font-semibold text-zinc-900 mb-1">No activities found</h3>
                
                {areFiltersApplied ? (
                  <>
                    <p className="text-[13px] text-zinc-500 max-w-sm">
                      We couldn't find any pods matching your current filters. Try adjusting your search criteria or modifying your tags.
                    </p>
                    <button 
                      onClick={() => {
                        setCategoryFilter(''); setLocationFilter(''); setTagsFilter('');
                        setMinAgeFilter(''); setMaxAgeFilter(''); setMinTrustScoreFilter('');
                        setVerifiedFilter(false); setMinMembersFilter(''); setMaxMembersFilter('');
                        setTimeRangeFilter(''); setActiveFilter('');
                        setSearchParams({});
                      }}
                      className="mt-6 px-4 py-2 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-[13px] font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                    >
                      Clear All Filters
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-[13px] text-zinc-500 max-w-sm">
                      There are currently no physical activities or digital meetups available in your network area right now.
                    </p>
                    <button 
                      onClick={() => document.dispatchEvent(new CustomEvent('open-create-pod'))}
                      className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                    >
                      Be the First to Create a Pod
                    </button>
                  </>
                )}
              </div>
            );
          })()
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 grid-flow-row-dense">
            {recommendedActivities.map((pod) => (
              <SocialPodCard key={pod.id} {...pod} joined={pod.membersCount} spotsLeft={pod.spotsLeft} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
