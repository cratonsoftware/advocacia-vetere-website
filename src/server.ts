import { AngularNodeAppEngine, createNodeRequestHandler, isMainModule, writeResponseToNodeResponse } from '@angular/ssr/node';
import { createClient } from '@supabase/supabase-js';
import express from 'express';
import { join } from 'node:path';
import { environment } from './environments/environment';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

app.get(['/sitemap.xml', '/sitemap-dinamico'], async (req, res) => {
	console.log('Gerando sitemap dinâmico...');
	try {
		const baseUrl = 'https://mfernandavetere.adv.br';

		const supabase = createClient(environment.supabaseUrl, environment.supabaseKey, {
			auth: {
				persistSession: false,
				autoRefreshToken: false,
				detectSessionInUrl: false,
			},
		});

		const { data: articles, error } = await supabase.from('published_articles').select('slug, date');

		if (error) throw error;

		let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <priority>1.0</priority>
    <changefreq>monthly</changefreq>
  </url>
  <url>
    <loc>${baseUrl}/blog</loc>
    <priority>0.8</priority>
    <changefreq>weekly</changefreq>
  </url>`;

		if (articles) {
			articles.forEach((artigo) => {
				const lastMod = artigo.date || new Date().toISOString();
				xml += `
  <url>
    <loc>${baseUrl}/blog/${artigo.slug}</loc>
    <lastmod>${new Date(lastMod).toISOString().split('T')[0]}</lastmod>
    <priority>0.7</priority>
  </url>`;
			});
		}

		xml += `\n</urlset>`;

		res.header('Content-Type', 'application/xml');
		res.send(xml);
	} catch (error) {
		console.error('Erro ao gerar sitemap pelo Supabase:', error);
		res.status(500).send('Erro interno ao gerar o sitemap');
	}
});

app.use(
	express.static(browserDistFolder, {
		maxAge: '1y',
		index: false,
		redirect: false,
	}),
);

app.use((req, res, next) => {
	angularApp
		.handle(req)
		.then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
		.catch(next);
});

if (isMainModule(import.meta.url) || process.env['pm_id']) {
	const port = process.env['PORT'] || 4000;
	app.listen(port, (error) => {
		if (error) {
			throw error;
		}

		console.log(`Node Express server listening on http://localhost:${port}`);
	});
}

export const reqHandler = createNodeRequestHandler(app);
