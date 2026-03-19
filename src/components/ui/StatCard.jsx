import React from 'react'
import { Card } from './Card'

export function StatCard({ title, value, trend, icon: Icon, className }) {
  return (
    <Card className={`p-4 sm:p-5 flex flex-col gap-1 border-zinc-200/80 shadow-none hover:border-zinc-300 transition-colors ${className || ''}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
          {title}
        </span>
        {Icon && <Icon className="w-4 h-4 text-zinc-400" />}
      </div>
      
      <div className="flex items-baseline gap-2.5">
        <span className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900">
          {value}
        </span>
        {trend && (
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
            trend.startsWith('+') ? 'bg-emerald-50/50 text-emerald-700' : 'bg-red-50/50 text-red-700'
          }`}>
            {trend}
          </span>
        )}
      </div>
    </Card>
  )
}
