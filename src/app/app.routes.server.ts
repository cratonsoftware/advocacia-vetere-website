import { RenderMode, ServerRoute } from '@angular/ssr';
import { environment } from 'src/environments/environment';

// Busca, em tempo de build, os slugs publicados no Supabase para pre-renderizar
// cada artigo como HTML estatico com SEO proprio. Em caso de falha (Supabase
// indisponivel ou rede bloqueada no build), loga o erro e retorna [] para nao
// quebrar o deploy; novos artigos sao cobertos pelo rebuild automatico
// (Vercel Deploy Hook + webhook do Supabase) descrito em BLOG-SEO.md secao 10.
async function getPublishedArticleSlugs(): Promise<Array<{ slug: string }>> {
	try {
		const response = await fetch(`${environment.supabaseUrl}/rest/v1/published_articles?select=slug`, {
			headers: {
				apikey: environment.supabaseKey,
				Authorization: `Bearer ${environment.supabaseKey}`,
			},
		});

		if (!response.ok) throw new Error(`Supabase respondeu ${response.status} ao listar slugs`);

		const articles = (await response.json()) as Array<{ slug: string }>;
		return articles.map((article) => ({ slug: article.slug }));
	} catch (error) {
		console.error('[prerender] Falha ao buscar slugs de artigos no Supabase:', error);
		return [];
	}
}

// Busca, em tempo de build, os slugs das categorias para pre-renderizar cada
// pagina de arquivo (/blog/categoria/:slug) como HTML estatico com SEO proprio.
// Mesma estrategia de robustez dos artigos: em falha, retorna [] sem quebrar o build.
async function getCategorySlugs(): Promise<Array<{ slug: string }>> {
	try {
		const response = await fetch(`${environment.supabaseUrl}/rest/v1/categories?select=slug`, {
			headers: {
				apikey: environment.supabaseKey,
				Authorization: `Bearer ${environment.supabaseKey}`,
			},
		});

		if (!response.ok) throw new Error(`Supabase respondeu ${response.status} ao listar categorias`);

		const categories = (await response.json()) as Array<{ slug: string }>;
		return categories.map((category) => ({ slug: category.slug }));
	} catch (error) {
		console.error('[prerender] Falha ao buscar slugs de categorias no Supabase:', error);
		return [];
	}
}

export const serverRoutes: ServerRoute[] = [
	{
		path: '',
		renderMode: RenderMode.Prerender,
	},
	{
		path: 'blog',
		renderMode: RenderMode.Prerender,
	},
	{
		path: 'blog/categoria/:slug',
		renderMode: RenderMode.Prerender,
		getPrerenderParams: getCategorySlugs,
	},
	{
		path: 'blog/:slug',
		renderMode: RenderMode.Prerender,
		getPrerenderParams: getPublishedArticleSlugs,
	},
	{
		path: 'sucesso',
		renderMode: RenderMode.Prerender,
	},
	{
		path: '404',
		renderMode: RenderMode.Prerender,
	},
	{
		path: '**',
		renderMode: RenderMode.Server,
	},
];
