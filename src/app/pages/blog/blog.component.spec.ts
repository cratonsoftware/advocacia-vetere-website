import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DOCUMENT } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { canonicalHref, cleanSeoHead, provideRenderTestStubs, readJsonLd, TEST_BASE_URL } from '../../testing/seo-dom.helper';
import { BlogComponent } from './blog.component';

/**
 * Render test da rota `/blog` (S14) — verifica o `<h1>` da listagem, a `canonical`
 * self (`/blog`) e o bloco JSON-LD `Blog`. Os fetches do Supabase (artigos/categorias)
 * são respondidos via HttpTestingController.
 */
describe('BlogComponent (render /blog)', () => {
	let fixture: ComponentFixture<BlogComponent>;
	let httpMock: HttpTestingController;
	let doc: Document;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [BlogComponent],
			providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), ...provideRenderTestStubs()],
		});
		doc = TestBed.inject(DOCUMENT);
		httpMock = TestBed.inject(HttpTestingController);
		fixture = TestBed.createComponent(BlogComponent);
		fixture.detectChanges();
		// Listagem + filtros: a página dispara artigos e categorias na inicialização.
		httpMock.match((r) => r.url.includes('published_articles')).forEach((req) => req.flush([]));
		httpMock.match((r) => r.url.includes('categories')).forEach((req) => req.flush([]));
		fixture.detectChanges();
	});

	afterEach(() => {
		cleanSeoHead(doc);
		fixture.destroy();
	});

	it('renderiza um <h1> com o título do blog', () => {
		const h1 = fixture.nativeElement.querySelector('h1');
		expect(h1).toBeTruthy();
		expect(h1.textContent).toContain('Blog');
	});

	it('define canonical self para /blog', () => {
		expect(canonicalHref(doc)).toBe(`${TEST_BASE_URL}/blog`);
	});

	it('emite JSON-LD do tipo Blog', () => {
		const ld = readJsonLd(doc, 'main');
		expect(ld['@type']).toBe('Blog');
	});
});
