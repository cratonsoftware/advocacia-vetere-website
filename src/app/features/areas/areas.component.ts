import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
	selector: 'app-areas',
	templateUrl: './areas.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [MatIcon],
})
export class AreasComponent {}
