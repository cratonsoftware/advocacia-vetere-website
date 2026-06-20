import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
	selector: 'app-hero',
	templateUrl: './hero.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [RouterLink, NgOptimizedImage],
})
export class HeroComponent {}
