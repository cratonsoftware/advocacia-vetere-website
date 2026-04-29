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
			description: 'A sua mensagem foi enviada com sucesso. Agradecemos o contato e informamos que a Dra. Maria Fernanda Vetere analisará sua solicitação para retornar com a devida brevidade e a atenção jurídica necessária.',
			slug: 'sucesso',
			type: 'website',
			noIndex: true,
		});
	}
}
