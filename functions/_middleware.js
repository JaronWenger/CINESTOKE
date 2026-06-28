export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  const response = await next();

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) return response;

  const path = url.pathname;

  let title = 'CINESTOKE';
  let description = 'Experience videos like never before on Cinestoke';
  let image = 'https://www.cinestoke.com/logo192.png';
  const pageUrl = `https://www.cinestoke.com${path}`;

  if (path.startsWith('/shop')) {
    title = 'CINESTOKE Shop';
    description = 'Video assets, LUTs, Powergrades, overlays, SFX and more from Cinestoke.';
    image = 'https://www.cinestoke.com/logo192.png';
  }

  let html = await response.text();

  html = html
    .replace(/<meta property="og:title"[^>]*\/>/,   `<meta property="og:title" content="${title}" />`)
    .replace(/<meta property="og:description"[^>]*\/>/, `<meta property="og:description" content="${description}" />`)
    .replace(/<meta property="og:image"[^>]*\/>/,   `<meta property="og:image" content="${image}" />`)
    .replace(/<meta property="og:url"[^>]*\/>/,     `<meta property="og:url" content="${pageUrl}" />`);

  const headers = new Headers(response.headers);
  return new Response(html, { status: response.status, headers });
}
