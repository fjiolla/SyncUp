import { Component } from 'react';
import { HiOutlineExclamationTriangle } from 'react-icons/hi2';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Application error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-surface-50 p-4">
          <div className="max-w-md w-full bg-white border border-surface-200 rounded-xl p-8 text-center">
            <div className="w-12 h-12 mx-auto bg-red-50 rounded-full flex items-center justify-center text-red-600 mb-4">
              <HiOutlineExclamationTriangle className="w-6 h-6" />
            </div>
            <h1 className="text-lg font-semibold text-surface-900">Something went wrong</h1>
            <p className="mt-1 text-sm text-surface-500">
              We hit an unexpected error. Please try again.
            </p>
            <button
              onClick={this.handleReset}
              className="mt-6 px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              Back to home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
