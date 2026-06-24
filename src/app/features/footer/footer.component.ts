import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BUSINESS, WHATSAPP_URL } from 'src/app/core/config/site.config';

@Component({
	selector: 'app-footer',
	templateUrl: './footer.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [RouterLink],
})
export class FooterComponent {
	anoAtual = new Date().getFullYear();

	/** Dados de contato e redes sociais da config central (S13). */
	protected readonly business = BUSINESS;
	protected readonly whatsappUrl = WHATSAPP_URL;

	/** Retorna o rótulo da plataforma social a partir da URL. */
	socialLabel(url: string): string {
		if (url.includes('instagram')) return 'Instagram';
		if (url.includes('facebook')) return 'Facebook';
		if (url.includes('tiktok')) return 'TikTok';
		return 'Rede Social';
	}

	/** Retorna o identificador de plataforma para seleção do ícone SVG inline. */
	socialPlatform(url: string): 'instagram' | 'facebook' | 'tiktok' | 'other' {
		if (url.includes('instagram')) return 'instagram';
		if (url.includes('facebook')) return 'facebook';
		if (url.includes('tiktok')) return 'tiktok';
		return 'other';
	}
}
