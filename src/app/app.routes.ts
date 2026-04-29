import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
		pathMatch: 'full',
	},

	{
		path: 'blog',
		loadComponent: () => import('./pages/blog-list/blog-list.component').then((m) => m.BlogListComponent),
		pathMatch: 'full',
	},
	{
		path: 'blog/:slug',
		loadComponent: () => import('./pages/blog-post/blog-post.component').then((m) => m.BlogPostComponent),
	},

	{
		path: 'sucesso',
		loadComponent: () => import('./pages/sucesso/sucesso.component').then((m) => m.SucessoComponent),
	},

	{
		path: '404',
		loadComponent: () => import('./pages/not-found/not-found.component').then((m) => m.NotFoundComponent),
	},

	{ path: '**', loadComponent: () => import('./pages/not-found/not-found.component').then((m) => m.NotFoundComponent) },
];
