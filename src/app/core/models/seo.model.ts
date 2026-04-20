export interface SeoConfig {
	title: string;
	description: string;
	image?: string;
	slug?: string;
	type?: 'website' | 'article' | 'profile';
	author?: string;
	publishedDate?: string;
	modifiedDate?: string;
}
