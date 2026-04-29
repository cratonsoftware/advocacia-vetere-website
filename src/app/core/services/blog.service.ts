import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { from, map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Artigo, CategoriaArtigo } from '../models/artigo.model';

@Injectable({
	providedIn: 'root',
})
export class BlogService {
	private supabase: SupabaseClient;

	constructor() {
		this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey, {
			auth: {
				persistSession: false,
				autoRefreshToken: false,
				detectSessionInUrl: false,
			},
		});
	}

	getAllArticles(): Observable<Artigo[]> {
		const query = this.supabase
			.from('published_articles')
			.select('*')
			.then(({ data, error }) => {
				if (error) throw error;
				return data as Artigo[];
			});

		return from(query).pipe(map((articles) => articles.map((article) => this.formatDate(article))));
	}

	getLatestArticles(limit: number = 3): Observable<Artigo[]> {
		const query = this.supabase
			.from('published_articles')
			.select('*')
			.limit(limit)
			.then(({ data, error }) => {
				if (error) throw error;
				return data as Artigo[];
			});

		return from(query).pipe(map((articles) => articles.map((article) => this.formatDate(article))));
	}

	getArticleBySlug(slug: string): Observable<Artigo | null> {
		const query = this.supabase
			.from('published_articles')
			.select('*')
			.eq('slug', slug)
			.maybeSingle()
			.then(({ data, error }) => {
				if (error) {
					console.error('Erro interno ao buscar artigo:', error.message);
					return null;
				}
				return data as Artigo | null;
			});

		return from(query).pipe(map((article) => (article ? this.formatDate(article) : null)));
	}

	getCategories(): Observable<CategoriaArtigo[]> {
		const query = this.supabase
			.from('categories')
			.select('id, name, slug')
			.order('name', { ascending: true })
			.then(({ data, error }) => {
				if (error) throw error;
				return data as CategoriaArtigo[];
			});

		return from(query);
	}

	private formatDate(article: Artigo): Artigo {
		const dataObj = new Date(article.date);
		const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' };
		article.date = dataObj.toLocaleDateString('pt-BR', options);
		article.date = article.date.replace(/ de [a-z]/g, (match) => match.toUpperCase());
		if (article.content) article.content = article.content.replace(/\\n/g, '\n');
		return article;
	}
}
