import { Component, inject, OnInit, PendingTasks } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
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
	private pendingTasks = inject(PendingTasks);

	article: BlogPost | null = null;
	isLoading = true;

	ngOnInit(): void {
		const slug = this.route.snapshot.paramMap.get('slug');

		if (slug) {
			const removeTask = this.pendingTasks.add();

			this.blogService.getArticleBySlug(slug).subscribe((data) => {
				this.article = data;

				if (data) {
					this.seoService.updateMetaTags({
						title: data.title,
						description: data.excerpt,
						image: data.coverImage,
						slug: data.slug,
					});
				}

				this.isLoading = false;

				removeTask();
			});
		}
	}
}
