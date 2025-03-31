import { APP_INITIALIZER, ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import { InitializationService } from './auth/initialization.service';

// Factory function to initialize the app with the API token
function initializeAppFactory(initService: InitializationService) {
  return () => initService.initializeApp();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAppFactory,
      deps: [InitializationService],
      multi: true
    }
  ]
};
