import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
	selector: 'app-sobre',
	templateUrl: './sobre.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [NgOptimizedImage],
})
export class SobreComponent {}
