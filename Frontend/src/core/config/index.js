export const config = {
  wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:3001',
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  refreshInterval: 30000,
};
