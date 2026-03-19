import React, { useState } from 'react'
import { PodCard } from '../components/ui/PodCard'
import { Calendar, Bell } from 'lucide-react'
import { usePods } from '../context/PodsContext'

const tabs = [
  { id: 'active', label: 'Active' },
  { id: 'planning', label: 'Planning' },
  { id: 'past', label: 'Past' },
]

export default function MyPods() {
  const [activeTab, setActiveTab] = useState('active')
  const { pods, activeFilter, setActiveFilter } = usePods()

  let myJoinedPods = pods.filter(p => p.isJoined)
  if (activeFilter) {
    myJoinedPods = myJoinedPods.filter(p => p.category === activeFilter || p.tags?.includes(activeFilter))
  }
  const filteredPods = myJoinedPods.filter(pod => pod.status === activeTab)
  const activeCount = myJoinedPods.filter(p => p.status === 'active').length
  const planningCount = myJoinedPods.filter(p => p.status === 'planning').length

  return (
    <div className="space-y-8 animate-in fade-in duration-500 delay-100 fill-mode-both max-w-5xl">
      
      {/* Context Summary Header */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between pb-2 bg-zinc-50/40 p-5 rounded-xl border border-zinc-200/80">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-zinc-900 mb-0.5">My Pods</h1>
          <p className="text-[13px] text-zinc-500 font-medium">You have {activeCount} active pods and {planningCount} in planning.</p>
        </div>
        <div className="flex items-center gap-4 text-[13px] font-medium">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-zinc-200/80 text-zinc-700 shadow-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Next activity in 2 days
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-zinc-200/80 text-zinc-700 shadow-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            3 new messages
          </div>
        </div>
      </div>

      {activeFilter && (
        <div className="flex items-center gap-2 mt-[-16px]">
          <span className="text-[13px] text-zinc-500 font-medium">Filtered by tag:</span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium text-zinc-700 bg-zinc-100 border border-zinc-200/80 rounded-md">
            {activeFilter}
            <button 
              onClick={() => setActiveFilter('')} 
              className="text-zinc-400 hover:text-red-500 hover:bg-zinc-200 rounded p-0.5 ml-1 transition-colors"
            >
              ×
            </button>
          </span>
        </div>
      )}

      {/* Tabs Layout */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap py-3 px-1 border-b-[2px] font-medium text-[13px] transition-colors
                  ${isActive
                    ? 'border-zinc-900 text-zinc-900'
                    : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300'
                  }
                `}
              >
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Grid Content - Left aligned using grid rules */}
      {filteredPods.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2 items-start justify-start">
          {filteredPods.map((pod, i) => (
            <PodCard key={i} {...pod} />
          ))}
        </div>
      ) : (
        <div className="py-20 flex flex-col items-start border border-dashed border-zinc-200/80 rounded-xl bg-zinc-50/30 px-8">
          <div className="w-10 h-10 bg-white shadow-sm border border-zinc-200 rounded-[8px] flex items-center justify-center mb-4">
             <span className="text-zinc-400 text-sm font-semibold">0</span>
          </div>
          <h3 className="text-[15px] font-semibold tracking-tight text-zinc-900 mb-0.5">No {activeTab} pods found</h3>
          <p className="text-[13px] text-zinc-500 font-medium">You don't have any {activeTab} pods at the moment.</p>
        </div>
      )}
    </div>
  )
}
