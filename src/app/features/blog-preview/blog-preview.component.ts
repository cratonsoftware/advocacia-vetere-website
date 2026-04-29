import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Artigo } from 'src/app/core/models/artigo.model';
import { BlogService } from 'src/app/core/services/blog.service';

@Component({
	selector: 'app-blog-preview',
	templateUrl: './blog-preview.component.html',
	imports: [RouterLink],
})
export class BlogPreviewComponent implements OnInit {
	private blogService = inject(BlogService);
	latestArticles: Artigo[] = [];
	isLoading = true;

	ngOnInit(): void {
		this.blogService.getLatestArticles(3).subscribe((articles) => {
			this.latestArticles = articles;
			this.isLoading = false;
		});
	}
}
