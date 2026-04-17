import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BlogCategory, BlogPost } from '../../core/models/blog.model';
import { BlogService } from '../../core/services/blog.service';

@Component({
	selector: 'app-blog-list',
	standalone: true,
	imports: [CommonModule, RouterLink, FormsModule],
	templateUrl: './blog-list.component.html',
})
export class BlogListComponent implements OnInit {
	private blogService = inject(BlogService);

	allArticles: BlogPost[] = [];
	filteredArticles: BlogPost[] = [];
	paginatedArticles: BlogPost[] = [];

	categories: BlogCategory[] = [];
	selectedCategory: string = 'Todos';
	searchTerm: string = '';

	currentPage: number = 1;
	itemsPerPage: number = 6;
	totalPages: number = 1;
	isLoading: boolean = true;

	ngOnInit(): void {
		this.blogService.getCategories().subscribe((cats) => (this.categories = cats));
		this.blogService.getAllArticles().subscribe((articles) => {
			this.allArticles = articles;
			this.isLoading = false;
			this.applyFilters();
		});
	}

	applyFilters(): void {
		let temp = this.allArticles;

		if (this.selectedCategory !== 'Todos') temp = temp.filter((article) => article.category === this.selectedCategory);
		if (this.searchTerm.trim() !== '') {
			const term = this.searchTerm.toLowerCase();
			temp = temp.filter((article) => article.title.toLowerCase().includes(term) || article.excerpt.toLowerCase().includes(term));
		}

		this.filteredArticles = temp;
		this.totalPages = Math.ceil(this.filteredArticles.length / this.itemsPerPage) || 1;
		this.changePage(1);
	}

	setCategory(categoryName: string): void {
		this.selectedCategory = categoryName;
		this.applyFilters();
	}

	changePage(page: number): void {
		if (page >= 1 && page <= this.totalPages) {
			this.currentPage = page;
			const startIndex = (this.currentPage - 1) * this.itemsPerPage;
			this.paginatedArticles = this.filteredArticles.slice(startIndex, startIndex + this.itemsPerPage);
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	}

	get pagesArray(): number[] {
		return Array(this.totalPages)
			.fill(0)
			.map((x, i) => i + 1);
	}
}
