import { IMAGE_LOADER, ImageLoaderConfig } from '@angular/common';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig, DEFAULT_CURRENCY_CODE, importProvidersFrom, LOCALE_ID, provideZonelessChangeDetection } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { provideClientHydration, withEventReplay, withHttpTransferCacheOptions } from '@angular/platform-browser';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideMarkdown } from 'ngx-markdown';
import { provideEnvironmentNgxMask } from 'ngx-mask';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
	providers: [
		provideZonelessChangeDetection(),
		// Identity loader: NgOptimizedImage usa src diretamente (imagens locais e Supabase Storage) — S6
		{ provide: IMAGE_LOADER, useValue: (config: ImageLoaderConfig) => config.src },
		provideRouter(
			routes,
			withInMemoryScrolling({
				scrollPositionRestoration: 'enabled',
				anchorScrolling: 'enabled',
			}),
		),
		provideClientHydration(withEventReplay(), withHttpTransferCacheOptions({ includeRequestsWithAuthHeaders: true })),
		{ provide: LOCALE_ID, useValue: 'pt-BR' },
		{ provide: DEFAULT_CURRENCY_CODE, useValue: 'BRL' },
		importProvidersFrom(MatIconModule),
		provideHttpClient(withFetch()),
		provideMarkdown(),
		provideEnvironmentNgxMask(),
	],
};
