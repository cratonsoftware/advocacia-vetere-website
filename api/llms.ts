import { createClient } from '@supabase/supabase-js';

// Gera dinamicamente o /llms.txt (Markdown) — um "sitemap voltado a IA" que faz a
// curadoria do conteúdo mais valioso do site para crawlers de LLMs (ChatGPT, Claude,
// Gemini, Perplexity). Reescrito de /llms.txt para /api/llms via vercel.json.
// Padrão emergente documentado em BLOG-SEO.md §4.5.
export default async function handler(req: any, res: any) {
	try {
		const baseUrl = 'https://www.mfernandavetere.adv.br';
		const supabaseUrl = process.env['SUPABASE_URL'];
		const supabaseKey = process.env['SUPABASE_KEY'];

		if (!supabaseUrl || !supabaseKey) throw new Error('Variáveis do Supabase ausentes');

		const supabase = createClient(supabaseUrl, supabaseKey, {
			auth: { persistSession: false },
		});

		const { data: articles, error } = await supabase.from('published_articles').select('slug, title, excerpt, tldr, category, "categorySlug"').order('publishedAt', { ascending: false });
		if (error) throw error;

		// Autores (E-E-A-T) — perfis com bio/OAB para sinalizar autoria confiável aos crawlers de IA.
		const { data: authors } = await supabase.from('authors').select('name, slug, role, oab, bio');

		// Reduz qualquer texto a uma única linha limpa (sem quebras nem markdown de cabeçalho).
		const oneLine = (value: string | null | undefined, max = 200): string => {
			const text = (value || '')
				.replace(/[#*_>`]/g, '')
				.replace(/\s+/g, ' ')
				.trim();
			return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
		};

		// Categorias distintas presentes nos artigos publicados (para a seção de hubs).
		const categories = new Map<string, string>();
		(articles || []).forEach((a: any) => {
			if (a.categorySlug && !categories.has(a.categorySlug)) categories.set(a.categorySlug, a.category);
		});

		const lines: string[] = [];
		lines.push('# Dra. Maria Fernanda Vetere | Advocacia & Consultoria');
		lines.push('');
		lines.push(
			'> Escritório de advocacia em Tambaú-SP, com atendimento jurídico online para todo o Brasil. Atuação em Direito de Família e Sucessões, Direito Civil e Direito do Trabalho. Conteúdo jurídico claro e confiável, assinado pela Dra. Maria Fernanda Vetere (OAB/SP 527.527).',
		);
		lines.push('');

		lines.push('## Páginas principais');
		lines.push(`- [Início](${baseUrl}/): Apresentação do escritório, áreas de atuação, avaliações e contato.`);
		lines.push(`- [Blog Jurídico](${baseUrl}/blog): Artigos, análises e orientações sobre o mundo jurídico.`);
		lines.push('');

		lines.push('## Áreas de atuação');
		lines.push('- Direito de Família e Sucessões: divórcio, guarda, pensão, inventário e planejamento sucessório.');
		lines.push('- Direito Civil: responsabilidade civil, contratos, danos morais e materiais.');
		lines.push('- Direito do Trabalho: orientação e atuação em relações e direitos trabalhistas.');
		lines.push('');

		if (authors && authors.length) {
			lines.push('## Autores');
			authors.forEach((a: any) => {
				const credential = [a.role, a.oab].filter(Boolean).join(', ');
				const detail = oneLine(a.bio) || credential || 'Perfil do autor.';
				lines.push(`- [${oneLine(a.name, 80)}](${baseUrl}/autor/${a.slug})${credential ? ` (${credential})` : ''}: ${detail}`);
			});
			lines.push('');
		}

		if (categories.size > 0) {
			lines.push('## Categorias do blog');
			for (const [slug, name] of categories) {
				lines.push(`- [${name}](${baseUrl}/blog/categoria/${slug}): Artigos sobre ${name}.`);
			}
			lines.push('');
		}

		lines.push('## Artigos do blog');
		if (articles && articles.length) {
			articles.forEach((a: any) => {
				lines.push(`- [${oneLine(a.title, 120)}](${baseUrl}/blog/${a.slug}): ${oneLine(a.tldr || a.excerpt)}`);
			});
		} else {
			lines.push('- Nenhum artigo publicado no momento.');
		}
		lines.push('');

		const body = lines.join('\n');

		res.setHeader('Content-Type', 'text/plain; charset=utf-8');
		res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
		res.status(200).send(body);
	} catch (error) {
		console.error('Erro ao gerar llms.txt:', error);
		res.status(500).send('Erro interno');
	}
}
