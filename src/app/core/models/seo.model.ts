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

/** Par pergunta/resposta para o `FAQPage` (S5). */
export interface SeoFaqItem {
	q: string;
	a: string;
}

export interface SeoConfig {
	title: string;
	description: string;
	keywords?: string;
	image?: string;
	/** texto alternativo da imagem → `caption` do `ImageObject`. */
	imageAlt?: string;
	/**
	 * Imagem dedicada de compartilhamento social (og:image/twitter:image) — desacoplada do `image`.
	 * Quando presente (imagem COM template, feita no Canva → coluna `social_image`), vai para as redes,
	 * enquanto o `image` (foto limpa) permanece no `BlogPosting.image`/Google (Discover pede imagem sem texto).
	 */
	ogImage?: string;
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
	/** perguntas frequentes → `FAQPage` em bloco JSON-LD separado (somente quando presente). */
	faq?: SeoFaqItem[];
	/** override de URL canônica (e `og:url`/`@id`) por página — usa o valor cru de `canonicalUrl` do artigo. */
	canonical?: string;
	noIndex?: boolean;
}
