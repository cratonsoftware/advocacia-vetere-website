import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
	selector: 'app-header',
	templateUrl: './header.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [RouterLink, RouterLinkActive],
})
export class HeaderComponent {
	isMenuOpen = signal<boolean>(false);

	toggleMenu = () => this.isMenuOpen.update((value) => !value);
}
