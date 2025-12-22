import { DEFAULT_CURRENCY_CODE, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
	providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), { provide: LOCALE_ID, useValue: 'pt-BR' }, { provide: DEFAULT_CURRENCY_CODE, useValue: 'BRL' }],
}).catch((err) => console.error(err));
