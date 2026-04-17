import { AfterViewInit, Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { GoogleReview } from 'src/app/core/models/review.model';
import { ReviewsService } from 'src/app/core/services/review.service';

export interface InfiniteReview extends GoogleReview {
	_infiniteId: string;
}

@Component({
	selector: 'app-reviews',
	templateUrl: './reviews.component.html',
	imports: [MatIcon],
})
export class ReviewsComponent implements OnInit, AfterViewInit, OnDestroy {
	private reviewsService = inject(ReviewsService);

	@ViewChild('slider') slider!: ElementRef<HTMLDivElement>;

	infiniteReviews: InfiniteReview[] = [];
	baseReviews: GoogleReview[] = [];
	isLoading = true;

	autoplayInterval: any;
	isHovered = false;

	private staticFallbackReviews: GoogleReview[] = [
		{
			author_name: 'Juliana S.',
			rating: 5,
			text: 'Profissionalismo ímpar. A Dra. Maria Fernanda conduziu o meu processo de família com uma sensibilidade e firmeza que me deram muita segurança do início ao fim. Recomendo de olhos fechados.',
			profile_photo_url: '',
			relative_time_description: 'Avaliação verificada',
		},
		{
			author_name: 'Ricardo M.',
			rating: 5,
			text: 'Fui muito bem atendido. O escritório foi extremamente transparente sobre os prazos e as etapas da minha causa trabalhista. Senti que os meus direitos estavam realmente protegidos.',
			profile_photo_url: '',
			relative_time_description: 'Avaliação verificada',
		},
		{
			author_name: 'Empresa C.',
			rating: 5,
			text: 'Rigor técnico e ética. É difícil encontrar advogados que consigam explicar termos complexos de forma tão clara e acessível. Excelente assessoria preventiva.',
			profile_photo_url: '',
			relative_time_description: 'Avaliação verificada',
		},
		{
			author_name: 'Carlos E.',
			rating: 5,
			text: 'Fiquei impressionado com a agilidade e a clareza nas explicações. O meu processo de inventário foi resolvido sem as habituais dores de cabeça. Excelente trabalho.',
			profile_photo_url: '',
			relative_time_description: 'Avaliação verificada',
		},
		{
			author_name: 'Ana Paula.',
			rating: 5,
			text: 'Atendimento humanizado e muito direto. Senti-me acolhida num momento difícil e tive todo o respaldo jurídico de que necessitava para o meu divórcio.',
			profile_photo_url: '',
			relative_time_description: 'Avaliação verificada',
		},
	];

	ngOnInit(): void {
		this.reviewsService.getReviews().subscribe({
			next: (reviews) => {
				this.baseReviews = reviews && reviews.length > 0 ? reviews : this.staticFallbackReviews;
				this.setupInfiniteArray();
			},
			error: (err) => {
				console.error('Erro ao buscar avaliações do banco, acionando fallback.', err);
				this.baseReviews = this.staticFallbackReviews;
				this.setupInfiniteArray();
			},
		});
	}

	setupInfiniteArray() {
		const set1 = this.baseReviews.map((r) => ({ ...r, _infiniteId: 'set1_' + r.author_name }));
		const set2 = this.baseReviews.map((r) => ({ ...r, _infiniteId: 'set2_' + r.author_name }));
		const set3 = this.baseReviews.map((r) => ({ ...r, _infiniteId: 'set3_' + r.author_name }));

		this.infiniteReviews = [...set1, ...set2, ...set3];
		this.isLoading = false;
	}

	ngAfterViewInit() {
		setTimeout(() => {
			if (this.slider) {
				const container = this.slider.nativeElement;
				const setWidth = container.scrollWidth / 3;
				container.scrollLeft = setWidth;
				this.startAutoplay();
			}
		}, 100);
	}

	ngOnDestroy() {
		this.stopAutoplay();
	}

	onScroll() {
		if (!this.slider) return;
		const container = this.slider.nativeElement;
		const setWidth = container.scrollWidth / 3;

		if (container.scrollLeft <= 0) {
			container.classList.remove('scroll-smooth');
			container.scrollLeft = setWidth;
			setTimeout(() => container.classList.add('scroll-smooth'), 50);
		} else if (container.scrollLeft >= setWidth * 2) {
			container.classList.remove('scroll-smooth');
			container.scrollLeft = setWidth;
			setTimeout(() => container.classList.add('scroll-smooth'), 50);
		}
	}

	startAutoplay() {
		this.stopAutoplay();
		this.autoplayInterval = setInterval(() => {
			if (!this.isHovered) {
				this.scroll('right');
			}
		}, 4000);
	}

	stopAutoplay() {
		if (this.autoplayInterval) clearInterval(this.autoplayInterval);
	}

	pauseAutoplay() {
		this.isHovered = true;
	}

	resumeAutoplay() {
		this.isHovered = false;
	}

	scroll(direction: 'left' | 'right') {
		if (!this.slider) return;

		const container = this.slider.nativeElement;
		const cardWidth = container.children[0].clientWidth + 32;

		container.scrollBy({
			left: direction === 'left' ? -cardWidth : cardWidth,
			behavior: 'smooth',
		});
	}

	getStars(rating: number): number[] {
		return Array(rating).fill(0);
	}

	handleImageError(review: GoogleReview) {
		review.photoError = true;
	}

	getInitial(name: string): string {
		return name ? name.charAt(0).toUpperCase() : 'G';
	}
}
