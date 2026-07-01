import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DOCUMENT } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideMarkdown } from 'ngx-markdown';
import { of } from 'rxjs';
import { canonicalHref, cleanSeoHead, mockArtigo, provideRenderTestStubs, readJsonLd, TEST_BASE_URL } from '../../testing/seo-dom.helper';
import { ArtigoComponent } from './artigo.component';

/**
 * Render test da rota `/blog/:slug` (S14) — verifica o `<h1>` com o título do artigo,
 * a `canonical` self (`/blog/<slug>`) e os blocos JSON-LD `BlogPosting` + `BreadcrumbList`.
 * O artigo é entregue via HttpTestingController; o `slug` vem de um `ActivatedRoute` stub.
 */
describe('ArtigoComponent (render /blog/:slug)', () => {
	let fixture: ComponentFixture<ArtigoComponent>;
	let httpMock: HttpTestingController;
	let doc: Document;
	const slug = 'artigo-de-teste';

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [ArtigoComponent],
			providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), provideMarkdown(), ...provideRenderTestStubs(), { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ slug })), snapshot: { paramMap: convertToParamMap({ slug }) } } }],
		});
		doc = TestBed.inject(DOCUMENT);
		httpMock = TestBed.inject(HttpTestingController);
		fixture = TestBed.createComponent(ArtigoComponent);
		fixture.detectChanges();

		const req = httpMock.expectOne((r) => r.url.includes('published_articles'));
		req.flush([mockArtigo({ slug })]);
		fixture.detectChanges();
	});

	afterEach(() => {
		cleanSeoHead(doc);
		fixture.destroy();
	});

	it('renderiza o <h1> com o título do artigo', () => {
		const h1 = fixture.nativeElement.querySelector('h1');
		expect(h1).toBeTruthy();
		expect(h1.textContent).toContain('Título do Artigo de Teste');
	});

	it('define canonical self para /blog/<slug>', () => {
		expect(canonicalHref(doc)).toBe(`${TEST_BASE_URL}/blog/${slug}`);
	});

	it('emite JSON-LD BlogPosting com autor (E-E-A-T)', () => {
		const ld = readJsonLd(doc, 'main');
		expect(ld['@type']).toBe('BlogPosting');
		expect(ld.author['@type']).toBe('Person');
		expect(ld.author.identifier).toBe('OAB/SP 527.527');
	});

	it('emite o bloco BreadcrumbList (Início › Blog › Artigo)', () => {
		const ld = readJsonLd(doc, 'breadcrumb');
		expect(ld['@type']).toBe('BreadcrumbList');
		expect(ld.itemListElement.length).toBe(3);
	});
});
