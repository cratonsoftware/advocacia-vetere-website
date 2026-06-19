import { Component, inject, OnInit } from '@angular/core';
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
	imports: [RouterLink, MarkdownModule, ArtigoNotFoundComponent],
})
export class ArtigoComponent implements OnInit {
	private route = inject(ActivatedRoute);
	private blogService = inject(BlogService);
	private seoService = inject(SeoService);

	article: Artigo | null = null;
	isLoading = true;

	ngOnInit(): void {
		const slug = this.route.snapshot.paramMap.get('slug');

		if (slug) {
			this.blogService.getArticleBySlug(slug).subscribe((data) => {
				this.article = data;
				this.isLoading = false;

				if (data) {
					const baseUrl = 'https://www.mfernandavetere.adv.br';
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
							// Página /autor/:slug será criada na S5 — por ora aponta para a home (sem 404).
							url: baseUrl,
							sameAs: data.author?.sameAs || undefined,
						},
						publishedDate: data.dateIso,
						modifiedDate: data.updatedAtIso,
						articleSection: data.category,
						inLanguage: data.locale || 'pt-BR',
						keywords: data.tags?.length ? data.tags.join(', ') : undefined,
						breadcrumbs: [
							{ name: 'Início', url: `${baseUrl}/` },
							{ name: 'Blog', url: `${baseUrl}/blog` },
							{ name: data.title, url: `${baseUrl}/blog/${data.slug}` },
						],
					});
				}
			});
		} else this.isLoading = false;
	}
}
