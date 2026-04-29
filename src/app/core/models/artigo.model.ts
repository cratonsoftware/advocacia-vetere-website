export interface CategoriaArtigo {
	id: string;
	name: string;
	slug: string;
}

export interface Artigo {
	id: string;
	slug: string;
	title: string;
	excerpt: string;
	content: string;
	coverImage: string;
	readTime: string;
	category: string;
	date: string;
}
