import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-nav-header-simple',
  templateUrl: './nav-header-simple.component.html',
  styleUrls: ['./nav-header-simple.component.css']
})
export class NavHeaderSimpleComponent implements OnInit {

  imageSrc = 'assets/images/WikiMovilNoB.png';
  imageAlt = 'Logo';
  
  constructor() { }

  ngOnInit(): void {
  }

}
