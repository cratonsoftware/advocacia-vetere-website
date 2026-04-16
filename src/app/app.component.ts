import { Component, inject } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './features/footer/footer.component';
import { HeaderComponent } from './features/header/header.component';
import { ICON_NAMES } from './generated/icon-list';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	imports: [HeaderComponent, FooterComponent, RouterOutlet],
})
export class AppComponent {
	private iconRegistry = inject(MatIconRegistry);
	private sanitizer = inject(DomSanitizer);

	constructor() {
		this.registrarIcones();
	}

	registrarIcones() {
		for (const name of ICON_NAMES) {
			const url = this.sanitizer.bypassSecurityTrustResourceUrl(`assets/icons/${name}.svg`);
			this.iconRegistry.addSvgIcon(name, url);
		}
	}
}
