export interface CategoriaArtigo {
	id: string;
	name: string;
	slug: string;
}

/** Par pergunta/resposta de FAQ — alimenta a seção visível e o `FAQPage` (S5). */
export interface FaqItem {
	q: string;
	a: string;
}

/** Entidade de autor (E-E-A-T) — exposta pela view `published_articles` como objeto `author` (S3). */
export interface AutorArtigo {
	name: string;
	role: string | null;
	oab: string | null;
	slug: string | null;
	avatar: string | null;
	bio: string | null;
	sameAs: string[] | null;
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
	/** Data de publicação em ISO 8601 (derivada de `publishedAt`) — usar em meta tags e JSON-LD */
	dateIso: string;
	/** Data da última modificação em ISO 8601 (derivada de `updatedAt`) — `dateModified` no JSON-LD */
	updatedAtIso: string;

	// --- Campos de SEO dedicados expostos pela view na S3 (chegam via select=*) ---
	/** `published_at` cru (ISO). Origem do `dateIso`. */
	publishedAt?: string;
	/** `updated_at` cru (ISO). Origem do `updatedAtIso`. */
	updatedAt?: string;
	/** `<title>`/`og:title` dedicado (fallback no banco: `title`). */
	metaTitle?: string;
	/** meta description dedicada (fallback no banco: `excerpt`). */
	metaDescription?: string;
	/** texto alternativo da capa (acessibilidade + SEO de imagem). */
	coverImageAlt?: string;
	/** tags do artigo (keywords no schema + linkagem interna — S5). */
	tags?: string[];
	/** resposta direta (GEO/AEO) exibida no topo do artigo — S5. */
	tldr?: string | null;
	/** perguntas frequentes do artigo → seção visível + `FAQPage` — S5. */
	faq?: FaqItem[] | null;
	/** imagem de compartilhamento COM template (.webp, feita no Canva) → og:image/twitter:image. Fallback: `coverImage`. */
	socialImage?: string | null;
	/** idioma do conteúdo (ex.: `pt-BR`) — `inLanguage` no schema. */
	locale?: string;
	/** slug da categoria — base para `/blog/categoria/:slug` (S5). */
	categorySlug?: string;
	/** override de canonical por artigo (S5/uso fino). */
	canonicalUrl?: string | null;
	/** despublicar dos índices sem deletar. */
	noindex?: boolean;
	/** entidade de autor (E-E-A-T) — `author` Person no JSON-LD. */
	author?: AutorArtigo;
}
