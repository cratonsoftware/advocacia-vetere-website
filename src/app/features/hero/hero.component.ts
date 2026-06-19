import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
	selector: 'app-hero',
	templateUrl: './hero.component.html',
	imports: [RouterLink],
})
export class HeroComponent {}
