import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Cookie } from 'ng2-cookies/ng2-cookies';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  jwtHelper = new JwtHelperService();

  constructor() {}

  public isAuthenticated(): boolean {
    const token = Cookie.get('jwtToken');
    // Check whether the token is expired and return
    // true or false
    return !this.jwtHelper.isTokenExpired(token);
  }
}
