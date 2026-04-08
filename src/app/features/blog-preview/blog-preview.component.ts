import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BlogPost } from '../../core/models/blog.model';
import { BlogService } from '../../core/models/services/blog.service';

@Component({
	selector: 'app-blog-preview',
	templateUrl: './blog-preview.component.html',
	imports: [CommonModule, RouterLink],
})
export class BlogPreviewComponent implements OnInit {
	private blogService = inject(BlogService);
	latestArticles: BlogPost[] = [];

	ngOnInit(): void {
		this.blogService.getLatestArticles(3).subscribe((articles) => {
			this.latestArticles = articles;
		});
	}
}
