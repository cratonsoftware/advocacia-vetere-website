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
	/** Data formatada para exibição em pt-BR (ex: "19 de Junho de 2026") */
	date: string;
	/** Data original em ISO 8601 (ex: "2026-06-19") — usar em meta tags e JSON-LD */
	dateIso: string;
}
