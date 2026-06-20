import { DOCUMENT, Injectable, inject } from '@angular/core';
import { Meta, MetaDefinition, Title } from '@angular/platform-browser';
import { SeoConfig } from '../models/seo.model';

@Injectable({ providedIn: 'root' })
export class SeoService {
	private titleService = inject(Title);
	private meta = inject(Meta);
	private document = inject(DOCUMENT);

	private readonly siteName = 'Dra. Maria Fernanda Vetere | Advocacia & Consultoria';
	private readonly defaultImage = '/assets/cards/card-home.png';
	private readonly baseUrl = 'https://www.mfernandavetere.adv.br';
	private readonly locale = 'pt_BR';

	/** Dados do negócio local — fonte única para o schema `LegalService`. */
	private readonly business = {
		telephone: '+5519994113652',
		email: 'mfernandavetereadv@gmail.com',
		streetAddress: 'R. Francisco Cordeiro do Valle, 82 - Centro',
		addressLocality: 'Tambaú',
		addressRegion: 'SP',
		postalCode: '13710-073',
		addressCountry: 'BR',
		latitude: -21.7083882,
		longitude: -47.2714927,
		priceRange: '$$',
		sameAs: ['https://instagram.com/mfernandavetere', 'https://facebook.com/profile.php?id=61587259521188', 'https://tiktok.com/@mfernandavetere'],
	};

	updateMetaTags(config: SeoConfig) {
		const fullTitle = config.title.includes('Dra. Maria Fernanda Vetere') ? config.title : `${config.title} | Dra. Maria Fernanda Vetere`;
		this.titleService.setTitle(fullTitle);

		let url = this.baseUrl;
		if (config.slug) {
			const cleanSlug = config.slug.startsWith('/') ? config.slug.substring(1) : config.slug;
			url = `${this.baseUrl}/${cleanSlug}`;
		}

		const rawImageUrl = config.image || this.defaultImage;
		const absoluteImageUrl = rawImageUrl.startsWith('http') ? rawImageUrl : `${this.baseUrl}${rawImageUrl.startsWith('/') ? '' : '/'}${rawImageUrl}`;
		const type = config.type || 'website';
		const imageAlt = config.imageAlt || fullTitle;

		if (config.noIndex) this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
		else this.meta.updateTag({ name: 'robots', content: 'index, follow' });

		const tags: MetaDefinition[] = [
			{ name: 'description', content: config.description },
			{ name: 'keywords', content: config.keywords || 'advocacia, direito, consultoria jurídica' },

			{ property: 'og:title', content: fullTitle },
			{ property: 'og:description', content: config.description },
			{ property: 'og:image', content: absoluteImageUrl },
			{ property: 'og:image:secure_url', content: absoluteImageUrl },
			{ property: 'og:image:width', content: '1200' },
			{ property: 'og:image:height', content: '630' },
			{ property: 'og:image:alt', content: imageAlt },
			{ property: 'og:url', content: url },
			{ property: 'og:type', content: type },
			{ property: 'og:site_name', content: this.siteName },
			{ property: 'og:locale', content: this.locale },

			{ name: 'twitter:card', content: 'summary_large_image' },
			{ name: 'twitter:title', content: fullTitle },
			{ name: 'twitter:description', content: config.description },
			{ name: 'twitter:image', content: absoluteImageUrl },
			{ name: 'twitter:image:alt', content: imageAlt },
		];

		if (type === 'article') {
			if (config.author) tags.push({ property: 'article:author', content: config.author });
			if (config.publishedDate) tags.push({ property: 'article:published_time', content: config.publishedDate });
			if (config.modifiedDate) tags.push({ property: 'article:modified_time', content: config.modifiedDate });
			if (config.articleSection) tags.push({ property: 'article:section', content: config.articleSection });
		} else {
			this.meta.removeTag("property='article:author'");
			this.meta.removeTag("property='article:published_time'");
			this.meta.removeTag("property='article:modified_time'");
			this.meta.removeTag("property='article:section'");
		}

		tags.forEach((tag) => {
			const seletor = tag.property ? `property="${tag.property}"` : `name="${tag.name}"`;
			this.meta.updateTag(tag, seletor);
		});

		this.setCanonicalUrl(url);
		this.setJsonLd(config, url, absoluteImageUrl, fullTitle, imageAlt);
		this.setBreadcrumbJsonLd(config.breadcrumbs);
		this.setFaqJsonLd(config.faq);
	}

	private setCanonicalUrl(url: string) {
		let link: HTMLLinkElement | null = this.document.querySelector('link[rel="canonical"]');
		if (!link) {
			link = this.document.createElement('link');
			link.setAttribute('rel', 'canonical');
			this.document.head.appendChild(link);
		}
		link.setAttribute('href', url);
	}

	/** Obtém (ou cria) um bloco JSON-LD identificado por `data-seo`, permitindo múltiplos blocos por página. */
	private getJsonLdScript(id: string): HTMLScriptElement {
		let script = this.document.querySelector(`script[type="application/ld+json"][data-seo="${id}"]`) as HTMLScriptElement | null;
		if (!script) {
			script = this.document.createElement('script');
			script.setAttribute('type', 'application/ld+json');
			script.setAttribute('data-seo', id);
			this.document.head.appendChild(script);
		}
		return script;
	}

