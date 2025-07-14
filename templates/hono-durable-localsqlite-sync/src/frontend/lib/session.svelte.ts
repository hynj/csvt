import { client } from './api';

/**
 * Session state management using Svelte 5 runes
 */
export const sessionStore = (() => {
  let sessionId = $state<string | null>(null);
  let hasSession = $state(false);
  let isChecking = $state(false);
  let lastChecked = $state<number | null>(null);

  const checkSession = async (force = false) => {
    // Don't check too frequently unless forced
    if (!force && lastChecked && Date.now() - lastChecked < 5000) {
      return hasSession;
    }

    isChecking = true;
    try {
      const response = await client.auth.session.$get();
      const data = await response.json();
      sessionId = data.sessionId;
      hasSession = data.hasSession;
      lastChecked = Date.now();
      return hasSession;
    } catch (error) {
      console.error('Session check failed:', error);
      sessionId = null;
      hasSession = false;
      return false;
    } finally {
      isChecking = false;
    }
  };

  const createSession = async () => {
    try {
      const response = await client.auth.login.$post();
      const data = await response.json();
      sessionId = data.sessionId;
      hasSession = true;
      lastChecked = Date.now();
      return data;
    } catch (error) {
      console.error('Session creation failed:', error);
      throw error;
    }
  };

  const destroySession = async () => {
    try {
      await client.auth.logout.$post();
      sessionId = null;
      hasSession = false;
      lastChecked = Date.now();
    } catch (error) {
      console.error('Session destruction failed:', error);
      throw error;
    }
  };

  // Check session on initial load
  checkSession();

  return {
    get sessionId() { return sessionId; },
    get hasSession() { return hasSession; },
    get isChecking() { return isChecking; },
    checkSession,
    createSession,
    destroySession,
  };
})();

/**
 * Manual session check function that can be called explicitly
 */
export const checkSessionAndRedirect = async () => {
  const hasValidSession = await sessionStore.checkSession();
  if (!hasValidSession && !window.location.pathname.includes('/login')) {
    window.history.pushState({}, '', '/login');
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
  return hasValidSession;
};