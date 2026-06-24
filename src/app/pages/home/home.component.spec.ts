import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DOCUMENT } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideMarkdown } from 'ngx-markdown';
import { provideEnvironmentNgxMask } from 'ngx-mask';
import { canonicalHref, cleanSeoHead, provideRenderTestStubs, readJsonLd, TEST_BASE_URL } from '../../testing/seo-dom.helper';
import { HomeComponent } from './home.component';

/**
 * Render test da rota `/` (S14) — verifica o `<h1>` (vindo do Hero), a `canonical`
 * self (URL base, sem slug) e o JSON-LD `LegalService` (negócio local). A home compõe
 * vários blocos; os que buscam dados (blog-preview/reviews) são respondidos vazios
 * via HttpTestingController para isolar a verificação de SEO/estrutura.
 */
describe('HomeComponent (render /)', () => {
	let fixture: ComponentFixture<HomeComponent>;
	let httpMock: HttpTestingController;
	let doc: Document;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HomeComponent],
			providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), provideMarkdown(), provideEnvironmentNgxMask(), ...provideRenderTestStubs()],
		});
		doc = TestBed.inject(DOCUMENT);
		httpMock = TestBed.inject(HttpTestingController);
		fixture = TestBed.createComponent(HomeComponent);
		fixture.detectChanges();
		// Blocos da home que buscam dados (blog-preview, reviews) → responde vazio.
		httpMock.match(() => true).forEach((req) => req.flush([]));
		fixture.detectChanges();
	});

	afterEach(() => {
		cleanSeoHead(doc);
		fixture.destroy();
	});

	it('renderiza um <h1> não vazio (Hero)', () => {
		const h1 = fixture.nativeElement.querySelector('h1');
		expect(h1).toBeTruthy();
		expect(h1.textContent?.trim().length).toBeGreaterThan(0);
	});

	it('define canonical self para a home (URL base, sem slug)', () => {
		expect(canonicalHref(doc)).toBe(TEST_BASE_URL);
	});

	it('emite JSON-LD LegalService com sinais de negócio local', () => {
		const ld = readJsonLd(doc, 'main');
		expect(ld['@type']).toBe('LegalService');
		expect(ld.telephone).toBeTruthy();
		expect(ld.geo['@type']).toBe('GeoCoordinates');
	});
});
