import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Artigo } from '../models/artigo.model';
import { BlogService } from './blog.service';

/**
 * Smoke tests do BlogService.formatDate (S8) — protege a derivação das datas de SEO
 * (`dateIso`/`updatedAtIso` em ISO 8601) e do rótulo pt-BR, além da normalização
 * de `\n` no conteúdo. `formatDate` é privado, então é exercido via getArticleBySlug
 * com o HttpTestingController.
 */
describe('BlogService.formatDate', () => {
	let service: BlogService;
	let httpMock: HttpTestingController;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [BlogService, provideHttpClient(), provideHttpClientTesting()],
		});
		service = TestBed.inject(BlogService);
		httpMock = TestBed.inject(HttpTestingController);
	});

	afterEach(() => httpMock.verify());

	/** Dispara getArticleBySlug e responde com o registro cru fornecido. */
	function fetchWith(raw: Partial<Artigo>): Promise<Artigo | null> {
		const promise = new Promise<Artigo | null>((resolve) => {
			service.getArticleBySlug('qualquer').subscribe(resolve);
		});
		const req = httpMock.expectOne((r) => r.url.includes('published_articles'));
		req.flush([raw]);
		return promise;
	}

	it('deriva dateIso e updatedAtIso em ISO 8601 a partir de publishedAt/updatedAt', async () => {
		const article = await fetchWith({
			slug: 's',
			publishedAt: '2026-06-19 12:00:00+00',
			updatedAt: '2026-06-20 12:00:00+00',
		} as Partial<Artigo>);

		expect(article?.dateIso).toBe('2026-06-19T12:00:00.000Z');
		expect(article?.updatedAtIso).toBe('2026-06-20T12:00:00.000Z');
	});

	it('formata o rótulo `date` em pt-BR com mês capitalizado', async () => {
		const article = await fetchWith({ slug: 's', publishedAt: '2026-06-19 12:00:00+00' } as Partial<Artigo>);
		expect(article?.date).toContain('Junho de 2026');
	});

	it('faz fallback para `date` quando publishedAt está ausente', async () => {
		const article = await fetchWith({ slug: 's', date: '2026-01-05 10:00:00+00' } as Partial<Artigo>);
		expect(article?.dateIso).toBe('2026-01-05T10:00:00.000Z');
		expect(article?.updatedAtIso).toBe('2026-01-05T10:00:00.000Z');
	});

	it('normaliza "\\n" escapado para quebra de linha real no conteúdo', async () => {
		const article = await fetchWith({ slug: 's', publishedAt: '2026-06-19 12:00:00+00', content: 'linha1\\nlinha2' } as Partial<Artigo>);
		expect(article?.content).toBe('linha1\nlinha2');
	});

	it('retorna string vazia para timestamp inválido', async () => {
		const article = await fetchWith({ slug: 's', publishedAt: 'data-invalida' } as Partial<Artigo>);
		expect(article?.dateIso).toBe('');
		expect(article?.updatedAtIso).toBe('');
	});

	it('retorna null quando o artigo não existe', async () => {
		const promise = new Promise<Artigo | null>((resolve) => service.getArticleBySlug('inexistente').subscribe(resolve));
		httpMock.expectOne((r) => r.url.includes('published_articles')).flush([]);
		expect(await promise).toBeNull();
	});
});
