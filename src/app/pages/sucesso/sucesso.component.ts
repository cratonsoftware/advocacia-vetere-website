import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';

@Component({
	selector: 'app-sucesso',
	imports: [RouterLink],
	templateUrl: './sucesso.component.html',
})
export class SucessoComponent implements OnInit {
	private seoService = inject(SeoService);

	ngOnInit(): void {
		this.seoService.updateMetaTags({
			title: 'Mensagem Enviada | Dra. Maria Fernanda Vetere',
			description: 'Agradecemos o seu contacto. Retornaremos o mais breve possível.',
			slug: 'sucesso',
			noIndex: true,
		});
	}
}
