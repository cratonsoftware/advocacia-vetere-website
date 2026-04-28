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

	{ path: '**', redirectTo: '', pathMatch: 'full' },
];
