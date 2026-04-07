import { Component, signal } from '@angular/core';

@Component({
	selector: 'app-header',
	templateUrl: './header.component.html',
})
export class HeaderComponent {
	isMenuOpen = signal<boolean>(false);

	toggleMenu = () => this.isMenuOpen.update((value) => !value);
}
