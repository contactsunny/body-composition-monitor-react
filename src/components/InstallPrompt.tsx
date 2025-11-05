import { useState, useEffect } from 'react';
import { setupInstallPrompt, isStandalone } from '../utils/pwa';
import { XMarkIcon } from '@heroicons/react/24/outline';

const InstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [installFunction, setInstallFunction] = useState<(() => void) | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Don't show if already installed or dismissed
    if (isStandalone() || isDismissed) {
      return;
    }

    // Check if user has previously dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Setup the install prompt
    setupInstallPrompt((promptFn) => {
      setInstallFunction(() => promptFn);
      // Show the banner after a short delay
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000); // Show after 3 seconds
    });
  }, [isDismissed]);

  const handleInstall = () => {
    if (installFunction) {
      installFunction();
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setIsDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  const handleMaybeLater = () => {
    setShowPrompt(false);
    // Don't set dismissed in localStorage, so it can show again on next visit
  };

  if (!showPrompt || !installFunction) {
    return null;
  }

  return (
    <>
      {/* Mobile Bottom Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-2xl">
          <div className="relative p-4">
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Dismiss"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
            
            <div className="flex items-start gap-3 pr-8">
              <div className="flex-shrink-0 mt-1">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg mb-1">Install Body Comp App</h3>
                <p className="text-sm text-white/90 mb-3">
                  Get quick access and work offline. Install now for a better experience!
                </p>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleInstall}
                    className="flex-1 bg-white text-indigo-600 font-semibold py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors shadow-md"
                  >
                    Install
                  </button>
                  <button
                    onClick={handleMaybeLater}
                    className="flex-1 bg-white/20 backdrop-blur-sm text-white font-semibold py-2 px-4 rounded-lg hover:bg-white/30 transition-colors"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Banner */}
      <div className="fixed top-4 right-4 z-50 hidden md:block">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-96 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="font-bold text-white text-lg">Install App</h3>
              </div>
              <button
                onClick={handleDismiss}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Dismiss"
              >
                <XMarkIcon className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Install Body Composition Monitor for quick access and offline functionality. 
              Track your progress anytime, anywhere!
            </p>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Works offline</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Fast and reliable</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>No app store needed</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                Install Now
              </button>
              <button
                onClick={handleMaybeLater}
                className="px-4 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstallPrompt;

