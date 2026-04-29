import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
		pathMatch: 'full',
	},

	{
		path: 'blog',
		loadComponent: () => import('./pages/blog/blog.component').then((m) => m.BlogComponent),
		pathMatch: 'full',
	},
	{
		path: 'blog/:slug',
		loadComponent: () => import('./pages/artigo/artigo.component').then((m) => m.ArtigoComponent),
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
