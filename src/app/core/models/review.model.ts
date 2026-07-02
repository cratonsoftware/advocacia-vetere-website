export interface GoogleReview {
	author_name: string;
	rating: number;
	text: string;
	profile_photo_url: string;
	relative_time_description: string;
	/** Data real da avaliação (ISO), usada para ordenar por recência. Opcional (fallback estático não tem). */
	review_time?: string;
	photoError?: boolean;
	/** Estado de expandir/colapsar do texto (line-clamp-6) — "Ver mais" (S17). */
	expanded?: boolean;
}
