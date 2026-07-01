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

async function fetchBuffer(url: string): Promise<ArrayBuffer> {
	const res = await fetch(url);
	if (!res.ok) throw new Error(`fetch ${url} → ${res.status}`);
	return res.arrayBuffer();
}

/** Base64 em chunks — evita estouro de pilha do `String.fromCharCode(...)` em buffers grandes. */
function toBase64(buffer: ArrayBuffer): string {
	const bytes = new Uint8Array(buffer);
	let binary = '';
	const chunk = 0x8000;
	for (let i = 0; i < bytes.length; i += chunk) {
		binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)));
	}
	return btoa(binary);
}

/**
 * Busca uma imagem e devolve como data-URI PNG/JPEG (formatos que o Satori decodifica — WebP NÃO é suportado).
 * Rejeita respostas que não sejam imagem (ex.: fallback SPA que devolve HTML com 200), evitando o
 * "PNG de 0 bytes" (a falha do Satori acontece em streaming, depois do header, e não vira erro 500).
 */
async function fetchImageDataUri(url: string): Promise<string> {
	const res = await fetch(url);
	if (!res.ok) throw new Error(`img ${url} → ${res.status}`);
	const mime = res.headers.get('content-type') || '';
	if (!mime.startsWith('image/') || mime.includes('webp')) throw new Error(`img ${url} → tipo não suportado: ${mime}`);
	return `data:${mime};base64,${toBase64(await res.arrayBuffer())}`;
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

		// Foto: o Satori não lê WebP. A página usa o `.webp` limpo; para o card usamos o `.png` irmão
		// (mantido no Storage). Se um dia só houver JPEG, também funciona (Satori suporta JPEG).
		const photoUrl = article.coverImage.replace(/\.webp$/i, '.png');

		// Fontes (binário — carregam direto). Logo/foto viram data-URI (robustez contra falha silenciosa).
		const [anticDidone, inter, photo] = await Promise.all([
			fetchBuffer(`${SITE}/assets/fonts/AnticDidone-Regular.ttf`),
			fetchBuffer(`${SITE}/assets/fonts/Inter-VariableFont_opsz,wght.ttf`),
			fetchImageDataUri(photoUrl),
		]);

		// Logo é opcional: se falhar, o card ainda sai (só sem o logo), em vez de zerar.
		let logo: string | null = null;
		try {
			logo = await fetchImageDataUri(`${SITE}/assets/logo/mfv-logo-sem-cla-hor.png`);
		} catch {
			logo = null;
		}

		const panelChildren: unknown[] = [];
		if (logo) {
			panelChildren.push(
				h('img', {
					src: logo,
					width: 315,
					height: 119,
					style: { position: 'absolute', left: '63.9px', top: '63px', width: '314.6px', height: '118.6px', opacity: 0.7 },
				}),
			);
		}
		panelChildren.push(
			h(
				'div',
				{ style: { position: 'absolute', left: '63px', top: '181.6px', width: '543px', height: '358.9px', display: 'flex', alignItems: 'center' } },
				h('div', { style: { display: 'flex', fontFamily: 'Antic Didone', fontSize: `${titleSize}px`, lineHeight: 1.05, color: INK } }, headline),
			),
			h('div', { style: { position: 'absolute', left: '63.9px', top: '540.5px', fontFamily: 'Inter', fontSize: '16.6px', color: INK, opacity: 0.5 } }, 'mfernandavetere.adv.br'),
		);

		const tree = h(
			'div',
			{ style: { display: 'flex', width: '1200px', height: '630px', fontFamily: 'Inter' } },
			// Painel esquerdo (#572c1c) — 669.9 × 630
			h('div', { style: { position: 'relative', display: 'flex', width: '669.9px', height: '630px', backgroundColor: PANEL } }, ...panelChildren),
			// Foto (limpa, do Storage, versão PNG) — 530.1 × 630, cobrindo
			h('img', { src: photo, width: 530, height: 630, style: { width: '530.1px', height: '630px', objectFit: 'cover' } }),
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
