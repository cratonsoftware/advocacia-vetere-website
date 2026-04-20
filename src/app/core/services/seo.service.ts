import { DOCUMENT, Injectable, inject } from '@angular/core';
import { Meta, MetaDefinition, Title } from '@angular/platform-browser';
import { SeoConfig } from '../models/seo.model';

@Injectable({ providedIn: 'root' })
export class SeoService {
	private titleService = inject(Title);
	private meta = inject(Meta);
	private document = inject(DOCUMENT);

	private readonly siteName = 'Dra. Maria Fernanda Vetere | Advocacia & Consultoria';

	private readonly defaultImage = '/assets/logo/mfv-logo-com-cla-hor.png';

	updateMetaTags(config: SeoConfig) {
		const fullTitle = config.title.includes('Dra. Maria Fernanda') ? config.title : `${config.title} | Dra. Maria Fernanda Vetere`;

		this.titleService.setTitle(fullTitle);

		const origin = this.document.location.origin;
		const url = config.slug ? `${origin}/blog/${config.slug}` : origin;

		const rawImageUrl = config.image || this.defaultImage;
		const absoluteImageUrl = rawImageUrl.startsWith('http') ? rawImageUrl : `${origin}${rawImageUrl.startsWith('/') ? '' : '/'}${rawImageUrl}`;

		const type = config.type || 'website';

		const tags: MetaDefinition[] = [
			{ name: 'description', content: config.description },
			{ property: 'og:title', content: fullTitle },
			{ property: 'og:description', content: config.description },
			{ property: 'og:image', content: absoluteImageUrl },
			{ property: 'og:image:secure_url', content: absoluteImageUrl },
			{ property: 'og:image:width', content: '1200' },
			{ property: 'og:image:height', content: '630' },
			{ property: 'og:url', content: url },
			{ property: 'og:type', content: type },
			{ property: 'og:site_name', content: this.siteName },
			{ name: 'twitter:card', content: 'summary_large_image' },
			{ name: 'twitter:title', content: fullTitle },
			{ name: 'twitter:description', content: config.description },
			{ name: 'twitter:image', content: absoluteImageUrl },
		];

		if (type === 'article') {
			if (config.author) tags.push({ property: 'article:author', content: config.author });
			if (config.publishedDate) tags.push({ property: 'article:published_time', content: config.publishedDate });
			if (config.modifiedDate) tags.push({ property: 'article:modified_time', content: config.modifiedDate });
		}

		tags.forEach((tag) => this.meta.updateTag(tag));

		this.setCanonicalUrl(url);
		this.setJsonLd(config, url, absoluteImageUrl, fullTitle);
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

	private setJsonLd(config: SeoConfig, url: string, imageUrl: string, fullTitle: string) {
		let script = this.document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
		if (!script) {
			script = this.document.createElement('script');
			script.setAttribute('type', 'application/ld+json');
			this.document.head.appendChild(script);
		}

		let schema: any;

		if (config.type === 'article') {
			schema = {
				'@context': 'https://schema.org',
				'@type': 'BlogPosting',
				mainEntityOfPage: {
					'@type': 'WebPage',
					'@id': url,
				},
				headline: fullTitle,
				description: config.description,
				image: imageUrl,
				author: {
					'@type': 'Person',
					name: config.author || 'Dra. Maria Fernanda Vetere',
					url: this.document.location.origin,
				},
				publisher: {
					'@type': 'LegalService',
					name: this.siteName,
					logo: {
						'@type': 'ImageObject',
						url: `${this.document.location.origin}${this.defaultImage}`,
					},
				},
				datePublished: config.publishedDate,
				dateModified: config.modifiedDate || config.publishedDate,
			};
		} else {
			schema = {
				'@context': 'https://schema.org',
				'@type': 'LegalService',
				name: this.siteName,
				url: url,
				logo: `${this.document.location.origin}${this.defaultImage}`,
				description: config.description,
				image: imageUrl,
			};
		}

		script.textContent = JSON.stringify(schema);
	}
}
