import demoHandlers from './demoHandlers';
import { appConfig } from '@/config/appConfig';

const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

export const createDemoAdapter = () => async (config) => {
  await delay(150);

  // Extract path from config.url
  let path = config.url;
  
  // Remove /api/v1 prefix if present
  if (path.startsWith('/api/v1')) {
    path = path.slice(7); // Remove '/api/v1'
  }
  // Ensure it starts with /
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  
  const method = (config.method || 'get').toLowerCase();
  
  console.log('[DemoAdapter] Request:', { method: method.toUpperCase(), path, url: config.url, data: config.data });
  
  const handler = demoHandlers.resolve(method, path);

  if (!handler) {
    console.warn(`[DemoAdapter] Missing handler for ${method.toUpperCase()} ${path}`);
    return {
      config,
      status: 200,
      statusText: 'OK (Demo Default)',
      headers: {},
      data: { success: true, data: null },
    };
  }

  try {
    const result = await handler({
      config,
      path,
      url: new URL(config.url, window.location.origin),
      method,
    });

    return {
      config,
      status: result?.status || 200,
      statusText: result?.statusText || 'OK (Demo)',
      headers: result?.headers || {},
      data: result?.data ?? result,
    };
  } catch (error) {
    console.error('[DemoAdapter] Handler error', method, path, error);
    return Promise.reject({
      config,
      response: {
        status: 500,
        statusText: 'Demo Handler Error',
        data: {
          success: false,
          message: error.message || 'Demo handler failed',
        },
      },
    });
  }
};

export default createDemoAdapter;
