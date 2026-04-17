import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
import { of, switchMap, tap } from 'rxjs';
import { SeoService } from 'src/app/core/services/seo.service';
import { BlogPost } from '../../core/models/blog.model';
import { BlogService } from '../../core/services/blog.service';

@Component({
	selector: 'app-blog-post',
	templateUrl: './blog-post.component.html',
	imports: [RouterLink, MarkdownModule],
})
export class BlogPostComponent implements OnInit {
	private route = inject(ActivatedRoute);
	private blogService = inject(BlogService);
	private seoService = inject(SeoService);

	article: BlogPost | null = null;
	isLoading = true;

	ngOnInit(): void {
		this.route.paramMap
			.pipe(
				tap(() => {
					this.isLoading = true;
					this.article = null;
				}),
				switchMap((params) => {
					const slug = params.get('slug');
					if (slug) return this.blogService.getArticleBySlug(slug);
					return of(null);
				}),
			)
			.subscribe({
				next: (data) => {
					if (data) {
						this.article = data;

						this.seoService.updateMetaTags({
							title: data.title,
							description: data.excerpt,
							image: data.coverImage,
							slug: data.slug,
						});
					}

					this.isLoading = false;
				},
				error: (err) => {
					console.error('Erro ao buscar o artigo', err);
					this.isLoading = false;
				},
			});
	}
}
