// API-related constants
export const API_ENDPOINTS = {
  PROJECT: '/project',
  SESSION: '/session',
  CONFIG_PROVIDERS: '/config/providers',
  TODO: '/todo',
  MESSAGE: '/message',
  GLOBAL_EVENT: '/global/event'
};

export const API_TIMEOUTS = {
  CONNECTION: 10000, // 10 seconds
  REQUEST: 30000,    // 30 seconds
  SSE_RECONNECT: 30000 // 30 seconds
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};