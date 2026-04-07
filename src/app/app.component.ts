import { Component } from '@angular/core';
import { AreasComponent } from './features/areas/areas.component';
import { ContatoComponent } from './features/contato/contato.component';
import { FooterComponent } from './features/footer/footer.component';
import { HeaderComponent } from './features/header/header.component';
import { HeroComponent } from './features/hero/hero.component';
import { SobreComponent } from './features/sobre/sobre.component';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	imports: [HeaderComponent, HeroComponent, AreasComponent, SobreComponent, ContatoComponent, FooterComponent],
})
export class AppComponent {
	title = 'advocacia-vetere-website';
}
