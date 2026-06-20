import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { BlogService } from 'src/app/core/services/blog.service';

@Component({
	selector: 'app-blog-preview',
	templateUrl: './blog-preview.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [RouterLink, NgOptimizedImage],
})
export class BlogPreviewComponent {
	private blogService = inject(BlogService);

	/**
	 * Signal com os 3 artigos mais recentes.
	 * - undefined: fetch ainda em andamento → template exibe skeleton (S7 §3.11)
	 * - []: sem artigos → template exibe bloco @empty
	 * - [...]: artigos disponíveis → template exibe cards
	 */
	latestArticles = toSignal(this.blogService.getLatestArticles(3));
}
