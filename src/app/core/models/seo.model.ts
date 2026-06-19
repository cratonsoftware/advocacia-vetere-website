/** Dados de autor (Person) para o JSON-LD de artigos — E-E-A-T. */
export interface SeoAuthor {
	name: string;
	jobTitle?: string;
	/** número da OAB → `identifier` no schema. */
	oab?: string;
	url?: string;
	sameAs?: string[];
}

/** Item de trilha para o `BreadcrumbList`. */
export interface SeoBreadcrumb {
	name: string;
	/** URL absoluta da posição na trilha. */
	url: string;
}

export interface SeoConfig {
	title: string;
	description: string;
	keywords?: string;
	image?: string;
	/** texto alternativo da imagem → `caption` do `ImageObject`. */
	imageAlt?: string;
	slug?: string;
	type?: 'website' | 'article' | 'profile';
	/** nome do autor (string) — mantido para `article:author`/fallback. */
	author?: string;
	/** entidade de autor (Person) para o JSON-LD do artigo. */
	authorPerson?: SeoAuthor;
	publishedDate?: string;
	modifiedDate?: string;
	/** seção/categoria do artigo → `articleSection`. */
	articleSection?: string;
	/** idioma do conteúdo → `inLanguage` (ex.: `pt-BR`). */
	inLanguage?: string;
	/** trilha de navegação → `BreadcrumbList` (somente quando presente). */
	breadcrumbs?: SeoBreadcrumb[];
	noIndex?: boolean;
}
