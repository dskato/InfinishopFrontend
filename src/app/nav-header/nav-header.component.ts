import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Cookie } from 'ng2-cookies/ng2-cookies';

export interface GlobalMechanicalServices {
  gmsId: number;
  gmsName: string;
}

export interface Provinces {
  provinceName: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface FilterCriteria {
  provincia: any;
  servicios: any;
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
  comment: any;
  mechservices: any;
  adress: any;
  province: any;
  city: any;
}

@Component({
  selector: 'app-nav-header',
  templateUrl: './nav-header.component.html',
  styleUrls: ['./nav-header.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class NavHeaderComponent implements OnInit {
  public filterCriteria!: FilterCriteria;
  @Input() public homeList: HomeList[] = [];
  @Output() public filteredHomeList = new EventEmitter<any[]>();
  @Output() public refreshHomeList = new EventEmitter<void>();

  imageSrc = 'assets/images/WikiMovilNoB.png';
  imageAlt = 'Logo';

  public isCollapsed: boolean = false;
  public vehicles: { name: string }[] = [{ name: 'Autos' }, { name: 'Motos' }];
  public typeOfService: { name: string }[] = [
    { name: 'Mecanicas' },
    { name: 'Repuestos' },
  ];
  currentUser: User = {
    id: 0,
    name: 'string',
    email: 'string',
  };

  public provinceList: Provinces[] = [];
  public gmsList: GlobalMechanicalServices[] = [];

  public typeOfVehicle: string = 'TIPO DE AUTO';
  public provinceName: string = 'PROVINCIA';
  public serviceName: string = 'SERVICIOS';

  @ViewChild('inputDesde')
  inputDesde!: ElementRef<HTMLInputElement>;
  @ViewChild('inputHasta')
  inputHasta!: ElementRef<HTMLInputElement>;

  jwtHelper = new JwtHelperService();

  public initButtonName = 'Iniciar Sesion';

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.getAllProvinces();
    var decodedToken = this.jwtHelper.decodeToken(Cookie.get('jwtToken'));

    if (decodedToken.nameid == null) {
      this.initButtonName = 'Iniciar Sesion';
    } else {
      this.initButtonName = 'Perfil';
    }

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

  navigateToLogIn(): void {
    if (this.initButtonName == 'Perfil') {
      this.router.navigate(['/profile']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  getAllProvinces() {
    this.provinceList = [];
    this.http
      .get<any>('https://localhost:7010/api/Location/allprovinces')
      .subscribe((data) => {
        for (const d of data as any) {
          this.provinceList.push({
            provinceName: d.provinceName,
          });
        }
      });
  }

  getGlobalServicesByOption(event: any) {
    let selection = event.name;
    this.typeOfVehicle = selection;

    console.log('Selected type of vehicle: ' + selection);
    if (selection == 'Autos') {
      this.gmsList = [];
      this.http
        .get<any>(
          'https://localhost:7010/api/GlobalAutomotiveServices/GetAllGlobalAutomotiveServices'
        )
        .subscribe((data) => {
          for (const d of data as any) {
            this.gmsList.push({
              gmsId: d.globalAutomotiveServicesId,
              gmsName: d.globalAutomotiveServicesName,
            });
          }
        });
    } else {
      this.gmsList = [];
      this.http
        .get<any>(
          'https://localhost:7010/api/GlobalAutomotiveServices/GetAllGlobalMotorcycleServices'
        )
        .subscribe((data) => {
          for (const d of data as any) {
            this.gmsList.push({
              gmsId: d.globalMotorcycleServicesId,
              gmsName: d.globalMotorcycleServicesName,
            });
          }
        });
    }
  }

  public getTypeOfVehicle(event: any) {
    console.log(event.name);
    this.typeOfVehicle = event.name;
    return event.name;
  }

  public getSelectedProvince(event: any) {
    console.log(event.provinceName);
    this.provinceName = event.provinceName;
    return event.provinceName;
  }

  public getSelectedService(event: any) {
    console.log(event.gmsName);
    this.serviceName = event.gmsName;
    return event.gmsName;
  }

  public retoFiltro() {
    this.filterCriteria = {
      provincia: this.provinceName,
      servicios: this.serviceName,
    };
    console.log('filter crit: ' + JSON.stringify(this.filterCriteria));
    const newHomeLs = (this.homeList = []);
    this.filteredHomeList.emit(newHomeLs);

    this.http
      .get<any>('https://localhost:7010/api/Home/GetAllBranchsFiltered/'+this.filterCriteria.servicios )
      .subscribe(async (data) => {
        for (const d of data as any) {
          var addrInfo = await this.getAdressById(d.branchMechanicsId);
          var cityInfo = await this.getCityById(addrInfo.cityId);

          console.log('waaa: ' + addrInfo.cityId);
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
            city: await this.getCityById(addrInfo.cityId),
          });
        }
        console.log('home ls: ' + JSON.stringify(this.homeList));
      });

    const newHomeLss = newHomeLs;
    this.filteredHomeList.emit(newHomeLss);
  }

  public getSearchCriteria() {
    this.filterCriteria = {
      provincia: this.provinceName,
      servicios: this.serviceName,
    };

    console.log('filter crit: ' + JSON.stringify(this.filterCriteria));

    //------

    //------
    if (
      this.filterCriteria.provincia != 'PROVINCIA' &&
      this.filterCriteria.servicios == 'SERVICIOS'
    ) {
      const newHomeLs = this.homeList.filter(
        (item) => item.province.provinceName == this.filterCriteria.provincia
      );
      this.filteredHomeList.emit(newHomeLs);
      //console.log('filtered homelist: ' + JSON.stringify(newHomeLs));
    }
    //------
    if (
      this.filterCriteria.provincia == 'PROVINCIA' &&
      this.filterCriteria.servicios != 'SERVICIOS'
    ) {
      const newHomeLs = this.homeList.filter((item) =>
        item.mechservices.some(
          (service: { mechanicServicesName: any }) =>
            service.mechanicServicesName == this.filterCriteria.servicios
        )
      );
      this.filteredHomeList.emit(newHomeLs);
      //console.log('filtered homelist: ' + JSON.stringify(newHomeLs));
    }
    //------
    if (
      this.filterCriteria.provincia != 'PROVINCIA' &&
      this.filterCriteria.servicios != 'SERVICIOS'
    ) {
      const newHomeLs = this.homeList.filter(
        (item) =>
          item.mechservices.some(
            (service: { mechanicServicesName: any }) =>
              service.mechanicServicesName == this.filterCriteria.servicios
          ) && item.province.provinceName == this.filterCriteria.provincia
      );
      this.filteredHomeList.emit(newHomeLs);
      //console.log('filtered homelist: ' + JSON.stringify(newHomeLs));
    }
  }

  refreshHomeLs() {
    this.refreshHomeList.emit();
  }



  //------------------------------------------------------------------
  //
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

  async getCommentById(id: number) {
    var listOfComments = await this.http
      .get<number>('https://localhost:7010/api/Home/GetAllBranchCommentsById/' + id)
      .toPromise();
    return listOfComments;
  }
  async getLikesById(id: number) {
    const numOfLikes = await this.http
      .get<number>('https://localhost:7010/api/Home/GetBranchLikesByID/' + id)
      .toPromise();
    return numOfLikes;
  }
  async getMechServicesById(id: number) {
    var listOfServices = await this.http
      .get<any>('https://localhost:7010/api/Home/GetAllMechanicalServicesById/' + id)
      .toPromise();
    return listOfServices;
  }
  //------------------------------------------------------------------
  //------------------------------------------------------------------
}
