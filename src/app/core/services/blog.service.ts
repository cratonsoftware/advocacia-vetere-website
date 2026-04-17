import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { from, map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BlogCategory, BlogPost } from '../models/blog.model';

@Injectable({
	providedIn: 'root',
})
export class BlogService {
	private supabase: SupabaseClient;

	constructor() {
		this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
	}

	getAllArticles(): Observable<BlogPost[]> {
		const query = this.supabase
			.from('published_articles')
			.select('*')
			.then(({ data, error }) => {
				if (error) throw error;
				return data as BlogPost[];
			});

		return from(query).pipe(map((articles) => articles.map((article) => this.formatDate(article))));
	}

	getLatestArticles(limit: number = 3): Observable<BlogPost[]> {
		const query = this.supabase
			.from('published_articles')
			.select('*')
			.limit(limit)
			.then(({ data, error }) => {
				if (error) throw error;
				return data as BlogPost[];
			});

		return from(query).pipe(map((articles) => articles.map((article) => this.formatDate(article))));
	}

	getArticleBySlug(slug: string): Observable<BlogPost | null> {
		const query = this.supabase
			.from('published_articles')
			.select('*')
			.eq('slug', slug)
			.single()
			.then(({ data, error }) => {
				if (error) {
					console.error('Artigo não encontrado:', error);
					return null;
				}
				return data as BlogPost;
			});

		return from(query).pipe(map((article) => (article ? this.formatDate(article) : null)));
	}

	getCategories(): Observable<BlogCategory[]> {
		const query = this.supabase
			.from('categories')
			.select('id, name, slug')
			.order('name', { ascending: true })
			.then(({ data, error }) => {
				if (error) throw error;
				return data as BlogCategory[];
			});

		return from(query);
	}

	private formatDate(article: BlogPost): BlogPost {
		const dataObj = new Date(article.date);
		const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' };
		article.date = dataObj.toLocaleDateString('pt-BR', options);

		article.date = article.date.replace(/ de [a-z]/g, (match) => match.toUpperCase());
		return article;
	}
}
