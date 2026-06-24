import { IMAGE_LOADER, ImageLoaderConfig, PRECONNECT_CHECK_BLOCKLIST } from '@angular/common';
import { Provider } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { of } from 'rxjs';
import { Artigo, AutorArtigo, CategoriaArtigo } from '../core/models/artigo.model';

/**
 * Utilitários compartilhados pelos render tests das rotas pré-renderizadas (S14).
 *
 * Os testes de render exercem o pipeline completo `componente → template → <head>`:
 * montam a página com dados mockados (Supabase via HttpTestingController) e verificam
 * o `<h1>` renderizado, a `canonical` self e os blocos JSON-LD (`data-seo`) por tipo.
 * Complementam — não substituem — os smoke tests de serviço da S8
 * (`seo.service.spec.ts`/`blog.service.spec.ts`).
 */

/** URL base canônica do site (espelha `SITE_URL` de `site.config.ts`). */
export const TEST_BASE_URL = 'https://www.mfernandavetere.adv.br';

/** PNG 1×1 transparente — usado pelo loader de teste para o NgOptimizedImage não tocar a rede. */
const TRANSPARENT_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

/** Loader de imagem para os testes: ignora o `src` e devolve um PNG transparente (evita 404 de assets). */
export const testImageLoader = (_config: ImageLoaderConfig) => TRANSPARENT_PNG;

/**
 * Providers comuns aos render tests:
 * - `IMAGE_LOADER` que não toca a rede (NgOptimizedImage) → sem 404 de `/assets/...`;
 * - `MatIconRegistry` falso devolvendo um `<svg>` vazio para qualquer nome — em runtime os
 *   SVGs próprios são registrados pelo `AppComponent` (ausente nos specs), então sem ele o
 *   MatIcon logaria "Unable to find icon" para `star`, `whatsapp_logo`, etc.
 * - `PRECONNECT_CHECK_BLOCKLIST` com hostname vazio: o loader devolve um `data:` URI
 *   (hostname `''`), então isso silencia o aviso NG02956 de preconnect para a imagem
 *   `priority` do hero (orientação de produção, irrelevante em teste).
 */
export function provideRenderTestStubs(): Provider[] {
	const emptyIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	return [
		{ provide: IMAGE_LOADER, useValue: testImageLoader },
		{ provide: MatIconRegistry, useValue: { getNamedSvgIcon: () => of(emptyIcon.cloneNode(true)) } as unknown as MatIconRegistry },
		{ provide: PRECONNECT_CHECK_BLOCKLIST, useValue: [''] },
	];
}

/** Lê e faz parse do bloco JSON-LD identificado por `data-seo` no `<head>`. */
export function readJsonLd(doc: Document, id: string): any {
	const script = doc.querySelector(`script[type="application/ld+json"][data-seo="${id}"]`);
	return script ? JSON.parse(script.textContent || '{}') : null;
}

/** `href` atual do `<link rel="canonical">` (ou `null` se ausente). */
export function canonicalHref(doc: Document): string | null {
	return doc.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null;
}

/**
 * Remove JSON-LD (`data-seo`) e a `canonical` do `<head>` entre os testes —
 * todos os specs compartilham o mesmo `document`, então é preciso isolar o estado.
 */
export function cleanSeoHead(doc: Document): void {
	doc.querySelectorAll('script[type="application/ld+json"][data-seo]').forEach((el) => el.remove());
	doc.querySelector('link[rel="canonical"]')?.remove();
}

/** Artigo de teste com os campos que o `ArtigoComponent`/`SeoService` consomem. */
export function mockArtigo(overrides: Partial<Artigo> = {}): Partial<Artigo> {
	return {
		id: '1',
		slug: 'artigo-de-teste',
		title: 'Título do Artigo de Teste',
		excerpt: 'Resumo do artigo de teste para SEO.',
		content: 'Conteúdo do artigo de teste.',
		coverImage: 'https://example.com/capa.png',
		coverImageAlt: 'Capa do artigo de teste',
		readTime: '5 min',
		category: 'Família',
		// Sem `categorySlug` → o componente não dispara a busca de relacionados (mantém o teste focado).
		publishedAt: '2026-06-19 12:00:00+00',
		updatedAt: '2026-06-20 12:00:00+00',
		author: {
			name: 'Dra. Maria Fernanda Vetere',
			role: 'Advogada',
			oab: 'OAB/SP 527.527',
			slug: 'maria-fernanda-vetere',
			avatar: null,
			bio: null,
			sameAs: ['https://instagram.com/mfernandavetere'],
		},
		...overrides,
	};
}

/** Categoria de teste (entidade da tabela `categories`). */
export function mockCategoria(overrides: Partial<CategoriaArtigo> = {}): CategoriaArtigo {
	return { id: '1', name: 'Família', slug: 'familia', ...overrides };
}

/** Autor de teste (entidade E-E-A-T da tabela `authors`). */
export function mockAutor(overrides: Partial<AutorArtigo> = {}): AutorArtigo {
	return {
		name: 'Dra. Maria Fernanda Vetere',
		role: 'Advogada',
		oab: 'OAB/SP 527.527',
		slug: 'maria-fernanda-vetere',
		avatar: null,
		bio: 'Bio da autora de teste.',
		sameAs: ['https://instagram.com/mfernandavetere'],
		...overrides,
	};
}
