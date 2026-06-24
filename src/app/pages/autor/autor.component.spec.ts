import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DOCUMENT } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { canonicalHref, cleanSeoHead, mockAutor, provideRenderTestStubs, readJsonLd, TEST_BASE_URL } from '../../testing/seo-dom.helper';
import { AutorComponent } from './autor.component';

/**
 * Render test da rota `/autor/:slug` (S14) — verifica o `<h1>` com o nome do autor,
 * a `canonical` self (`/autor/<slug>`) e os blocos JSON-LD `ProfilePage` (mainEntity
 * `Person`) + `BreadcrumbList`. Perfil e artigos vêm via HttpTestingController.
 */
describe('AutorComponent (render /autor/:slug)', () => {
	let fixture: ComponentFixture<AutorComponent>;
	let httpMock: HttpTestingController;
	let doc: Document;
	const slug = 'maria-fernanda-vetere';

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [AutorComponent],
			providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), ...provideRenderTestStubs(), { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ slug }) } } }],
		});
		doc = TestBed.inject(DOCUMENT);
		httpMock = TestBed.inject(HttpTestingController);
		fixture = TestBed.createComponent(AutorComponent);
		fixture.detectChanges();

		// 1) autor pelo slug → 2) (no callback) artigos do autor.
		httpMock.expectOne((r) => r.url.includes('authors')).flush([mockAutor({ slug })]);
		httpMock.expectOne((r) => r.url.includes('published_articles')).flush([]);
		fixture.detectChanges();
	});

	afterEach(() => {
		cleanSeoHead(doc);
		fixture.destroy();
	});

	it('renderiza o <h1> com o nome do autor', () => {
		const h1 = fixture.nativeElement.querySelector('h1');
		expect(h1).toBeTruthy();
		expect(h1.textContent).toContain('Dra. Maria Fernanda Vetere');
	});

	it('define canonical self para /autor/<slug>', () => {
		expect(canonicalHref(doc)).toBe(`${TEST_BASE_URL}/autor/${slug}`);
	});

	it('emite JSON-LD ProfilePage com Person (OAB) + breadcrumb', () => {
		const ld = readJsonLd(doc, 'main');
		expect(ld['@type']).toBe('ProfilePage');
		expect(ld.mainEntity['@type']).toBe('Person');
		expect(ld.mainEntity.identifier).toBe('OAB/SP 527.527');

		const bc = readJsonLd(doc, 'breadcrumb');
		expect(bc['@type']).toBe('BreadcrumbList');
		expect(bc.itemListElement.length).toBe(3);
	});
});
