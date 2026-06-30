import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SITE_URL } from 'src/app/core/config/site.config';
import { Artigo, AutorArtigo } from 'src/app/core/models/artigo.model';
import { SeoService } from 'src/app/core/services/seo.service';
import { BlogService } from '../../core/services/blog.service';

@Component({
	selector: 'app-autor',
	templateUrl: './autor.component.html',
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [RouterLink, NgOptimizedImage],
})
export class AutorComponent implements OnInit {
	private route = inject(ActivatedRoute);
	private blogService = inject(BlogService);
	private seoService = inject(SeoService);
	private cdr = inject(ChangeDetectorRef);

	private readonly baseUrl = SITE_URL;

	author: AutorArtigo | null = null;
	articles: Artigo[] = [];
	isLoading = true;

	ngOnInit(): void {
		const slug = this.route.snapshot.paramMap.get('slug');
		if (!slug) {
			this.isLoading = false;
			this.cdr.markForCheck();
			return;
		}

		this.blogService.getAuthorBySlug(slug).subscribe((author) => {
			this.author = author;
			this.cdr.markForCheck();

			if (author) {
				this.blogService.getArticlesByAuthorSlug(slug).subscribe((articles) => {
					this.articles = articles;
					this.isLoading = false;
					this.cdr.markForCheck();
				});

				this.seoService.updateMetaTags({
					title: `${author.name} | ${author.role || 'Advogada'} em Tambaú-SP`,
					description: `${author.name}, ${(author.role || 'Advogada').toLowerCase()} com foco em Direito de Família em Tambaú-SP. Veja o perfil e os artigos publicados.`,
					keywords: `${author.name}, advogada, ${author.role || ''}, perfil, OAB`,
					image: author.avatar || '/assets/cards/card-home.png',
					imageAlt: `Foto de ${author.name}`,
					slug: `autor/${author.slug}`,
					type: 'profile',
					authorPerson: {
						name: author.name,
						jobTitle: author.role || 'Advogada',
						oab: author.oab || undefined,
						url: `${this.baseUrl}/autor/${author.slug}`,
						sameAs: author.sameAs || undefined,
					},
					breadcrumbs: [
						{ name: 'Início', url: `${this.baseUrl}/` },
						{ name: 'Blog', url: `${this.baseUrl}/blog` },
						{ name: author.name, url: `${this.baseUrl}/autor/${author.slug}` },
					],
				});
			} else {
				this.isLoading = false;
				this.cdr.markForCheck();
				this.seoService.updateMetaTags({
					title: 'Autor não encontrado',
					description: 'O autor que você procura não foi encontrado. Conheça os artigos do blog jurídico da Dra. Maria Fernanda Vetere.',
					slug: `autor/${slug}`,
					type: 'profile',
					noIndex: true,
				});
			}
		});
	}

	/** Rótulo amigável para um link social a partir do domínio (usado nos botões de `sameAs`). */
	platformLabel(url: string): string {
		const value = url.toLowerCase();
		if (value.includes('instagram')) return 'Instagram';
		if (value.includes('facebook')) return 'Facebook';
		if (value.includes('tiktok')) return 'TikTok';
		if (value.includes('linkedin')) return 'LinkedIn';
		if (value.includes('youtube')) return 'YouTube';
		return 'Perfil';
	}
}
