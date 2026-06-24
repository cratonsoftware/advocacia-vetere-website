import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DOCUMENT } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { canonicalHref, cleanSeoHead, mockCategoria, provideRenderTestStubs, readJsonLd, TEST_BASE_URL } from '../../testing/seo-dom.helper';
import { CategoriaComponent } from './categoria.component';

/**
 * Render test da rota `/blog/categoria/:slug` (S14) — verifica o `<h1>` com o nome da
 * categoria, a `canonical` self (`/blog/categoria/<slug>`) e os blocos JSON-LD
 * `CollectionPage` + `BreadcrumbList`. Categoria e artigos vêm via HttpTestingController.
 */
describe('CategoriaComponent (render /blog/categoria/:slug)', () => {
	let fixture: ComponentFixture<CategoriaComponent>;
	let httpMock: HttpTestingController;
	let doc: Document;
	const slug = 'familia';

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [CategoriaComponent],
			providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), ...provideRenderTestStubs(), { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ slug }) } } }],
		});
		doc = TestBed.inject(DOCUMENT);
		httpMock = TestBed.inject(HttpTestingController);
		fixture = TestBed.createComponent(CategoriaComponent);
		fixture.detectChanges();

		// 1) categoria pelo slug → 2) (no callback) artigos da categoria.
		httpMock.expectOne((r) => r.url.includes('categories')).flush([mockCategoria({ slug })]);
		httpMock.expectOne((r) => r.url.includes('published_articles')).flush([]);
		fixture.detectChanges();
	});

	afterEach(() => {
		cleanSeoHead(doc);
		fixture.destroy();
	});

	it('renderiza o <h1> com o nome da categoria', () => {
		const h1 = fixture.nativeElement.querySelector('h1');
		expect(h1).toBeTruthy();
		expect(h1.textContent).toContain('Família');
	});

	it('define canonical self para /blog/categoria/<slug>', () => {
		expect(canonicalHref(doc)).toBe(`${TEST_BASE_URL}/blog/categoria/${slug}`);
	});

	it('emite JSON-LD CollectionPage (parte do Blog) + breadcrumb', () => {
		const ld = readJsonLd(doc, 'main');
		expect(ld['@type']).toBe('CollectionPage');
		expect(ld.isPartOf['@type']).toBe('Blog');

		const bc = readJsonLd(doc, 'breadcrumb');
		expect(bc['@type']).toBe('BreadcrumbList');
		expect(bc.itemListElement.length).toBe(3);
	});
});
