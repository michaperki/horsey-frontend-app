// src/features/chess/mocks/config.js

/**
 * Development mode configuration
 * Enable these flags to make development and testing easier
 */
const config = {
  // When true, enables dev mode for chess games (no server connection required)
  enableDevMode: true,
  
  // When true, completely disables real socket connections
  // This can be overridden by adding ?standalone=true to the URL
  forceStandaloneMode: true,
  
  // When true, logs socket events in the console
  enableSocketLogging: true,
  
  // Default time control for dev games (in minutes)
  defaultTimeControl: 10,
  
  // Default increment for dev games (in seconds)
  defaultIncrement: 5
};

// Check if we should force standalone mode
if (config.forceStandaloneMode && window && window.location && !window.location.search.includes('standalone=')) {
  // Add standalone=true to the URL without reloading the page
  const url = new URL(window.location.href);
  url.searchParams.set('standalone', 'true');
  window.history.replaceState({}, '', url.toString());
  console.log('[Chess] Forced standalone mode enabled');
}

export default config;