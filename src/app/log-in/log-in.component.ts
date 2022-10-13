import { Component, OnInit } from '@angular/core';
import { SocialAuthService } from 'angularx-social-login';
import { SocialUser } from 'angularx-social-login';
import {
  FacebookLoginProvider,
  GoogleLoginProvider,
} from 'angularx-social-login';
import { HttpClient } from '@angular/common/http';
import { ToastServiceService } from '../_services/toast-service.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { Router } from '@angular/router';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.css'],
})
export class LogInComponent implements OnInit {
  user: SocialUser | null;
  hasApiAccess = false;
  canProceed = false;

  logInForm = new FormGroup({
    email: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  constructor(
    private authService: SocialAuthService,
    private http: HttpClient,
    private notifyService: ToastServiceService,
    private router: Router
  ) {
    this.user = null;
    this.authService.authState.subscribe((user: SocialUser) => {
      console.log(user);
      if (user) {
        this.http
          .post<any>('https://localhost:7010/api/account/authenticate', {
            email: user.email,
            token: user.provider == 'GOOGLE' ? user.idToken : user.authToken,
            firstName: user.firstName,
            lastName: user.lastName == null ? '.' : user.lastName,
            provider: user.provider,
          })
          .subscribe((authToken: any) => {
            console.log(authToken);
            console.log(authToken['token']);
            this.router.navigate(['/home']);
            //Save token in cookie locally
            Cookie.set('jwtToken', authToken['token']);
          });
      }
      this.user = user;
    });
  }

  get f() {
    return this.logInForm.controls;
  }

  signInWithGoogle(): void {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
  }

  signInWithFB(): void {
    this.authService.signIn(FacebookLoginProvider.PROVIDER_ID);
  }

  signOut(): void {
    this.authService.signOut();
  }

  validateBeforeLogin(): boolean {
    this.logInForm.valid ? (this.canProceed = true) : (this.canProceed = false);
    return this.canProceed;
  }

  signInWithForm(): void {
    if (this.validateBeforeLogin()) {
      this.http
        .post<any>(
          'https://localhost:7010/api/account/login',
          {
            email: this.f.email.getRawValue(),
            password: this.f.password.getRawValue(),
          },
          { observe: 'response' }
        )
        .subscribe(
          (response) => {
            console.log('status: ' + response.status);
            if (response.status == 200) {
              this.router.navigate(['/home']);
              console.log(response);
              //Save token in cookie locally
              Cookie.set('jwtToken', response.body['token']);
            }
          },
          (error) => {
            console.log('status: ' + error.status);

            if (error.status == 401) {
              this.showTUserOrPasswordInvalid();
            }
          }
        );
    } else {
      this.showTIncompleteForm();
    }
  }
  showTIncompleteForm() {
    this.notifyService.showError('Correo o contrasena incompletos.', 'Error');
  }
  showTUserOrPasswordInvalid() {
    this.notifyService.showError('Correo o contrasena invalidos.', 'Error');
  }

  ngOnInit(): void {}
}
