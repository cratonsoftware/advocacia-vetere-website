import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';

@Component({
	selector: 'app-not-found',
	imports: [RouterLink],
	templateUrl: './not-found.component.html',
})
export class NotFoundComponent implements OnInit {
	private seoService = inject(SeoService);

	ngOnInit(): void {
		this.seoService.updateMetaTags({
			title: 'Página Não Encontrada | Dra. Maria Fernanda Vetere',
			description: 'Lamentamos, mas a página que você procura não existe ou foi movida.',
			slug: '404',
			noIndex: true,
		});
	}
}
