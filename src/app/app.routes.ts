import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
		title: 'Dra. Maria Fernanda Vetere | Advocacia & Consultoria',
	},

	{
		path: 'blog',
		loadComponent: () => import('./pages/blog-list/blog-list.component').then((m) => m.BlogListComponent),
		title: 'Blog | Dra. Maria Fernanda Vetere',
	},
	{
		path: 'blog/:slug',
		loadComponent: () => import('./pages/blog-post/blog-post.component').then((m) => m.BlogPostComponent),
		title: 'Artigo | Dra. Maria Fernanda Vetere',
	},

	{ path: '**', redirectTo: '', pathMatch: 'full' },
];
