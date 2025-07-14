import { Workbox } from 'workbox-window';

export interface SwUpdateInfo {
  isUpdateAvailable: boolean;
  skipWaiting: () => void;
  showUpdatePrompt: () => void;
}

/**
 * Register service worker with update handling
 */
export const registerSW = (): Promise<SwUpdateInfo> => {
  return new Promise(async (resolve) => {
    if ('serviceWorker' in navigator) {
      // Check if service worker file exists
      try {
        const response = await fetch('/sw.js', { method: 'HEAD' });
        if (!response.ok) {
          console.log('Service worker file not found, skipping registration');
          resolve({
            isUpdateAvailable: false,
            skipWaiting: () => {},
            showUpdatePrompt: () => {}
          });
          return;
        }
      } catch (error) {
        console.log('Could not check for service worker file:', error);
        resolve({
          isUpdateAvailable: false,
          skipWaiting: () => {},
          showUpdatePrompt: () => {}
        });
        return;
      }

      const wb = new Workbox('/sw.js', {
        scope: '/'
      });
      
      let updateInfo: SwUpdateInfo = {
        isUpdateAvailable: false,
        skipWaiting: () => {},
        showUpdatePrompt: () => {}
      };

      // Handle service worker updates
      wb.addEventListener('waiting', (event) => {
        updateInfo.isUpdateAvailable = true;
        updateInfo.skipWaiting = () => {
          wb.messageSkipWaiting();
        };
        updateInfo.showUpdatePrompt = () => {
          // Show a user-friendly update prompt
          if (confirm('A new version is available. Update now?')) {
            wb.messageSkipWaiting();
          }
        };
        
        // Auto-show update prompt
        updateInfo.showUpdatePrompt();
      });

      // Handle service worker activation
      wb.addEventListener('controlling', (event) => {
        // Reload page when new service worker takes control
        window.location.reload();
      });

      // Register the service worker
      wb.register().then(() => {
        console.log('Service worker registered successfully');
        resolve(updateInfo);
      }).catch((error) => {
        console.error('Service worker registration failed:', error);
        // If registration fails, still resolve with empty updateInfo
        resolve({
          isUpdateAvailable: false,
          skipWaiting: () => {},
          showUpdatePrompt: () => {}
        });
      });
    } else {
      console.log('Service workers are not supported');
      resolve({
        isUpdateAvailable: false,
        skipWaiting: () => {},
        showUpdatePrompt: () => {}
      });
    }
  });
};

/**
 * Check if app is running in standalone mode (installed as PWA)
 */
export const isPWA = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
};

/**
 * Check if app can be installed as PWA
 */
export const canInstallPWA = (): Promise<boolean> => {
  return new Promise((resolve) => {
    let canInstall = false;
    
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      canInstall = true;
      (window as any).pwaInstallPrompt = e;
      resolve(true);
    });
    
    // If no install prompt after 1 second, assume not installable
    setTimeout(() => {
      if (!canInstall) {
        resolve(false);
      }
    }, 1000);
  });
};

/**
 * Show PWA install prompt
 */
export const installPWA = async (): Promise<boolean> => {
  const installPrompt = (window as any).pwaInstallPrompt;
  
  if (!installPrompt) {
    return false;
  }
  
  const result = await installPrompt.prompt();
  const wasInstalled = result.outcome === 'accepted';
  
  if (wasInstalled) {
    (window as any).pwaInstallPrompt = null;
  }
  
  return wasInstalled;
};