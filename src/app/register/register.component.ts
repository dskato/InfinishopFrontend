import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

import {
  FormControl,
  FormGroup,
  Validators,
  AbstractControl,
  ValidatorFn,
  ValidationErrors,
} from '@angular/forms';
import { ToastServiceService } from '../_services/toast-service.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private notifyService: ToastServiceService,
    private router: Router
   
  ) {}

  registerForm = new FormGroup(
    {
      firstname: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
      ]),
      lastname: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
      ]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        (c: AbstractControl) => Validators.required(c),
        Validators.pattern(
          /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*#?&^_-]).{8,}/
        ),
      ]),
      passwordconfirm: new FormControl('', [
        (c: AbstractControl) => Validators.required(c),
        Validators.pattern(
          /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*#?&^_-]).{8,}/
        ),
      ]),
    },
    { validators: passwordMatchingValidatior }
  );

  ngOnInit(): void {}

  get f() {
    return this.registerForm.controls;
  }

  validateBeforeSend(): boolean {
    var canProceed = false;

    this.registerForm.valid ? (canProceed = true) : (canProceed = false);

    return canProceed;
  }

  registerUser(): void {
    if (this.validateBeforeSend()) {
      this.http
        .post<any>(
          'https://localhost:7010/api/account/register',
          {
            email: this.f.email.getRawValue(),
            password: this.f.password.getRawValue(),
            FirstName: this.f.firstname.getRawValue(),
            LastName: this.f.lastname.getRawValue(),
          },
          { observe: 'response' }
        )
        .subscribe(
          (response) => {
            console.log('status: ' + response.status);
            if (response.status == 200) {
              this.showToasterSuccess();
              this.router.navigate(['/login']);
            }
          },
          (error) => {
            console.log('status: ' + error.status);

            if (error.status == 400) {
              this.showTEmailTaken();
            }
          }
        );
    } else {
      console.log('Form not valid.');
      this.showTIncompleteForm();
    }
  }

  showTIncompleteForm() {
    this.notifyService.showError('El formulario esta incompleto.', 'Error');
  }
  showTEmailTaken() {
    this.notifyService.showError(
      'Ya existe un usuario con este correo.',
      'Error'
    );
  }
  showToasterSuccess() {
    this.notifyService.showSuccess('Usuario creado con exito.', 'Success');
  }
}

export const passwordMatchingValidatior: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('passwordconfirm');

  return password?.value === confirmPassword?.value
    ? null
    : { notmatched: true };
};
