export function sendResponse(res , params) {
  if (!res || typeof res.status !== 'function' || typeof res.json !== 'function') {
    throw new Error('Invalid response object passed to sendResponse');
  }

  const { status, message = '', success = true, data = null } = params;

  if (status < 100 || status > 599) {
    throw new Error('Invalid HTTP status code provided');
  }

  return res.status(status).json({
    message,
    success,
    data
  });
}