	private setJsonLd(config: SeoConfig, url: string, imageUrl: string, fullTitle: string, imageAlt: string) {
		const script = this.getJsonLdScript('main');

		let schema: Record<string, unknown>;

		if (config.type === 'article') {
			const author: Record<string, unknown> = {
				'@type': 'Person',
				name: config.authorPerson?.name || config.author || 'Dra. Maria Fernanda Vetere',
				jobTitle: config.authorPerson?.jobTitle || 'Advogada',
				url: config.authorPerson?.url || this.baseUrl,
			};
			if (config.authorPerson?.oab) author['identifier'] = config.authorPerson.oab;
			if (config.authorPerson?.sameAs?.length) author['sameAs'] = config.authorPerson.sameAs;

			schema = {
				'@context': 'https://schema.org',
				'@type': 'BlogPosting',
				mainEntityOfPage: { '@type': 'WebPage', '@id': url },
				headline: fullTitle,
				description: config.description,
				image: { '@type': 'ImageObject', url: imageUrl, width: 1200, height: 630, caption: imageAlt },
				author,
				publisher: {
					'@type': 'LegalService',
					name: this.siteName,
					logo: { '@type': 'ImageObject', url: `${this.baseUrl}${this.defaultImage}` },
				},
				datePublished: config.publishedDate,
				dateModified: config.modifiedDate || config.publishedDate,
				inLanguage: config.inLanguage || 'pt-BR',
			};
			if (config.articleSection) schema['articleSection'] = config.articleSection;
			if (config.keywords) schema['keywords'] = config.keywords;
		} else if (config.slug === 'blog') {
			schema = {
				'@context': 'https://schema.org',
				'@type': 'Blog',
				name: 'Blog Jurídico | Dra. Maria Fernanda Vetere',
				description: config.description,
				url: url,
				inLanguage: 'pt-BR',
				publisher: { '@type': 'LegalService', name: this.siteName },
			};
		} else if (config.slug?.startsWith('blog/categoria')) {
			schema = {
				'@context': 'https://schema.org',
				'@type': 'CollectionPage',
				name: fullTitle,
				description: config.description,
				url: url,
				inLanguage: 'pt-BR',
				isPartOf: { '@type': 'Blog', name: 'Blog Jurídico | Dra. Maria Fernanda Vetere', url: `${this.baseUrl}/blog` },
				publisher: { '@type': 'LegalService', name: this.siteName },
			};
		} else {
			schema = {
				'@context': 'https://schema.org',
				'@type': 'LegalService',
				name: this.siteName,
				url: url,
				image: imageUrl,
				logo: `${this.baseUrl}${this.defaultImage}`,
				description: config.description,
				telephone: this.business.telephone,
				email: this.business.email,
				priceRange: this.business.priceRange,
				address: {
					'@type': 'PostalAddress',
					streetAddress: this.business.streetAddress,
					addressLocality: this.business.addressLocality,
					addressRegion: this.business.addressRegion,
					postalCode: this.business.postalCode,
					addressCountry: this.business.addressCountry,
				},
				geo: {
					'@type': 'GeoCoordinates',
					latitude: this.business.latitude,
					longitude: this.business.longitude,
				},
				openingHoursSpecification: [
					{
						'@type': 'OpeningHoursSpecification',
						dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
						opens: '09:00',
						closes: '12:00',
					},
					{
						'@type': 'OpeningHoursSpecification',
						dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
						opens: '13:00',
						closes: '17:00',
					},
				],
				sameAs: this.business.sameAs,
				areaServed: [
					{ '@type': 'City', name: 'Tambaú' },
					{ '@type': 'Country', name: 'BR', description: 'Consultoria e Atendimento Jurídico Online para todo o Brasil' },
				],
				knowsAbout: ['Direito Civil', 'Direito de Família', 'Direito Trabalhista', 'Processos Judiciais'],
			};
		}

		script.textContent = JSON.stringify(schema);
	}

	/** Injeta (ou remove) o `BreadcrumbList` — presente apenas em páginas que fornecem `breadcrumbs`. */
	private setBreadcrumbJsonLd(breadcrumbs?: SeoConfig['breadcrumbs']) {
		const existing = this.document.querySelector('script[type="application/ld+json"][data-seo="breadcrumb"]');
		if (!breadcrumbs || breadcrumbs.length === 0) {
			existing?.remove();
			return;
		}

		const script = this.getJsonLdScript('breadcrumb');
		const schema = {
			'@context': 'https://schema.org',
			'@type': 'BreadcrumbList',
			itemListElement: breadcrumbs.map((item, index) => ({
				'@type': 'ListItem',
				position: index + 1,
				name: item.name,
				item: item.url,
			})),
		};
		script.textContent = JSON.stringify(schema);
	}

	/** Injeta (ou remove) o `FAQPage` — presente apenas quando o artigo fornece `faq`. */
	private setFaqJsonLd(faq?: SeoConfig['faq']) {
		const existing = this.document.querySelector('script[type="application/ld+json"][data-seo="faq"]');
		if (!faq || faq.length === 0) {
			existing?.remove();
			return;
		}

		const script = this.getJsonLdScript('faq');
		const schema = {
			'@context': 'https://schema.org',
			'@type': 'FAQPage',
			mainEntity: faq.map((item) => ({
				'@type': 'Question',
				name: item.q,
				acceptedAnswer: { '@type': 'Answer', text: item.a },
			})),
		};
		script.textContent = JSON.stringify(schema);
	}
}
