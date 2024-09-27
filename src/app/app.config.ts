import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { HttpBackend, HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { OktaAuthConfigService, OktaAuthModule } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';
import { authInterceptor } from './auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(
      OktaAuthModule.forRoot({oktaAuth: new OktaAuth({
        issuer: '{yourOktaDomain}',
        clientId: '{yourClientID}',
        redirectUri: `${window.location.origin}`,
        scopes: ['openid', 'profile', 'offline_access'],
      })})
    ),
    provideRouter(routes),
    provideHttpClient(withInterceptors([
      authInterceptor
    ]))
  ]
};
