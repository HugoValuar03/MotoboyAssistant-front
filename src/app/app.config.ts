import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatDateFormats, provideNativeDateAdapter } from '@angular/material/core';

import { routes } from './app.routes';

export const BR_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    },
    monthYearLabel: {
      month: 'short',
      year: 'numeric',
    },
    dateA11yLabel: {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    },
    monthYearA11yLabel: {
      month: 'long',
      year: 'numeric',
    },
  },
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),

    provideNativeDateAdapter(),

    {
      provide: MAT_DATE_LOCALE,
      useValue: 'pt-BR',
    },
    {
      provide: LOCALE_ID,
      useValue: 'pt-BR',
    },
    {
      provide: MAT_DATE_FORMATS,
      useValue: BR_DATE_FORMATS,
    },
  ],
};