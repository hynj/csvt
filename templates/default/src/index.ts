export default {
  fetch(request: Request) {
    const url = new URL(request.url);
    
    // Handle API routes
    if (url.pathname === '/api/hello') {
      return new Response(JSON.stringify({ 
        message: 'Hello from Cloudflare Workers!',
        timestamp: new Date().toISOString(),
        userAgent: request.headers.get('user-agent')
      }), {
        headers: {
          'content-type': 'application/json',
        },
      });
    }
    
    // Default response for other API routes
    if (url.pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ 
        error: 'API endpoint not found',
        path: url.pathname
      }), {
        status: 404,
        headers: {
          'content-type': 'application/json',
        },
      });
    }
    
    return new Response(`Running in ${navigator.userAgent}!`);
  },
};
