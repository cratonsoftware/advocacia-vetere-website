import { Component } from '@angular/core';
import { ReviewsComponent } from 'src/app/features/reviews/reviews.component';
import { AreasComponent } from '../../features/areas/areas.component';
import { BlogPreviewComponent } from '../../features/blog-preview/blog-preview.component';
import { ContatoComponent } from '../../features/contato/contato.component';
import { HeroComponent } from '../../features/hero/hero.component';
import { SobreComponent } from '../../features/sobre/sobre.component';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	imports: [HeroComponent, SobreComponent, AreasComponent, BlogPreviewComponent, ContatoComponent, ReviewsComponent],
})
export class HomeComponent {}
