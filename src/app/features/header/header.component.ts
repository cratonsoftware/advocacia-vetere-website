import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
	selector: 'app-header',
	templateUrl: './header.component.html',
	imports: [RouterLink],
})
export class HeaderComponent {
	isMenuOpen = signal<boolean>(false);

	toggleMenu = () => this.isMenuOpen.update((value) => !value);
}
