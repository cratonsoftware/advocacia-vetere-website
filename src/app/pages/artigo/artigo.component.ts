import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
import { SeoService } from 'src/app/core/services/seo.service';
import { Artigo } from '../../core/models/artigo.model';
import { BlogService } from '../../core/services/blog.service';
import { ArtigoNotFoundComponent } from './not-found/not-found.component';

@Component({
	selector: 'app-artigo',
	templateUrl: './artigo.component.html',
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [RouterLink, MarkdownModule, ArtigoNotFoundComponent, NgOptimizedImage],
})
export class ArtigoComponent implements OnInit {
	private route = inject(ActivatedRoute);
	private blogService = inject(BlogService);
	private seoService = inject(SeoService);
	private cdr = inject(ChangeDetectorRef);

	article: Artigo | null = null;
	relatedArticles: Artigo[] = [];
	isLoading = true;

	ngOnInit(): void {
		const slug = this.route.snapshot.paramMap.get('slug');

		if (slug) {
			this.blogService.getArticleBySlug(slug).subscribe((data) => {
				this.article = data;
				this.isLoading = false;
				this.cdr.markForCheck();

				if (data) {
					const baseUrl = 'https://www.mfernandavetere.adv.br';

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
		} else {
			this.isLoading = false;
			this.cdr.markForCheck();
		}
	}
}
