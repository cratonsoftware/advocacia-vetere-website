import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GoogleReview } from '../models/review.model';

@Injectable({
	providedIn: 'root',
})
export class ReviewsService {
	private http = inject(HttpClient);

	private readonly apiUrl = `${environment.supabaseUrl}/rest/v1`;
	private readonly headers = new HttpHeaders({
		apikey: environment.supabaseKey,
		Authorization: `Bearer ${environment.supabaseKey}`,
	});

	getReviews(): Observable<GoogleReview[]> {
		// 5 mais recentes com 4+ estrelas: filtra rating>=4 e ordena pela data real (review_time) desc.
		// nullslast garante ordem estável mesmo se alguma linha ainda não tiver review_time.
		return this.http.get<GoogleReview[]>(`${this.apiUrl}/google_reviews?select=*&rating=gte.4&order=review_time.desc.nullslast&limit=5`, { headers: this.headers }).pipe(
			catchError((err) => {
				console.error('Erro ao buscar reviews:', err);
				return of([]);
			}),
		);
	}
}
