import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
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

	article: BlogPost | null = null;
	isLoading = true;

	ngOnInit(): void {
		const slug = this.route.snapshot.paramMap.get('slug');

		if (slug) {
			this.blogService.getArticleBySlug(slug).subscribe((data) => {
				this.article = data;
				this.isLoading = false;
			});
		}
	}
}
