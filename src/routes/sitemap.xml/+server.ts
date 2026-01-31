import type { RequestHandler } from '@sveltejs/kit';
import { site } from '$lib/siteConfig';

const routes = ['/', '/portfolio', '/about'];

function toISODate(d = new Date()) {
	return d.toISOString().split('T')[0];
}

export const GET: RequestHandler = async () => {
	const lastmod = toISODate();
	const urls = routes
		.map((path) => {
			const loc = `${site.url}${path === '/' ? '' : path}`;
			return `<url><loc>${loc}</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>${path === '/' ? '1.0' : '0.7'}</priority></url>`;
		})
		.join('');

	const body = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;

	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml'
		}
	});
};
