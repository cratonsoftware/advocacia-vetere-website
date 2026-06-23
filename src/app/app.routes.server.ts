import { RenderMode, ServerRoute } from '@angular/ssr';
import { environment } from 'src/environments/environment';

// Em producao (Vercel), um pre-render vazio NUNCA pode passar silenciosamente:
// se a lista de slugs vier vazia, nenhuma pagina e gerada e cada URL cai no
// fallback estatico da Home (canonical -> home, nao indexavel) — exatamente o
// P0 de indexacao que reabriu entre a S1 e a S8 com build verde. O guard da S11
// transforma essa falha silenciosa em falha barulhenta: aborta o build.
// Em preview/local (VERCEL_ENV != 'production') o fluxo segue tolerante ([]),
// para nao travar desenvolvimento nem previews legitimamente vazios.
const isProductionBuild = process.env['VERCEL_ENV'] === 'production';

// Busca, em tempo de build, os slugs de um recurso do Supabase (artigos,
// categorias ou autores) para pre-renderizar cada rota como HTML estatico com
// SEO proprio. Loga sempre a contagem (inspecao rapida no log da Vercel) e, em
// producao, aborta o build se a lista vier vazia. Em falha de rede/Supabase a
// lista resultante e vazia: o guard de producao trata os dois casos (erro de
// rede ou zero linhas) de forma identica — ambos sao fatais em producao.
async function fetchPrerenderSlugs(resource: string, label: string): Promise<Array<{ slug: string }>> {
	let slugs: Array<{ slug: string }> = [];

	try {
		const response = await fetch(`${environment.supabaseUrl}/rest/v1/${resource}?select=slug`, {
			headers: {
				apikey: environment.supabaseKey,
				Authorization: `Bearer ${environment.supabaseKey}`,
			},
		});

		if (!response.ok) throw new Error(`Supabase respondeu ${response.status} ao listar ${label}`);

		const rows = (await response.json()) as Array<{ slug: string }>;
		slugs = rows.map((row) => ({ slug: row.slug }));
	} catch (error) {
		console.error(`[prerender] Falha ao buscar slugs de ${label} no Supabase:`, error);
	}

	console.log(`[prerender] ${label}: ${slugs.length} slug(s) para pre-renderizar.`);

	if (isProductionBuild && slugs.length === 0) {
		throw new Error(
			`[prerender] ABORTANDO O BUILD: nenhum slug de ${label} encontrado em producao ` +
				`(VERCEL_ENV=production). Pre-renderizar com a lista vazia faria cada pagina cair no ` +
				`fallback de SEO da Home (P0 de indexacao). Verifique a conectividade com o Supabase e ` +
				`as variaveis de Build (SUPABASE_URL/SUPABASE_KEY) no projeto da Vercel.`,
		);
	}

	return slugs;
}

// Pre-renderiza cada artigo (/blog/:slug) como HTML estatico com SEO proprio.
function getPublishedArticleSlugs(): Promise<Array<{ slug: string }>> {
	return fetchPrerenderSlugs('published_articles', 'artigos');
}

// Pre-renderiza cada pagina de arquivo de categoria (/blog/categoria/:slug).
function getCategorySlugs(): Promise<Array<{ slug: string }>> {
	return fetchPrerenderSlugs('categories', 'categorias');
}

// Pre-renderiza cada pagina de perfil de autor (/autor/:slug) — E-E-A-T.
function getAuthorSlugs(): Promise<Array<{ slug: string }>> {
	return fetchPrerenderSlugs('authors', 'autores');
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
		path: 'autor/:slug',
		renderMode: RenderMode.Prerender,
		getPrerenderParams: getAuthorSlugs,
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
