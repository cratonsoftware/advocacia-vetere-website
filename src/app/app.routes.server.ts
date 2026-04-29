import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
	{
		path: '',
		renderMode: RenderMode.Prerender,
	},
	{
		path: 'blog',
		renderMode: RenderMode.Prerender,
	},
	{
		path: 'blog/:slug',
		renderMode: RenderMode.Server,
	},
	{
		path: 'sucesso',
		renderMode: RenderMode.Prerender,
	},
	{
		path: '404',
		renderMode: RenderMode.Prerender,
	},
	{
		path: '**',
		renderMode: RenderMode.Server,
	},
];
