import { Injectable, inject } from '@angular/core';
import { Meta, MetaDefinition, Title } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class SeoService {
	private title = inject(Title);
	private meta = inject(Meta);

	updateMetaTags(config: { title: string; description: string; image: string; slug: string }) {
		const fullTitle = `${config.title} | Maria Fernanda Vetere`;
		this.title.setTitle(fullTitle);

		const tags: MetaDefinition[] = [
			{ name: 'description', content: config.description },
			{ property: 'og:title', content: fullTitle },
			{ property: 'og:description', content: config.description },
			{ property: 'og:image', content: config.image },
			{ property: 'og:url', content: `https://vetere.craton.com.br/blog/${config.slug}` },
			{ property: 'og:type', content: 'article' },
			{ name: 'twitter:card', content: 'summary_large_image' },
		];

		tags.forEach((tag) => this.meta.updateTag(tag));
	}
}
