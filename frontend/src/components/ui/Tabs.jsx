import { motion } from 'framer-motion';

export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 border-b border-surface-200">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
            active === tab.key ? 'text-primary-700' : 'text-surface-500 hover:text-surface-900'
          }`}
        >
          {tab.label}
          {active === tab.key && (
            <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}
