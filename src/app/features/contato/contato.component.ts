import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
	selector: 'app-contato',
	templateUrl: './contato.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [MatIconModule, NgxMaskDirective],
})
export class ContatoComponent {}
