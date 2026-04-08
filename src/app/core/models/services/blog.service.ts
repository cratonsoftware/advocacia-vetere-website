import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BlogPost } from '../blog.model';

@Injectable({
	providedIn: 'root',
})
export class BlogService {
	// Mock de Dados (Simulando um Banco de Dados)
	private articles: BlogPost[] = [
		{
			id: '1',
			slug: 'planejamento-sucessorio-familiar',
			title: 'A Importância do Planejamento Sucessório Familiar',
			excerpt: 'Entenda como a organização prévia do patrimônio pode evitar conflitos judiciais, proteger a empresa familiar e garantir a paz entre os herdeiros.',
			content: `
        <p>O planejamento sucessório é, acima de tudo, um ato de cuidado com as próximas gerações. Muitas famílias negligenciam essa etapa, acreditando que a sucessão patrimonial só deve ser discutida após o luto.</p>
        <br>
        <p>No entanto, a ausência de um planejamento adequado costuma resultar em longos e custosos processos de inventário, além de desgastes emocionais irreparáveis entre os herdeiros.</p>
        <br>
        <h3>Por onde começar?</h3>
        <p>O primeiro passo é a realização de um diagnóstico patrimonial e familiar. Ferramentas como doações em vida com reserva de usufruto, testamentos, e até a criação de holdings familiares (estruturas societárias) são analisadas de forma personalizada para cada cenário.</p>
      `,
			category: 'Cível',
			date: '12 de Abril, 2026',
			coverImage: '/assets/fotos/8882.jpg',
			readTime: '4 min de leitura',
		},
		{
			id: '2',
			slug: 'direitos-trabalhador-home-office',
			title: 'Os Limites e Direitos do Trabalhador em Home Office',
			excerpt: 'O teletrabalho trouxe flexibilidade, mas também novos desafios jurídicos. Quais são os limites da jornada de trabalho e o direito à desconexão?',
			content: '<p>O conteúdo completo sobre home office entra aqui...</p>',
			category: 'Trabalhista',
			date: '28 de Março, 2026',
			coverImage: '/assets/fotos/8742.jpg',
			readTime: '6 min de leitura',
		},
	];

	// Busca todos os artigos (Para a página /blog)
	getAllArticles(): Observable<BlogPost[]> {
		return of(this.articles);
	}

	// Busca os últimos X artigos (Para o Preview da Home)
	getLatestArticles(limit: number = 3): Observable<BlogPost[]> {
		return of(this.articles.slice(0, limit));
	}

	// Busca 1 artigo específico pelo slug da URL (Para a página de Leitura)
	getArticleBySlug(slug: string): Observable<BlogPost | undefined> {
		const article = this.articles.find((a) => a.slug === slug);
		return of(article);
	}
}
