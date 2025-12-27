// API client with common functionality
import { getRequestHeaders } from './requestUtils';
import { API_TIMEOUTS } from '../../shared/constants/api';

/**
 * Base API client for HTTP requests
 */
export const apiClient = {
  /**
   * GET request
   * @param {string} url - Request URL
   * @param {Object} options - Request options
   * @param {Object} selectedProject - Selected project for headers
   * @returns {Promise} - Response promise
   */
  async get(url, options = {}, selectedProject = null) {
    const response = await fetch(url, {
      method: 'GET',
      headers: getRequestHeaders(options.headers || {}, selectedProject),
      ...options
    });

    if (!response.ok) {
      throw new Error(`GET ${url} failed: ${response.status} ${response.statusText}`);
    }

    return response;
  },

  /**
   * POST request
   * @param {string} url - Request URL
   * @param {Object} data - Request body data
   * @param {Object} options - Request options
   * @param {Object} selectedProject - Selected project for headers
   * @returns {Promise} - Response promise
   */
  async post(url, data = null, options = {}, selectedProject = null) {
    const response = await fetch(url, {
      method: 'POST',
      headers: getRequestHeaders({
        'Content-Type': 'application/json',
        ...options.headers
      }, selectedProject),
      body: data ? JSON.stringify(data) : undefined,
      ...options
    });

    if (!response.ok) {
      throw new Error(`POST ${url} failed: ${response.status} ${response.statusText}`);
    }

    return response;
  },

  /**
   * PUT request
   * @param {string} url - Request URL
   * @param {Object} data - Request body data
   * @param {Object} options - Request options
   * @param {Object} selectedProject - Selected project for headers
   * @returns {Promise} - Response promise
   */
  async put(url, data = null, options = {}, selectedProject = null) {
    const response = await fetch(url, {
      method: 'PUT',
      headers: getRequestHeaders({
        'Content-Type': 'application/json',
        ...options.headers
      }, selectedProject),
      body: data ? JSON.stringify(data) : undefined,
      ...options
    });

    if (!response.ok) {
      throw new Error(`PUT ${url} failed: ${response.status} ${response.statusText}`);
    }

    return response;
  },

  /**
   * DELETE request
   * @param {string} url - Request URL
   * @param {Object} options - Request options
   * @param {Object} selectedProject - Selected project for headers
   * @returns {Promise} - Response promise
   */
  async delete(url, options = {}, selectedProject = null) {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: getRequestHeaders(options.headers || {}, selectedProject),
      ...options
    });

    if (!response.ok) {
      throw new Error(`DELETE ${url} failed: ${response.status} ${response.statusText}`);
    }

    return response;
  },

  /**
   * Parse JSON response
   * @param {Response} response - Fetch response
   * @returns {Promise} - Parsed JSON
   */
  async parseJSON(response) {
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`Expected JSON response, got ${contentType || 'unknown content-type'}`);
    }
    return response.json();
  }
};