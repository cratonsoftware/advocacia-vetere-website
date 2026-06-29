import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { SeoConfig } from '../models/seo.model';
import { SeoService } from './seo.service';

/**
 * Smoke tests do SeoService (S8) — protegem o coração do SEO: montagem de
 * meta tags, canonical e os múltiplos blocos JSON-LD (`main`/`breadcrumb`/`faq`)
 * por tipo de página. Não buscam cobertura total; cobrem os caminhos sensíveis.
 */
describe('SeoService', () => {
	let service: SeoService;
	let meta: Meta;
	let title: Title;
	let doc: Document;

	const baseUrl = 'https://www.mfernandavetere.adv.br';

	/** Lê e faz parse do bloco JSON-LD identificado por `data-seo`. */
	function readJsonLd(id: string): any {
		const script = doc.querySelector(`script[type="application/ld+json"][data-seo="${id}"]`);
		return script ? JSON.parse(script.textContent || '{}') : null;
	}

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(SeoService);
		meta = TestBed.inject(Meta);
		title = TestBed.inject(Title);
		doc = TestBed.inject(DOCUMENT);
	});

	afterEach(() => {
		// Evita vazamento de tags/JSON-LD entre os testes (todos compartilham o mesmo <head>).
		doc.querySelectorAll('script[type="application/ld+json"][data-seo]').forEach((el) => el.remove());
		doc.querySelector('link[rel="canonical"]')?.remove();
	});

	it('deve ser criado', () => {
		expect(service).toBeTruthy();
	});

	it('monta título, description e Open Graph básicos', () => {
		const config: SeoConfig = { title: 'Página de Teste', description: 'Descrição de teste para SEO.' };
		service.updateMetaTags(config);

		expect(title.getTitle()).toBe('Página de Teste | Dra. Maria Fernanda Vetere');
		expect(meta.getTag('name="description"')?.content).toBe('Descrição de teste para SEO.');
		expect(meta.getTag('property="og:title"')?.content).toBe('Página de Teste | Dra. Maria Fernanda Vetere');
		expect(meta.getTag('property="og:locale"')?.content).toBe('pt_BR');
		expect(meta.getTag('name="twitter:card"')?.content).toBe('summary_large_image');
	});

	it('define a canonical a partir do slug', () => {
		service.updateMetaTags({ title: 'Blog', description: 'd', slug: 'blog' });
		expect(doc.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(`${baseUrl}/blog`);
	});

	it('respeita o override de canonical (e og:url)', () => {
		const canonical = 'https://exemplo.com/canonica';
		service.updateMetaTags({ title: 'Artigo', description: 'd', slug: 'blog/x', type: 'article', canonical });
		expect(doc.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(canonical);
		expect(meta.getTag('property="og:url"')?.content).toBe(canonical);
	});

	it('aplica robots noindex quando noIndex=true', () => {
		service.updateMetaTags({ title: 'Sucesso', description: 'd', slug: 'sucesso', noIndex: true });
		expect(meta.getTag('name="robots"')?.content).toBe('noindex, nofollow');
	});

	it('emite BlogPosting para type=article com autor e datas', () => {
		const config: SeoConfig = {
			title: 'Meu Artigo',
			description: 'Resumo do artigo.',
			slug: 'blog/meu-artigo',
			type: 'article',
			publishedDate: '2026-06-18T00:00:00.000Z',
			modifiedDate: '2026-06-20T00:00:00.000Z',
			articleSection: 'Família',
			authorPerson: { name: 'Dra. Maria Fernanda Vetere', jobTitle: 'Advogada', oab: 'OAB/SP 527.527', sameAs: ['https://instagram.com/mfernandavetere'] },
		};
		service.updateMetaTags(config);

		const ld = readJsonLd('main');
		expect(ld['@type']).toBe('BlogPosting');
		expect(ld.datePublished).toBe('2026-06-18T00:00:00.000Z');
		expect(ld.dateModified).toBe('2026-06-20T00:00:00.000Z');
		expect(ld.articleSection).toBe('Família');
		expect(ld.author['@type']).toBe('Person');
		expect(ld.author.identifier).toBe('OAB/SP 527.527');
		expect(ld.author.sameAs).toContain('https://instagram.com/mfernandavetere');
		expect(meta.getTag('property="article:published_time"')?.content).toBe('2026-06-18T00:00:00.000Z');

		// O publisher (LegalService) deve trazer os campos recomendados do rich result de
		// Local Business (telephone/priceRange/address/image) — senão o Rich Results Test
		// acusa "non-critical issues" (corrigido em 2026-06-29).
		expect(ld.publisher['@type']).toBe('LegalService');
		expect(ld.publisher['@id']).toBe(`${baseUrl}/#legalservice`);
		expect(ld.publisher.telephone).toBeTruthy();
		expect(ld.publisher.priceRange).toBeTruthy();
		expect(ld.publisher.address.addressLocality).toBe('Tambaú');
		expect(ld.publisher.image).toBeTruthy();
	});

	it('emite LegalService rico na home (sem slug)', () => {
		service.updateMetaTags({ title: 'Home', description: 'd' });
		const ld = readJsonLd('main');
		expect(ld['@type']).toBe('LegalService');
		expect(ld.telephone).toBeTruthy();
		expect(ld.geo['@type']).toBe('GeoCoordinates');
		expect(ld.openingHoursSpecification.length).toBe(2);
		expect(ld.address.addressLocality).toBe('Tambaú');
	});

	it('emite Blog para o slug "blog"', () => {
		service.updateMetaTags({ title: 'Blog', description: 'd', slug: 'blog' });
		expect(readJsonLd('main')['@type']).toBe('Blog');
	});

	it('emite CollectionPage para páginas de categoria', () => {
		service.updateMetaTags({ title: 'Família', description: 'd', slug: 'blog/categoria/familia' });
		const ld = readJsonLd('main');
		expect(ld['@type']).toBe('CollectionPage');
		expect(ld.isPartOf['@type']).toBe('Blog');
	});

	it('emite ProfilePage com Person para type=profile', () => {
		service.updateMetaTags({
			title: 'Dra. Maria Fernanda Vetere',
			description: 'Bio.',
			slug: 'autor/maria-fernanda-vetere',
			type: 'profile',
			authorPerson: { name: 'Dra. Maria Fernanda Vetere', jobTitle: 'Advogada', oab: 'OAB/SP 527.527', sameAs: ['https://instagram.com/mfernandavetere'] },
		});
		const ld = readJsonLd('main');
		expect(ld['@type']).toBe('ProfilePage');
		expect(ld.mainEntity['@type']).toBe('Person');
		expect(ld.mainEntity.identifier).toBe('OAB/SP 527.527');
	});

	it('injeta e remove o bloco BreadcrumbList conforme presença', () => {
		service.updateMetaTags({
			title: 'Artigo',
			description: 'd',
			slug: 'blog/x',
			type: 'article',
			breadcrumbs: [
				{ name: 'Início', url: `${baseUrl}/` },
				{ name: 'Blog', url: `${baseUrl}/blog` },
			],
		});
		const ld = readJsonLd('breadcrumb');
		expect(ld['@type']).toBe('BreadcrumbList');
		expect(ld.itemListElement.length).toBe(2);
		expect(ld.itemListElement[0].position).toBe(1);

		// Sem breadcrumbs → o bloco deve ser removido.
		service.updateMetaTags({ title: 'Home', description: 'd' });
		expect(readJsonLd('breadcrumb')).toBeNull();
	});

	it('injeta e remove o bloco FAQPage conforme presença', () => {
		service.updateMetaTags({
			title: 'Artigo',
			description: 'd',
			slug: 'blog/x',
			type: 'article',
			faq: [{ q: 'Pergunta?', a: 'Resposta.' }],
		});
		const ld = readJsonLd('faq');
		expect(ld['@type']).toBe('FAQPage');
		expect(ld.mainEntity[0]['@type']).toBe('Question');
		expect(ld.mainEntity[0].acceptedAnswer.text).toBe('Resposta.');

		service.updateMetaTags({ title: 'Home', description: 'd' });
		expect(readJsonLd('faq')).toBeNull();
	});
});
