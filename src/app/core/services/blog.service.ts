import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Artigo, CategoriaArtigo } from '../models/artigo.model';

@Injectable({
	providedIn: 'root',
})
export class BlogService {
	private http = inject(HttpClient);

	private readonly apiUrl = `${environment.supabaseUrl}/rest/v1`;
	private readonly headers = new HttpHeaders({
		apikey: environment.supabaseKey,
		Authorization: `Bearer ${environment.supabaseKey}`,
	});

	getAllArticles(): Observable<Artigo[]> {
		return this.http.get<Artigo[]>(`${this.apiUrl}/published_articles?select=*`, { headers: this.headers }).pipe(
			map((articles) => articles.map((a) => this.formatDate(a))),
			catchError((err) => {
				console.error('Erro ao buscar artigos:', err);
				return of([]);
			}),
		);
	}

	getLatestArticles(limit: number = 3): Observable<Artigo[]> {
		return this.http.get<Artigo[]>(`${this.apiUrl}/published_articles?select=*&limit=${limit}`, { headers: this.headers }).pipe(
			map((articles) => articles.map((a) => this.formatDate(a))),
			catchError((err) => {
				console.error('Erro ao buscar artigos recentes:', err);
				return of([]);
			}),
		);
	}

	getArticleBySlug(slug: string): Observable<Artigo | null> {
		return this.http.get<Artigo[]>(`${this.apiUrl}/published_articles?slug=eq.${encodeURIComponent(slug)}&select=*&limit=1`, { headers: this.headers }).pipe(
			map((articles) => (articles.length > 0 ? this.formatDate(articles[0]) : null)),
			catchError((err) => {
				console.error('Erro ao buscar artigo:', err);
				return of(null);
			}),
		);
	}

	getCategories(): Observable<CategoriaArtigo[]> {
		return this.http.get<CategoriaArtigo[]>(`${this.apiUrl}/categories?select=id,name,slug&order=name.asc`, { headers: this.headers }).pipe(
			catchError((err) => {
				console.error('Erro ao buscar categorias:', err);
				return of([]);
			}),
		);
	}

	private formatDate(article: Artigo): Artigo {
		const dataObj = new Date(article.date);
		// Preservar a data ISO antes de formatar — necessário para meta tags e JSON-LD
		article.dateIso = article.date.split('T')[0];
		const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' };
		article.date = dataObj.toLocaleDateString('pt-BR', options);
		article.date = article.date.replace(/ de [a-z]/g, (match) => match.toUpperCase());
		if (article.content) article.content = article.content.replace(/\\n/g, '\n');
		return article;
	}
}
