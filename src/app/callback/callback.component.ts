import { Component, Inject, Injector, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { OktaAuthConfigService, OKTA_AUTH } from '@okta/okta-angular';
import OktaAuth from '@okta/okta-auth-js';

@Component({
  selector: 'app-callback',
  standalone: true,
  imports: [],
  template: `
    <div>{{error}}</div>
  `,
})
export class CallbackComponent {

  error?: string;

  constructor(
    private configService: OktaAuthConfigService,
    private router: Router,
    @Inject(OKTA_AUTH) private oktaAuth: OktaAuth,
    @Optional() private injector?: Injector,
  ) {}

  async ngOnInit(): Promise<void> {
    const config = this.configService.getConfig();
    if (!config) {
      throw new Error('Okta config is not provided');
    }
    try {
      // Parse code or tokens from the URL, store tokens in the TokenManager, and redirect back to the originalUri
      await this.oktaAuth.handleLoginRedirect();
    } catch (e) {
      // Callback from social IDP. Show custom login page to continue.
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore Supports auth-js v5 & v6-7
      const isInteractionRequiredError = this.oktaAuth.isInteractionRequiredError || this.oktaAuth.idx.isInteractionRequiredError;
      if (isInteractionRequiredError(e) && this.injector) {
        const { onAuthResume, onAuthRequired } = config;
        const callbackFn = onAuthResume || onAuthRequired;
        if (callbackFn) {
          callbackFn(this.oktaAuth, this.injector);
          return;
        }
      }

      if (await this.oktaAuth.isAuthenticated()) {
        this.router.navigate(['/']);
      }
    }
  }
}
