import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BlogService } from 'src/app/core/services/blog.service';
import { BlogPost } from '../../core/models/blog.model';

@Component({
	selector: 'app-blog-preview',
	standalone: true,
	imports: [CommonModule, RouterLink],
	templateUrl: './blog-preview.component.html',
})
export class BlogPreviewComponent implements OnInit {
	private blogService = inject(BlogService);
	latestArticles: BlogPost[] = [];
	isLoading = true;

	ngOnInit(): void {
		this.blogService.getLatestArticles(3).subscribe((articles) => {
			this.latestArticles = articles;
			this.isLoading = false;
		});
	}
}
