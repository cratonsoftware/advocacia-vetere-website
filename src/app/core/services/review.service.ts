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
		return this.http.get<GoogleReview[]>(`${this.apiUrl}/google_reviews?select=*&limit=5`, { headers: this.headers }).pipe(
			catchError((err) => {
				console.error('Erro ao buscar reviews:', err);
				return of([]);
			}),
		);
	}
}
