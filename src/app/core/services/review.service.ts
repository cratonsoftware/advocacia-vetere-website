import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { from, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GoogleReview } from '../models/review.model';

@Injectable({
	providedIn: 'root',
})
export class ReviewsService {
	private supabase: SupabaseClient;

	constructor() {
		this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
	}

	getReviews(): Observable<GoogleReview[]> {
		const query = this.supabase
			.from('google_reviews')
			.select('*')
			.limit(5)
			.then(({ data, error }) => {
				if (error) throw error;
				return data as GoogleReview[];
			});

		return from(query);
	}
}
