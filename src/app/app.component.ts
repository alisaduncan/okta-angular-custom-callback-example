import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { Event, NavigationEnd, Router, RouterEvent, RouterLink, RouterOutlet } from '@angular/router';
import { OktaAuthStateService, OKTA_AUTH } from '@okta/okta-angular';
import { AuthState } from '@okta/okta-auth-js';
import { defer, filter, iif, map, switchMap } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AsyncPipe, RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private oktaStateService = inject(OktaAuthStateService);
  private oktaAuth = inject(OKTA_AUTH);
  private router = inject(Router);

  public isAuthenticated$ = this.oktaStateService.authState$.pipe(
    filter((s: AuthState) => !!s),
    map((s: AuthState) => s.isAuthenticated ?? false)
  );

  constructor() {
    this.router.events.pipe(
      filter((e: Event | RouterEvent): e is RouterEvent => e instanceof RouterEvent && e instanceof NavigationEnd),
      filter(() => this.oktaAuth.isLoginRedirect()),
      switchMap(() => defer(() => this.oktaAuth.isAuthenticated())), // can combine with isAuthenticated$ stream too
      switchMap((isAuthenticated) => iif(
        () => !isAuthenticated,
        defer(() => this.oktaAuth.handleLoginRedirect()),
        defer(() => this.router.navigate(['/']))
      )),
      takeUntilDestroyed()
    ).subscribe(_ => {
      console.log('Login redirect handled');
    });
  }



  public async signIn() : Promise<void> {
    await this.oktaAuth.signInWithRedirect();
  }

  public async signOut(): Promise<void> {
    await this.oktaAuth.signOut();
  }
}

