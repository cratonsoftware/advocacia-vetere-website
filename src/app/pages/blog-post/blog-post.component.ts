import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BlogPost } from '../../core/models/blog.model';
import { BlogService } from '../../core/services/blog.service';

@Component({
	selector: 'app-blog-post',
	imports: [CommonModule, RouterLink],
	templateUrl: './blog-post.component.html',
})
export class BlogPostComponent implements OnInit {
	private route = inject(ActivatedRoute);
	private blogService = inject(BlogService);

	article: BlogPost | undefined;

	ngOnInit(): void {
		this.route.paramMap.subscribe((params) => {
			const slug = params.get('slug');
			if (slug) {
				this.blogService.getArticleBySlug(slug).subscribe((data) => {
					this.article = data;
				});
			}
		});
	}
}
