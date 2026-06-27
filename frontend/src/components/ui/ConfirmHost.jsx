import { motion, AnimatePresence } from 'framer-motion';
import { useConfirmStore } from '../../store/confirmStore';

export default function ConfirmHost() {
  const { open, title, message, confirmLabel, cancelLabel, tone, resolve } = useConfirmStore();

  const confirmClasses = tone === 'danger'
    ? 'bg-red-600 hover:bg-red-700 text-white'
    : 'bg-primary-600 hover:bg-primary-700 text-white';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => resolve(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-sm bg-white rounded-xl shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 pt-6 pb-4">
              <h2 className="text-base font-semibold text-surface-900">{title}</h2>
              {message && <p className="mt-2 text-sm text-surface-500 leading-relaxed">{message}</p>}
            </div>
            <div className="px-6 py-4 bg-surface-50 border-t border-surface-200 flex justify-end gap-2">
              <button
                onClick={() => resolve(false)}
                className="px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-100 rounded-lg transition-colors"
              >
                {cancelLabel}
              </button>
              <button
                onClick={() => resolve(true)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${confirmClasses}`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
