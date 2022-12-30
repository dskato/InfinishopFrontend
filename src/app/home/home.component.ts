import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable, Subject } from 'rxjs';

//------------------------------------------------------------------
//INTERFACES
//------------------------------------------------------------------

export interface Comment {
  commentId: number;
  branchId: number;
  appUserId: number;
  commentary: string;
}

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
  numOfLikes: any;
  comment : any;
  mechservices: any;
  adress: any;
  province: any;
  city: any;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface FilterCriteria{
  provincia: any;
  servicios: any;
}

//------------------------------------------------------------------
//------------------------------------------------------------------

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  //HTML Elements
  @ViewChild('commentInput')
  commentInput!: ElementRef;

  @ViewChild('navheader') navHeaderComp: any;

  @Input() public homeList: HomeList[] = [];
  public link: string = '';
  jwtHelper = new JwtHelperService();

  currentUser: User = {
    id: 0,
    name: 'string',
    email: 'string',
  };

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    //this.getAllBranches();
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

  //------------------------------------------------------------------
  //LIKES
  //------------------------------------------------------------------
  async getLikesById(id: number) {
    const numOfLikes = await this.http
      .get<number>('https://localhost:7010/api/Home/GetBranchLikesByID/' + id)
      .toPromise();
    return numOfLikes;
  }

  doLike(event: any) {
    var currentBranchId = event.branchMechanicsId;
    console.log('currentID: ' + currentBranchId);
    console.log('appUserId: ' + Number(this.currentUser.id));
    this.http
      .post<any>('https://localhost:7010/api/home/likebranch', {
        branchId: Number(currentBranchId),
        appUserId: Number(this.currentUser.id),
      })
      .subscribe((response: any) => {
        console.log('res: ' + response);
      });
    this.getAllBranches();
  }
  //------------------------------------------------------------------
  //------------------------------------------------------------------

  //------------------------------------------------------------------
  //COMMENTS
  //------------------------------------------------------------------

  doComment(event: any) {
    const inputText = this.commentInput.nativeElement.value;
    console.log('comment: ' + inputText);

    this.http
      .post<any>('https://localhost:7010/api/home/commentbranch', {
        branchId: Number(event.branchMechanicsId),
        appUserId: Number(this.currentUser.id),
        comment: inputText,
      })
      .subscribe((response: any) => {
        console.log('res: ' + response);
      });
    this.getAllBranches();
  }

  async getCommentById(id: number) {
    var listOfComments = await this.http
      .get<number>('https://localhost:7010/api/Home/GetAllBranchCommentsById/' + id)
      .toPromise();
    return listOfComments;
  }

  deleteCommentById(event : any){

    var commentId = event.commentId;
    var commentUserId = event.appUserId;
    console.log("currentId: "+ this.currentUser.id + "fromEvent: "+ commentUserId)
    console.log("commentID: "+ commentId)
    if(this.currentUser.id == commentUserId){
      this.http.delete<any>('https://localhost:7010/api/Home/DeleteComment/'+commentId).subscribe((response: any) => {
        console.log('delete res: ' + response);
        
      });
      this.getAllBranches();
    }


  }
  //------------------------------------------------------------------
  //------------------------------------------------------------------

  //------------------------------------------------------------------
  //MECH SERVICES
  //------------------------------------------------------------------
 
  async getMechServicesById(id: number) {
    var listOfServices = await this.http
      .get<any>('https://localhost:7010/api/Home/GetAllMechanicalServicesById/' + id)
      .toPromise();
    return listOfServices;
  }

  //------------------------------------------------------------------
  //------------------------------------------------------------------

  //------------------------------------------------------------------
  //ADRESS
  //------------------------------------------------------------------
 
  async getAdressById(id: number) {
    var currentAdress = await this.http
      .get<any>('https://localhost:7010/api/Home/GetBranchAdressById/' + id)
      .toPromise();
    return currentAdress;
  }

  async getProvinceById(id: number) {
    var currentProvince = await this.http
      .get<any>('https://localhost:7010/api/Location/GetProvinceById/' + id)
      .toPromise();
    return currentProvince;
  }

  async getCityById(id: number) {
    var currentCity = await this.http
      .get<any>('https://localhost:7010/api/Location/GetCityById/' + id)
      .toPromise();
    return currentCity;
  }

  //------------------------------------------------------------------
  //------------------------------------------------------------------
  
  logout(): void {
    Cookie.delete('jwtToken');
    this.router.navigate(['/login']);
  }

  getCurrentLinkClicked(event: any) {
    this.link = event.webPage;
    console.log('link clicked: ' + this.link);
  }

  updateHomeLs(newList: any[]){
    this.homeList = newList;
  }

  

  getAllBranches() {
    this.homeList = [];
    this.http
      .get<any>('https://localhost:7010/api/Home/GetAllBranchs')
      .subscribe(async (data) => {
        for (const d of data as any) {
          var addrInfo = await this.getAdressById(d.branchMechanicsId);
          var cityInfo = await this.getCityById(addrInfo.cityId);

          console.log("waaa: "+ addrInfo.cityId);
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
            numOfLikes: await this.getLikesById(d.branchMechanicsId),
            comment: await this.getCommentById(d.branchMechanicsId),
            mechservices: await this.getMechServicesById(d.branchMechanicsId),
            adress: await this.getAdressById(d.branchMechanicsId),
            province: await this.getProvinceById(cityInfo.provinceId),
            city: await this.getCityById(addrInfo.cityId)
          });
        }
        //console.log('home ls: ' + JSON.stringify(this.homeList));
      });
  }
}
