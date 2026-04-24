import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig, DEFAULT_CURRENCY_CODE, importProvidersFrom, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideMarkdown } from 'ngx-markdown';
import { provideEnvironmentNgxMask } from 'ngx-mask';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
	providers: [
		provideZoneChangeDetection({ eventCoalescing: true }),
		provideRouter(
			routes,
			withInMemoryScrolling({
				scrollPositionRestoration: 'enabled',
				anchorScrolling: 'enabled',
			}),
		),
		provideClientHydration(withEventReplay()),
		{ provide: LOCALE_ID, useValue: 'pt-BR' },
		{ provide: DEFAULT_CURRENCY_CODE, useValue: 'BRL' },
		importProvidersFrom(MatIconModule),
		provideHttpClient(withFetch()),
		provideMarkdown(),
		provideEnvironmentNgxMask(),
	],
};
