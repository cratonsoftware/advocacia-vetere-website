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
					this.seoService.updateMetaTags({
						title: data.title,
						description: data.excerpt,
						image: data.coverImage,
						slug: `blog/${data.slug}`,
						type: 'article',
						author: 'Dra. Maria Fernanda Vetere',
						publishedDate: data.date,
					});
				}
			});
		} else this.isLoading = false;
	}
}
