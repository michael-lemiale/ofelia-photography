/**
 * Server hooks.
 *
 * Redirects the old `/work` overview and `/work/spaces` category to their
 * replacements now that the home page is the work gallery and `spaces`
 * was renamed `travel`. Also flags `/work/events` for exclusion from
 * search indexes at the transport level, since it has no nav link and
 * carries `noindex` meta but bots that ignore meta still respect headers.
 */
import type { Handle } from '@sveltejs/kit';

const REDIRECTS: Record<string, string> = {
	'/work': '/',
	'/work/spaces': '/travel'
};

export const handle: Handle = async ({ event, resolve }) => {
	const pathname = event.url.pathname.replace(/\/$/, '') || '/';
	const redirectTo = REDIRECTS[pathname];
	if (redirectTo) {
		return new Response(null, {
			status: 301,
			headers: { location: redirectTo }
		});
	}

	const response = await resolve(event);

	if (pathname === '/work/events') {
		response.headers.set('X-Robots-Tag', 'noindex, nofollow');
	}

	return response;
};
