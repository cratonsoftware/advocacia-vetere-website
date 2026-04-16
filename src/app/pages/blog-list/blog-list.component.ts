import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BlogPost } from '../../core/models/blog.model';
import { BlogService } from '../../core/services/blog.service';

@Component({
	selector: 'app-blog-list',
	templateUrl: './blog-list.component.html',
	imports: [CommonModule, RouterLink, FormsModule],
})
export class BlogListComponent implements OnInit {
	private blogService = inject(BlogService);

	// Estados dos Artigos
	allArticles: BlogPost[] = [];
	filteredArticles: BlogPost[] = [];
	paginatedArticles: BlogPost[] = [];

	// Filtros e Pesquisa
	searchTerm: string = '';
	selectedCategory: string = 'Todos';
	categories: string[] = ['Todos', 'Cível', 'Trabalhista', 'Empresarial'];

	// Paginação
	currentPage: number = 1;
	itemsPerPage: number = 6;
	totalPages: number = 1;

	ngOnInit(): void {
		this.blogService.getAllArticles().subscribe((articles) => {
			this.allArticles = articles;
			this.applyFilters(); // Aplica filtros e paginação iniciais
		});
	}

	// Método chamado sempre que o utilizador digita algo ou clica numa categoria
	applyFilters(): void {
		let temp = this.allArticles;

		// 1. Filtro por Categoria
		if (this.selectedCategory !== 'Todos') {
			temp = temp.filter((article) => article.category === this.selectedCategory);
		}

		// 2. Filtro por Pesquisa (Título ou Resumo)
		if (this.searchTerm.trim() !== '') {
			const term = this.searchTerm.toLowerCase();
			temp = temp.filter((article) => article.title.toLowerCase().includes(term) || article.excerpt.toLowerCase().includes(term));
		}

		this.filteredArticles = temp;
		this.totalPages = Math.ceil(this.filteredArticles.length / this.itemsPerPage) || 1;
		this.changePage(1); // Volta para a primeira página sempre que filtra
	}

	setCategory(category: string): void {
		this.selectedCategory = category;
		this.applyFilters();
	}

	// Lógica de Paginação
	changePage(page: number): void {
		if (page >= 1 && page <= this.totalPages) {
			this.currentPage = page;
			const startIndex = (this.currentPage - 1) * this.itemsPerPage;
			const endIndex = startIndex + this.itemsPerPage;
			this.paginatedArticles = this.filteredArticles.slice(startIndex, endIndex);

			// Rola a página para o topo suavemente ao mudar de página
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	}

	// Gera o array de páginas para renderizar os botões [1] [2] [3]
	get pagesArray(): number[] {
		return Array(this.totalPages)
			.fill(0)
			.map((x, i) => i + 1);
	}
}
