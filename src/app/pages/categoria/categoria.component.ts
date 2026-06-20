import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Artigo, CategoriaArtigo } from 'src/app/core/models/artigo.model';
import { SeoService } from 'src/app/core/services/seo.service';
import { BlogService } from '../../core/services/blog.service';

@Component({
	selector: 'app-categoria',
	templateUrl: './categoria.component.html',
	standalone: true,
	imports: [RouterLink],
})
export class CategoriaComponent implements OnInit {
	private route = inject(ActivatedRoute);
	private blogService = inject(BlogService);
	private seoService = inject(SeoService);

	private readonly baseUrl = 'https://www.mfernandavetere.adv.br';

	category: CategoriaArtigo | null = null;
	articles: Artigo[] = [];
	isLoading = true;

	ngOnInit(): void {
		const slug = this.route.snapshot.paramMap.get('slug');
		if (!slug) {
			this.isLoading = false;
			return;
		}

		this.blogService.getCategoryBySlug(slug).subscribe((category) => {
			this.category = category;

			if (category) {
				this.blogService.getArticlesByCategorySlug(slug).subscribe((articles) => {
					this.articles = articles;
					this.isLoading = false;
				});

				this.seoService.updateMetaTags({
					title: `Artigos sobre ${category.name}`,
					description: `Artigos, análises e orientações jurídicas sobre ${category.name} escritos pela Dra. Maria Fernanda Vetere. Conteúdo claro e confiável para você entender e exercer os seus direitos.`,
					keywords: `${category.name}, advocacia, direito, ${category.name.toLowerCase()} advogada`,
					image: '/assets/cards/card-blog.png',
					slug: `blog/categoria/${category.slug}`,
					type: 'website',
					breadcrumbs: [
						{ name: 'Início', url: `${this.baseUrl}/` },
						{ name: 'Blog', url: `${this.baseUrl}/blog` },
						{ name: category.name, url: `${this.baseUrl}/blog/categoria/${category.slug}` },
					],
				});
			} else {
				this.isLoading = false;
				this.seoService.updateMetaTags({
					title: 'Categoria não encontrada',
					description: 'A categoria que você procura não foi encontrada. Conheça os demais artigos do blog jurídico da Dra. Maria Fernanda Vetere.',
					slug: `blog/categoria/${slug}`,
					type: 'website',
					noIndex: true,
				});
			}
		});
	}
}
