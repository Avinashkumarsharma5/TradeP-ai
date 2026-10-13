/**
 * Centralized API client entry point
 * Bridges to src/services/api.ts which utilizes Axios with interceptors and retry helpers.
 */
export * from '../services/api';
export { default } from '../services/api';
