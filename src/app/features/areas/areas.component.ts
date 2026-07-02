import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { WHATSAPP_URL_FAMILIA } from '../../core/config/site.config';

@Component({
	selector: 'app-areas',
	templateUrl: './areas.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [MatIcon],
})
export class AreasComponent {
	/** CTA de WhatsApp contextual do card de Família — config central (S17). */
	protected readonly whatsappFamiliaUrl = WHATSAPP_URL_FAMILIA;
}
