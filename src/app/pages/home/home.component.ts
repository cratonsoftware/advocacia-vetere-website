import { Component, inject, OnInit } from '@angular/core';
import { SeoService } from 'src/app/core/services/seo.service';
import { MapaComponent } from 'src/app/features/mapa/mapa.component';
import { ReviewsComponent } from 'src/app/features/reviews/reviews.component';
import { AreasComponent } from '../../features/areas/areas.component';
import { BlogPreviewComponent } from '../../features/blog-preview/blog-preview.component';
import { ContatoComponent } from '../../features/contato/contato.component';
import { HeroComponent } from '../../features/hero/hero.component';
import { SobreComponent } from '../../features/sobre/sobre.component';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	imports: [HeroComponent, SobreComponent, AreasComponent, BlogPreviewComponent, ContatoComponent, ReviewsComponent, MapaComponent],
})
export class HomeComponent implements OnInit {
	private seoService = inject(SeoService);

	ngOnInit(): void {
		this.seoService.updateMetaTags({
			title: 'Dra. Maria Fernanda Vetere | Advocacia e Consultoria Jurídica',
			description: 'Advocacia estratégica e humanizada. Consultoria especializada em garantir seus direitos com excelência e transparência.',
			image: '/assets/cards/card-home.png',
			type: 'website',
		});
	}
}
