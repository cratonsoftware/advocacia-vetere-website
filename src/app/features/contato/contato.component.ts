import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NgxMaskDirective } from 'ngx-mask';
import { BUSINESS, WHATSAPP_URL_CONTATO } from '../../core/config/site.config';

@Component({
	selector: 'app-contato',
	templateUrl: './contato.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [MatIconModule, NgxMaskDirective],
})
export class ContatoComponent {
	/** Dados de contato e link de WhatsApp — config central (`site.config.ts`). */
	protected readonly business = BUSINESS;
	/** CTA de WhatsApp contextual da seção Contato — mensagem própria (S17). */
	protected readonly whatsappUrl = WHATSAPP_URL_CONTATO;

	/** Linha de horário derivada dos períodos: "09:00 às 12:00 | 13:00 às 17:00". */
	protected readonly scheduleLine = BUSINESS.openingHours.periods.map((p) => `${p.opens} às ${p.closes}`).join(' | ');
}
