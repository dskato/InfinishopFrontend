import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-register-options',
  templateUrl: './register-options.component.html',
  styleUrls: ['./register-options.component.scss']
})
export class RegisterOptionsComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  navigateUserRegister(): void{
    this.router.navigate(['/register']);
  }
  navigateMechanicRegister(): void{
    this.router.navigate(['/registermch']);
  }
}
