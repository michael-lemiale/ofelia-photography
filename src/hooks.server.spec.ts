import { describe, it, expect, vi } from 'vitest';
import { handle } from './hooks.server';
import type { RequestEvent } from '@sveltejs/kit';

function makeEvent(pathname: string): RequestEvent {
	return { url: new URL(`https://ofeliaemephoto.com${pathname}`) } as RequestEvent;
}

describe('redirects', () => {
	it('301s /work to /', async () => {
		const resolve = vi.fn();
		const response = await handle({ event: makeEvent('/work'), resolve });

		expect(response.status).toBe(301);
		expect(response.headers.get('location')).toBe('/');
		expect(resolve).not.toHaveBeenCalled();
	});

	it('301s /work/spaces to /travel', async () => {
		const resolve = vi.fn();
		const response = await handle({ event: makeEvent('/work/spaces'), resolve });

		expect(response.status).toBe(301);
		expect(response.headers.get('location')).toBe('/travel');
		expect(resolve).not.toHaveBeenCalled();
	});

	it('301s /work/ (trailing slash) to /', async () => {
		const resolve = vi.fn();
		const response = await handle({ event: makeEvent('/work/'), resolve });

		expect(response.status).toBe(301);
		expect(response.headers.get('location')).toBe('/');
		expect(resolve).not.toHaveBeenCalled();
	});

	it('301s /work/spaces/ (trailing slash) to /travel', async () => {
		const resolve = vi.fn();
		const response = await handle({ event: makeEvent('/work/spaces/'), resolve });

		expect(response.status).toBe(301);
		expect(response.headers.get('location')).toBe('/travel');
		expect(resolve).not.toHaveBeenCalled();
	});

	it('leaves other paths alone', async () => {
		const resolve = vi.fn(async () => new Response('ok'));
		const response = await handle({ event: makeEvent('/travel'), resolve });

		expect(resolve).toHaveBeenCalled();
		expect(response.status).toBe(200);
	});
});

describe('/work/events headers', () => {
	it('sets X-Robots-Tag: noindex, nofollow', async () => {
		const resolve = vi.fn(async () => new Response('ok'));
		const response = await handle({ event: makeEvent('/work/events'), resolve });

		expect(response.headers.get('X-Robots-Tag')).toBe('noindex, nofollow');
	});

	it('sets the header on /work/events/ (trailing slash) too', async () => {
		const resolve = vi.fn(async () => new Response('ok'));
		const response = await handle({ event: makeEvent('/work/events/'), resolve });

		expect(response.headers.get('X-Robots-Tag')).toBe('noindex, nofollow');
	});

	it('does not set the header on other routes', async () => {
		const resolve = vi.fn(async () => new Response('ok'));
		const response = await handle({ event: makeEvent('/travel'), resolve });

		expect(response.headers.get('X-Robots-Tag')).toBeNull();
	});
});
