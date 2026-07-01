/**
 * site.config.ts — Configuração central de constantes do site (S13).
 *
 * Fonte ÚNICA de verdade para valores que antes ficavam espalhados/duplicados
 * pelo código: URL base, dados de contato do negócio, link/mensagem do WhatsApp
 * e o rótulo mágico da categoria "Todos". Consumido pelo bundle Angular
 * (SeoService, páginas e templates).
 *
 * NOTA (S13): as Serverless Functions em `api/*` e o `src/robots.txt` compilam/
 * vivem FORA do bundle Angular. Por decisão arquitetural (duplicação consciente
 * e documentada), elas mantêm a URL base localmente, com comentário apontando
 * para este arquivo como fonte canônica. Ao alterar `SITE_URL`, atualizar também
 * `api/sitemap.ts`, `api/llms.ts` e `src/robots.txt`.
 */

/** URL base canônica (produção), sem barra final. */
export const SITE_URL = 'https://www.mfernandavetere.adv.br';

/** Dados do negócio local — fonte única para contato (templates) e schema `LegalService`. */
export const BUSINESS = {
	/** Telefone em formato internacional (E.164) — `tel:`, WhatsApp e schema. */
	telephone: '+5519994113652',
	/** Telefone formatado para exibição. */
	telephoneDisplay: '(19) 99411-3652',
	email: 'mfernandavetereadv@gmail.com',
	streetAddress: 'R. Francisco Cordeiro do Valle, 82 - Centro',
	addressLocality: 'Tambaú',
	addressRegion: 'SP',
	postalCode: '13710-073',
	addressCountry: 'BR',
	latitude: -21.7083882,
	longitude: -47.2714927,
	priceRange: '$$',
	/** Perfis sociais oficiais (schema `sameAs`). */
	sameAs: ['https://instagram.com/mfernandavetere', 'https://facebook.com/profile.php?id=61587259521188', 'https://tiktok.com/@mfernandavetere.adv'],
	/** Horário de atendimento. */
	openingHours: {
		daysLabel: 'Segunda a Sexta',
		periods: [
			{ opens: '09:00', closes: '12:00' },
			{ opens: '13:00', closes: '17:00' },
		],
	},
} as const;

/** Rótulo da pseudo-categoria "todas as categorias" no filtro do blog. */
export const ALL_CATEGORIES_LABEL = 'Todos';

/** WhatsApp — telefone e mensagem padrão (partes reutilizáveis; ex.: CTAs por seção na S17). */
export const WHATSAPP_PHONE = BUSINESS.telephone;
export const WHATSAPP_MESSAGE = 'Olá! Encontrei seu site e me identifiquei com seu trabalho. Gostaria de agendar um horário para conversar sobre meu caso. Qual a disponibilidade?';
/**
 * Link de conversa do WhatsApp com a mensagem pré-preenchida — fonte única.
 * Mantido como string canônica (pré-codificada) para preservar exatamente o link
 * já validado em produção. Ao alterar `WHATSAPP_MESSAGE`, regenerar este valor
 * (encodeURIComponent), lembrando que o `?` final permanece literal por convenção do link atual.
 */
export const WHATSAPP_URL =
	'https://wa.me/+5519994113652?text=Ol%C3%A1!%20Encontrei%20seu%20site%20e%20me%20identifiquei%20com%20seu%20trabalho.%20Gostaria%20de%20agendar%20um%20hor%C3%A1rio%20para%20conversar%20sobre%20meu%20caso.%20Qual%20a%20disponibilidade?';
