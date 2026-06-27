import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePageTitle } from '../hooks/usePageTitle';

export default function NotFoundPage() {
  usePageTitle('Page not found');

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full text-center"
      >
        <p className="text-7xl font-bold text-primary-600 tracking-tight">404</p>
        <h1 className="mt-4 text-xl font-semibold text-surface-900">Page not found</h1>
        <p className="mt-2 text-sm text-surface-500">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
        >
          Back to home
        </Link>
      </motion.div>
    </div>
  );
}
