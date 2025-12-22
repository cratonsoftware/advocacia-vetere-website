import { Component } from '@angular/core';
import { ContatoComponent } from './features/contato/contato.component';
import { FooterComponent } from './features/footer/footer.component';
import { HeaderComponent } from './features/header/header.component';
import { HeroComponent } from './features/hero/hero.component';
import { ServicosComponent } from './features/servicos/servicos.component';
import { SobreComponent } from './features/sobre/sobre.component';
import { SolucoesComponent } from './features/solucoes/solucoes.component';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	imports: [HeaderComponent, HeroComponent, SolucoesComponent, ServicosComponent, SobreComponent, ContatoComponent, FooterComponent],
})
export class AppComponent {
	title = 'advocacia-vetere-website';
}
