import { NgOptimizedImage, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SeoService } from 'src/app/core/services/seo.service';
import { BlogService } from '../../core/services/blog.service';

@Component({
	selector: 'app-blog',
	templateUrl: './blog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [RouterLink, FormsModule, NgOptimizedImage],
})
export class BlogComponent {
	private blogService = inject(BlogService);
	private seoService = inject(SeoService);
	private platformId = inject(PLATFORM_ID);

	private readonly itemsPerPage = 6;

	// --- dados assíncronos via toSignal() ---
	allArticles = toSignal(this.blogService.getAllArticles(), { initialValue: [] });
	categories = toSignal(this.blogService.getCategories(), { initialValue: [] });

	// --- estado de filtro/paginação ---
	selectedCategory = signal('Todos');
	searchTerm = signal('');
	currentPage = signal(1);

	// --- estado derivado via computed() ---
	filteredArticles = computed(() => {
		let temp = this.allArticles();
		const cat = this.selectedCategory();
		const term = this.searchTerm().toLowerCase().trim();

		if (cat !== 'Todos') temp = temp.filter((a) => a.category === cat);
		if (term) temp = temp.filter((a) => a.title.toLowerCase().includes(term) || a.excerpt.toLowerCase().includes(term));
		return temp;
	});

	totalPages = computed(() => Math.ceil(this.filteredArticles().length / this.itemsPerPage) || 1);

	paginatedArticles = computed(() => {
		const start = (this.currentPage() - 1) * this.itemsPerPage;
		return this.filteredArticles().slice(start, start + this.itemsPerPage);
	});

	pagesArray = computed(() =>
		Array(this.totalPages())
			.fill(0)
			.map((_, i) => i + 1),
	);

	constructor() {
		this.seoService.updateMetaTags({
			title: 'Blog Vetere | Análises e Orientações Jurídicas',
			description: 'Mantenha-se atualizado com o nosso blog jurídico. Aqui você encontrará artigos especializados, análises sobre a legislação vigente e orientações fundamentais para a proteção e o exercício dos seus direitos.',
			keywords: 'blog jurídico, artigos direito, planejamento sucessório, notícias jurídicas',
			image: '/assets/cards/card-blog.png',
			slug: 'blog',
			type: 'website',
		});
	}

	onSearchChange(value: string): void {
		this.searchTerm.set(value);
		this.currentPage.set(1);
	}

	setCategory(categoryName: string): void {
		this.selectedCategory.set(categoryName);
		this.currentPage.set(1);
	}

	changePage(page: number): void {
		const total = this.totalPages();
		if (page >= 1 && page <= total) {
			this.currentPage.set(page);
			if (isPlatformBrowser(this.platformId)) window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	}

	clearFilters(): void {
		this.searchTerm.set('');
		this.selectedCategory.set('Todos');
		this.currentPage.set(1);
	}
}
