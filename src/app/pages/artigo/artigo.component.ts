import { isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
import { switchMap } from 'rxjs/operators';
import { SITE_URL } from 'src/app/core/config/site.config';
import { SeoService } from 'src/app/core/services/seo.service';
import { Artigo } from '../../core/models/artigo.model';
import { BlogService } from '../../core/services/blog.service';
import { ArtigoNotFoundComponent } from './not-found/not-found.component';

@Component({
	selector: 'app-artigo',
	templateUrl: './artigo.component.html',
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [RouterLink, MarkdownModule, ArtigoNotFoundComponent, NgOptimizedImage, MatIconModule],
})
export class ArtigoComponent implements OnInit {
	private route = inject(ActivatedRoute);
	private blogService = inject(BlogService);
	private seoService = inject(SeoService);
	private cdr = inject(ChangeDetectorRef);
	private platformId = inject(PLATFORM_ID);

	article: Artigo | null = null;
	relatedArticles: Artigo[] = [];
	isLoading = true;

	/** Feedback do botão "Copiar link" — volta a false após alguns segundos. */
	linkCopied = false;

	/** URL base canônica — usada no link de compartilhamento do template. */
	protected readonly siteUrl = SITE_URL;

	ngOnInit(): void {
		// paramMap como observable (não snapshot): ao navegar entre artigos ("Leia também"),
		// o Angular reaproveita a instância do componente e o ngOnInit não roda de novo —
		// só a mudança de parâmetro recarrega os dados. switchMap cancela o fetch anterior.
		this.route.paramMap
			.pipe(
				switchMap((params) => {
					const slug = params.get('slug');
					this.isLoading = true;
					this.article = null;
					this.relatedArticles = [];
					this.linkCopied = false;
					this.cdr.markForCheck();
					return this.blogService.getArticleBySlug(slug ?? '');
				}),
			)
			.subscribe((data) => {
				this.article = data;
				this.isLoading = false;
				this.cdr.markForCheck();

				if (data) {
					const baseUrl = this.siteUrl;

					// Linkagem interna (G6): artigos da mesma categoria, exceto o atual.
					if (data.categorySlug) {
						this.blogService.getRelatedArticles(data.categorySlug, data.slug).subscribe((related) => {
							this.relatedArticles = related;
							this.cdr.markForCheck();
						});
					}

					this.seoService.updateMetaTags({
						title: data.metaTitle || data.title,
						description: data.metaDescription || data.excerpt,
						image: data.coverImage,
						imageAlt: data.coverImageAlt,
						// Card social COM template (imagem manual do Canva, .webp) — só para og:image/twitter:image.
						// Fallback: se vazio, o SeoService usa `coverImage` (imagem limpa). O BlogPosting.image (JSON-LD)
						// permanece sempre com a imagem limpa (`image`) — Google/Discover pede foto sem texto.
						ogImage: data.socialImage || undefined,
						slug: `blog/${data.slug}`,
						type: 'article',
						author: data.author?.name || 'Dra. Maria Fernanda Vetere',
						authorPerson: {
							name: data.author?.name || 'Dra. Maria Fernanda Vetere',
							jobTitle: data.author?.role || 'Advogada',
							oab: data.author?.oab || undefined,
							// Página de autor (follow-up S5): aponta para /autor/:slug; fallback à home se não houver slug (sem 404).
							url: data.author?.slug ? `${baseUrl}/autor/${data.author.slug}` : baseUrl,
							sameAs: data.author?.sameAs || undefined,
						},
						publishedDate: data.dateIso,
						modifiedDate: data.updatedAtIso,
						articleSection: data.category,
						inLanguage: data.locale || 'pt-BR',
						keywords: data.tags?.length ? data.tags.join(', ') : undefined,
						// Consumo fino de SEO por artigo (G10): override de canônica e flag noindex.
						canonical: data.canonicalUrl || undefined,
						noIndex: data.noindex || undefined,
						breadcrumbs: [
							{ name: 'Início', url: `${baseUrl}/` },
							{ name: 'Blog', url: `${baseUrl}/blog` },
							{ name: data.title, url: `${baseUrl}/blog/${data.slug}` },
						],
						faq: data.faq?.length ? data.faq.map((item) => ({ q: item.q, a: item.a })) : undefined,
					});
				}
			});
	}

	/** Copia a URL canônica do artigo para a área de transferência (apenas no browser). */
	copyLink(): void {
		if (!isPlatformBrowser(this.platformId) || !this.article) return;

		const url = `${this.siteUrl}/blog/${this.article.slug}`;
		navigator.clipboard?.writeText(url).then(() => {
			this.linkCopied = true;
			this.cdr.markForCheck();
			setTimeout(() => {
				this.linkCopied = false;
				this.cdr.markForCheck();
			}, 2500);
		});
	}
}
