import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from 'src/app/core/services/seo.service';

@Component({
	selector: 'app-artigo-not-found',
	templateUrl: './not-found.component.html',
	imports: [RouterLink],
})
export class ArtigoNotFoundComponent implements OnInit {
	private seoService = inject(SeoService);

	ngOnInit(): void {
		this.seoService.updateMetaTags({
			title: 'Artigo Não Encontrado | Blog Vetere',
			description: 'Lamentamos, mas o artigo solicitado não foi encontrado em nosso banco de dados. Explore outros temas jurídicos em nossa listagem completa.',
			slug: 'blog/404',
			noIndex: true,
		});
	}
}
