export interface BlogPost {
	id: string;
	slug: string;
	title: string;
	excerpt: string;
	content: string;
	category: 'Cível' | 'Trabalhista' | 'Empresarial';
	date: string;
	coverImage: string;
	readTime: string;
}
