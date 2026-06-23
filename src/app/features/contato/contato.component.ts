import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NgxMaskDirective } from 'ngx-mask';
import { BUSINESS, WHATSAPP_URL } from '../../core/config/site.config';

@Component({
	selector: 'app-contato',
	templateUrl: './contato.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [MatIconModule, NgxMaskDirective],
})
export class ContatoComponent {
	/** Dados de contato e link de WhatsApp — config central (`site.config.ts`). */
	protected readonly business = BUSINESS;
	protected readonly whatsappUrl = WHATSAPP_URL;

	/** Linha de horário derivada dos períodos: "09:00 às 12:00 | 13:00 às 17:00". */
	protected readonly scheduleLine = BUSINESS.openingHours.periods.map((p) => `${p.opens} às ${p.closes}`).join(' | ');
}
