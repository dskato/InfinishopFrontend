import { Component, OnInit } from '@angular/core';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';

export interface HomeList {
  branchMechanicsId: any;
  appUserId: any;
  appUser: any;
  name: string;
  contactPhone: string;
  webPage: string;
  description: string;
  typeOfVehicle: string;
  mechanicServices: any;
  adresses: any;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  public homeList: HomeList[] = [];
  public link: string = '';
  jwtHelper = new JwtHelperService();

  currentUser: User = {
    id: 0,
    name: 'string',
    email: 'string',
  };

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.getAllBranches();
    var decodedToken = this.jwtHelper.decodeToken(Cookie.get('jwtToken'));
    this.http
      .get<any>(
        'https://localhost:7010/api/UsersControllers/getUserByEmail/' +
          decodedToken.nameid
      )
      .subscribe((data) => {
        console.log(JSON.stringify(data));
        this.currentUser.email = data.email;
        this.currentUser.id = data.id;
        this.currentUser.name = data.name;
      });
  }

  getLikesById(event: any) : number{
    var currentBranchId = event.branchMechanicsId;
    var numOfLikes = 1;
    this.http
      .post<any>('https://localhost:7010/api/Home/GetAllBranchLikesById/'+currentBranchId, {
        branchId: Number(currentBranchId),
      })
      .subscribe((response: any) => {
        console.log('res: ' + response);
      });
      return numOfLikes;
  }

  doLike(event: any) {
    var currentBranchId = event.branchMechanicsId;
    console.log('currentID: ' + currentBranchId);
    console.log('appUserId: '+Number(this.currentUser.id))
    this.http
      .post<any>('https://localhost:7010/api/home/likebranch', {
        branchId: Number(currentBranchId),
        appUserId: Number(this.currentUser.id)
      })
      .subscribe((response: any) => {
        console.log('res: ' + response);
      });
  }

  logout(): void {
    Cookie.delete('jwtToken');
    this.router.navigate(['/login']);
  }

  getCurrentLinkClicked(event: any) {
    this.link = event.webPage;
    console.log('link clicked: ' + this.link);
  }

  getAllBranches() {
    this.homeList = [];
    this.http
      .get<any>('https://localhost:7010/api/Home/GetAllBranchs')
      .subscribe((data) => {
        for (const d of data as any) {
          this.homeList.push({
            branchMechanicsId: d.branchMechanicsId,
            appUserId: d.appUserId,
            appUser: d.appUser,
            name: d.name,
            contactPhone: d.contactPhone,
            webPage: d.webPage,
            description: d.description,
            typeOfVehicle: d.typeOfVehicle,
            mechanicServices: d.mechanicServices,
            adresses: d.adresses,
          });
        }
        console.log('home ls: ' + JSON.stringify(this.homeList));
      });
  }
}
