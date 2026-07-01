import { ImageResponse } from '@vercel/og';

// Runtime edge — exigido pelo @vercel/og (Satori + resvg-wasm).
export const config = { runtime: 'edge' };

// Duplicação consciente e documentada (ver S13/site.config.ts): esta Serverless Function
// compila FORA do bundle Angular, então mantém as constantes localmente. Fonte canônica: site.config.ts.
const SITE = 'https://www.mfernandavetere.adv.br';
const PANEL = '#572c1c';
const INK = '#fff3ea';

// Hyperscript mínimo: evita JSX/React no projeto Angular. Devolve o formato de elemento que o Satori lê.
function h(type: string, props: Record<string, unknown>, ...children: unknown[]): unknown {
	return { type, props: { ...props, children: children.length <= 1 ? children[0] : children } };
}

// Headline curta para o card (≠ meta_title). Usa `ogHeadline` se existir; senão, corta o `title`
// na primeira pontuação de fim de frase (? ! .) — cobre bem os títulos atuais.
function deriveHeadline(title: string, explicit?: string | null): string {
	if (explicit && explicit.trim()) return explicit.trim();
	const match = title.match(/^[^?!.]*[?!.]/);
	let headline = (match ? match[0] : title).trim();
	if (headline.length > 60) headline = headline.slice(0, 57).trimEnd() + '…';
	return headline;
}

// Auto-ajuste do corpo do título para caber no painel (62–64 no spec; reduz em headlines longas).
function fontSizeFor(text: string): number {
	const n = text.length;
	if (n <= 22) return 64;
	if (n <= 34) return 56;
	if (n <= 46) return 48;
	return 42;
}

async function arrayBuffer(url: string): Promise<ArrayBuffer> {
	const res = await fetch(url);
	if (!res.ok) throw new Error(`fetch ${url} → ${res.status}`);
	return res.arrayBuffer();
}

export default async function handler(req: Request): Promise<Response> {
	try {
		const slug = new URL(req.url).searchParams.get('slug');
		if (!slug) return new Response('missing slug', { status: 400 });

		const supabaseUrl = process.env['SUPABASE_URL'];
		const supabaseKey = process.env['SUPABASE_KEY'];
		if (!supabaseUrl || !supabaseKey) throw new Error('Variáveis do Supabase ausentes');

		// PostgREST direto (mesma API REST que o app Angular usa via HttpClient).
		const query = `${supabaseUrl}/rest/v1/published_articles?slug=eq.${encodeURIComponent(slug)}&select=title,coverImage,ogHeadline&limit=1`;
		const res = await fetch(query, { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } });
		const rows = (await res.json()) as Array<{ title: string; coverImage: string; ogHeadline: string | null }>;
		const article = Array.isArray(rows) ? rows[0] : null;
		if (!article) return Response.redirect(`${SITE}/assets/cards/card-blog.png`, 302);

		// `ogHeadline` (controle manual da Dra.) tem prioridade; senão deriva do título.
		const headline = deriveHeadline(article.title, article.ogHeadline);
		const titleSize = fontSizeFor(headline);

		const [anticDidone, inter] = await Promise.all([arrayBuffer(`${SITE}/assets/fonts/AnticDidone-Regular.ttf`), arrayBuffer(`${SITE}/assets/fonts/Inter-VariableFont_opsz%2Cwght.ttf`)]);

		const tree = h(
			'div',
			{ style: { display: 'flex', width: '1200px', height: '630px', fontFamily: 'Inter' } },
			// Painel esquerdo (#572c1c) — 669.9 × 630
			h(
				'div',
				{ style: { position: 'relative', display: 'flex', width: '669.9px', height: '630px', backgroundColor: PANEL } },
				// Logo — 314.6 × 118.6 @ (63.9, 63), opacidade 70%
				h('img', {
					src: `${SITE}/assets/logo/mfv-logo-sem-cla-hor.png`,
					width: 315,
					height: 119,
					style: { position: 'absolute', left: '63.9px', top: '63px', width: '314.6px', height: '118.6px', opacity: 0.7 },
				}),
				// Título — Antic Didone, centralizado verticalmente entre a logo (base ~181.6) e o site (topo ~540.5)
				h(
					'div',
					{
						style: {
							position: 'absolute',
							left: '63px',
							top: '181.6px',
							width: '543px',
							height: '358.9px',
							display: 'flex',
							alignItems: 'center',
						},
					},
					h('div', { style: { display: 'flex', fontFamily: 'Antic Didone', fontSize: `${titleSize}px`, lineHeight: 1.05, color: INK } }, headline),
				),
				// Site — Inter 16.6, opacidade 50% @ (63.9, 540.5)
				h('div', { style: { position: 'absolute', left: '63.9px', top: '540.5px', fontFamily: 'Inter', fontSize: '16.6px', color: INK, opacity: 0.5 } }, 'mfernandavetere.adv.br'),
			),
			// Foto (limpa, do Storage) — 530.1 × 630, cobrindo
			h('img', {
				src: article.coverImage,
				width: 530,
				height: 630,
				style: { width: '530.1px', height: '630px', objectFit: 'cover' },
			}),
		);

		return new ImageResponse(tree as never, {
			width: 1200,
			height: 630,
			fonts: [
				{ name: 'Antic Didone', data: anticDidone, weight: 400, style: 'normal' },
				{ name: 'Inter', data: inter, weight: 400, style: 'normal' },
			],
			headers: { 'cache-control': 'public, max-age=86400, s-maxage=604800, immutable' },
		});
	} catch {
		// Falha → o social ainda recebe uma imagem válida (card estático do blog).
		return Response.redirect(`${SITE}/assets/cards/card-blog.png`, 302);
	}
}
