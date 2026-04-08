import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './features/footer/footer.component';
import { HeaderComponent } from './features/header/header.component';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	imports: [HeaderComponent, FooterComponent, RouterOutlet],
})
export class AppComponent {
	title = 'advocacia-vetere-website';
}
