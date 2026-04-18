import { DOCUMENT, Inject, Injectable, inject } from '@angular/core';
import { Meta, MetaDefinition, Title } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class SeoService {
	private title = inject(Title);
	private meta = inject(Meta);

	constructor(@Inject(DOCUMENT) private document: Document) {}

	updateMetaTags(config: { title: string; description: string; image: string; slug: string }) {
		const fullTitle = `${config.title} | Dra. Maria Fernanda Vetere`;
		this.title.setTitle(fullTitle);

		const origin = this.document.location.origin;
		const fullUrl = `${origin}/blog/${config.slug}`;
		const absoluteImageUrl = config.image.startsWith('http') ? config.image : `${origin}${config.image}`;

		const tags: MetaDefinition[] = [
			{ name: 'description', content: config.description },
			{ property: 'og:title', content: fullTitle },
			{ property: 'og:description', content: config.description },
			{ property: 'og:image', content: absoluteImageUrl },
			{ property: 'og:url', content: fullUrl },
			{ property: 'og:type', content: 'article' },
			{ property: 'og:site_name', content: 'Dra. Maria Fernanda Vetere' },
			{ name: 'twitter:card', content: 'summary_large_image' },
			{ name: 'twitter:title', content: fullTitle },
			{ name: 'twitter:description', content: config.description },
			{ name: 'twitter:image', content: absoluteImageUrl },
		];

		tags.forEach((tag) => this.meta.updateTag(tag));
	}
}
