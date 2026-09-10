export const site = {
	name: 'Ofelia Eme Photography',
	url: 'https://ofeliaemephoto.com',
	titleTemplate: '%s | ofelia eme',
	defaultTitle: 'ofelia eme | film & digital photography | paris',
	defaultDescription:
		'Paris-based photographer specializing in fashion and portrait photography — shooting film and digital.',
	location: 'Paris, France',
	social: {
		instagram: 'https://www.instagram.com/ofeliaemephoto/'
	},
	contactEmail: 'studio@ofeliaeme.com',
	defaultOgImage: '/public/default.jpg',
	// Public R2 host, matching wrangler.toml's R2_PUBLIC_URL — used to build
	// the About page portrait src without a server load for one static image.
	imageBaseUrl: 'https://images.ofeliaemephoto.com',
	clients: [] as string[],
	published: [] as string[],
	aboutPortraitKey: ''
} as const;
