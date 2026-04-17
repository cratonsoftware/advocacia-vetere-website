export interface GoogleReview {
	author_name: string;
	rating: number;
	text: string;
	profile_photo_url: string;
	relative_time_description: string;
	photoError?: boolean;
}
