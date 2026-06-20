import { createClient } from '@supabase/supabase-js';
import { create } from 'xmlbuilder2';

export default async function handler(req: any, res: any) {
	try {
		const baseUrl = 'https://www.mfernandavetere.adv.br';
		const supabaseUrl = process.env['SUPABASE_URL'];
		const supabaseKey = process.env['SUPABASE_KEY'];

		if (!supabaseUrl || !supabaseKey) throw new Error('Variáveis do Supabase ausentes');

		const supabase = createClient(supabaseUrl, supabaseKey, {
			auth: { persistSession: false },
		});

		const { data: articles, error } = await supabase.from('published_articles').select('slug, date, updatedAt, category, "categorySlug"').order('updatedAt', { ascending: false });
		if (error) throw error;

		// Normaliza um timestamp para "YYYY-MM-DD" (formato aceito em <lastmod>).
		const toDay = (value: string | null | undefined): string => new Date(value || Date.now()).toISOString().split('T')[0];

		// lastmod de home e /blog = data de modificação mais recente entre os artigos (sinal de frescor).
		const siteLastMod = articles && articles.length ? toDay(articles[0].updatedAt || articles[0].date) : toDay(null);

		const doc = create({ version: '1.0', encoding: 'UTF-8' }).ele('urlset', { xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9' });

		doc.ele('url').ele('loc').txt(`${baseUrl}/`).up().ele('lastmod').txt(siteLastMod).up().ele('priority').txt('1.0').up().ele('changefreq').txt('monthly').up().up();

		doc.ele('url').ele('loc').txt(`${baseUrl}/blog`).up().ele('lastmod').txt(siteLastMod).up().ele('priority').txt('0.8').up().ele('changefreq').txt('weekly').up().up();

		// Páginas de categoria (hubs de topical authority) — uma por categorySlug distinto entre os publicados.
		const categorySlugs = new Set<string>();
		(articles || []).forEach((artigo: any) => {
			if (artigo.categorySlug) categorySlugs.add(artigo.categorySlug);
		});
		categorySlugs.forEach((categorySlug) => {
			doc.ele('url').ele('loc').txt(`${baseUrl}/blog/categoria/${categorySlug}`).up().ele('lastmod').txt(siteLastMod).up().ele('priority').txt('0.6').up().ele('changefreq').txt('weekly').up().up();
		});

		if (articles) {
			articles.forEach((artigo: any) => {
				const lastMod = toDay(artigo.updatedAt || artigo.date);
				doc.ele('url').ele('loc').txt(`${baseUrl}/blog/${artigo.slug}`).up().ele('lastmod').txt(lastMod).up().ele('priority').txt('0.7').up().up();
			});
		}

		const xml = doc.end({ prettyPrint: true });

		res.setHeader('Content-Type', 'text/xml; charset=utf-8');
		res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
		res.status(200).send(xml);
	} catch (error) {
		console.error('Erro ao gerar sitemap:', error);
		res.status(500).send('Erro interno');
	}
}
