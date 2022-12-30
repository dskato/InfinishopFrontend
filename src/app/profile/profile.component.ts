import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ToastServiceService } from '../_services/toast-service.service';
import { City } from '../interfaces/city';
import { Country } from '../interfaces/country';
import { Province } from '../interfaces/province';
import { GlobalMechanicalServices } from '../interfaces/GlobalServices';

import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { AddpriceDialogComponent } from '../dialogs/addprice-dialog/addprice-dialog.component';

import {
  FormControl,
  FormGroup,
  Validators,
  AbstractControl,
  ValidatorFn,
  ValidationErrors,
} from '@angular/forms';
import { map } from 'rxjs/operators';

export interface User {
  id: number;
  name: string;
  email: string;
  lastname: string;
  phoneNumber: string;
}

export interface ChipsInfo {
  id: number;
  name: string;
  price: number;
}

export interface ServiceData {
  servicesName: string;
  price: number;
}

export interface MechanicServices {
  MechanicServicesId: number;
  BranchMechanicsId: number;
  MechanicServicesName: string;
  Price: string;
  TypeOfVehicle: string;
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
  mechservices: any;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  //HTML Elements
  //PROFILE
  @ViewChild('nameInput')
  nameInput!: ElementRef;
  @ViewChild('lastnameInput')
  lastnameInput!: ElementRef;
  @ViewChild('phoneInput')
  phoneInput!: ElementRef;

  //DROPDOWN LISTS
  public vehicles: { name: string }[] = [{ name: 'Autos' }, { name: 'Motos' }];
  public countryList: Country[] = [];
  public provinceList: Province[] = [];
  public citiesList: City[] = [];
  public gmsList: GlobalMechanicalServices[] = [];

  //LIST FOR CHIPS
  public chipList: ChipsInfo[] = [];
  public serviceList: ServiceData[] = [];
  //DIALOG VARIABLE
  private servicePrice: number = 0;

  //USER MECH
  public homeList: HomeList[] = [];

  jwtHelper = new JwtHelperService();
  public currentUser: User = {
    id: 0,
    name: 'string',
    email: 'string',
    lastname: 'string',
    phoneNumber: 'string',
  };

  registerForm = new FormGroup({
    typeOfVehicle_select: new FormControl(''),
    businessName: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
    ]),
    businessContact: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
    ]),
    country_select: new FormControl(''),
    province_select: new FormControl(''),
    city_select: new FormControl(''),
    address: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
    ]),
    weburl: new FormControl('', [Validators.required, Validators.minLength(3)]),
    description: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
    ]),

    services_select: new FormControl(''),
  });

  constructor(
    private router: Router,
    private http: HttpClient,
    private notifyService: ToastServiceService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    var decodedToken = this.jwtHelper.decodeToken(Cookie.get('jwtToken'));

    this.http
      .get<any>(
        'https://localhost:7010/api/UsersControllers/getUserByEmail/' +
          decodedToken.nameid
      )
      .subscribe((data) => {
        //console.log(JSON.stringify(data));
        this.currentUser.email = data.email;
        this.currentUser.id = data.id;
        this.currentUser.name = data.name;
        this.currentUser.lastname = data.lastName;
        this.currentUser.phoneNumber = data.phoneNumber;
        //Call user branches
        this.getAllBranches(data.id);
      });

    this.getCountries();
  }

  //LOCATION
  ///////////////////////////////////////////////////////////////////
  private getCountries() {
    this.http
      .get<any>('https://localhost:7010/api/Location/allcountries')
      .subscribe((data) => {
        for (const d of data as any) {
          this.countryList.push({
            countryId: d.countryId,
            countryName: d.countryName,
          });
        }
      });
  }

  getProvincesByCountryId() {
    const val = JSON.stringify(this.registerForm.getRawValue().country_select);
    const countryValue = JSON.parse(val);
    console.log('Selected country: ' + countryValue.countryName);

    this.http
      .get<any>(
        'https://localhost:7010/api/Location/GetProvincesByCountryId/' +
          countryValue.countryId
      )
      .subscribe((data) => {
        for (const d of data as any) {
          this.provinceList.push({
            provinceId: d.provinceId,
            countryId: d.countryId,
            provinceName: d.provinceName,
          });
        }
      });
  }

  getCitiesByProvinceId() {
    const val = JSON.stringify(this.registerForm.getRawValue().province_select);
    const provinceValue = JSON.parse(val);
    console.log('Selected province: ' + provinceValue.provinceId);

    this.citiesList = [];
    this.http
      .get<any>(
        'https://localhost:7010/api/Location/GetCitiesByProvinceId/' +
          provinceValue.provinceId
      )
      .subscribe((data) => {
        for (const d of data as any) {
          this.citiesList.push({
            cityId: d.cityId,
            provinceId: d.provinceId,
            cityName: d.cityName,
          });
        }
      });
  }
  ////////////////////////////////////////////////////////////////////

  //GLOBAL MECHANICAL SERVICES
  ////////////////////////////////////////////////////////////////////
  getGlobalServicesByOption() {
    const val = JSON.stringify(
      this.registerForm.getRawValue().typeOfVehicle_select
    );
    const vehicleValue = JSON.parse(val);

    console.log('Selected type of vehicle: ' + vehicleValue.name);
    if (vehicleValue.name == 'Autos') {
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
  ////////////////////////////////////////////////////////////////////

  //CHIP DIALOG
  ////////////////////////////////////////////////////////////////////
  getSelectedService() {
    const val = JSON.stringify(this.registerForm.getRawValue().services_select);
    const gsmValue = JSON.parse(val);
    console.log('Selected service: ' + gsmValue.gmsName);
    //Remove repeated items
    this.chipList = this.chipList.filter((item) => item.id != gsmValue.gmsId);

    //Open dialog
    const dialogRef = this.dialog.open(AddpriceDialogComponent, {
      width: '250px',
      data: { price: this.servicePrice },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result != undefined && result > 0) {
        this.servicePrice = result;
        this.chipList.push({
          id: gsmValue.gmsId,
          name: gsmValue.gmsName,
          price: this.servicePrice,
        });
      }
    });
  }

  removeChip(chip: ChipsInfo): void {
    this.chipList = this.chipList.filter((item) => item.id != chip.id);
  }

  ////////////////////////////////////////////////////////////////////

  //------------------------------------------------------------------
  //MECH SERVICES
  //------------------------------------------------------------------

  async getMechServicesById(id: number) {
    var listOfServices = await this.http
      .get<any>(
        'https://localhost:7010/api/Home/GetAllMechanicalServicesById/' + id
      )
      .toPromise();
    return listOfServices;
  }

  //------------------------------------------------------------------

  //USER BRANCHS
  ////////////////////////////////////////////////////////////////////

  getAllBranches(id: number) {
    this.homeList = [];
    console.log('homels id: ' + id);
    this.http
      .get<any>('https://localhost:7010/api/Home/GetAllBranchsById/' + id)
      .subscribe(async (data) => {
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
            mechservices: await this.getMechServicesById(d.branchMechanicsId),
          });
        }
        //console.log('home ls: ' + JSON.stringify(this.homeList));
      });
  }

  ////////////////////////////////////////////////////////////////////

  saveBranch() {
    const valTV = JSON.stringify(
      this.registerForm.getRawValue().typeOfVehicle_select
    );

    const valCountry = JSON.stringify(
      this.registerForm.getRawValue().country_select
    );
    const valProvince = JSON.stringify(
      this.registerForm.getRawValue().province_select
    );
    const valCity = JSON.stringify(this.registerForm.getRawValue().city_select);
    const valService = JSON.stringify(
      this.registerForm.getRawValue().services_select
    );

    const typeOfVehicle_select = JSON.parse(valTV);
    const businessName = this.registerForm.getRawValue().businessName;
    const businessContact = this.registerForm.getRawValue().businessContact;
    const country_select = JSON.parse(valCountry);
    const province_select = JSON.parse(valProvince);
    const city_select = JSON.parse(valCity);
    const address = this.registerForm.getRawValue().address;
    const weburl = this.registerForm.getRawValue().weburl;
    const description = this.registerForm.getRawValue().description;
    const services_select = JSON.parse(valService);

    for (let x = 0; x < this.chipList.length; x++) {
      this.serviceList.push({
        servicesName: this.chipList[x].name,
        price: Number(this.chipList[x].price),
      });
    }

    this.http
      .post<any>(
        'https://localhost:7010/api/account/registerbranch',
        {
          appUserId: this.currentUser.id,
          typeOfVehicle: typeOfVehicle_select.name,
          nameSucursal: businessName,
          contactPhone: businessContact,
          webPage: weburl,
          description: description,
          cityId: city_select.cityId,
          address: address,
          serviceLs: this.serviceList,
        },
        { observe: 'response' }
      )
      .subscribe(
        (response) => {
          console.log('response: ' + JSON.stringify(response));
          this.notifyService.showSuccess(
            'Sucursal agregada con exito.',
            'Sucess'
          );
          //Call user branches
          this.getAllBranches(this.currentUser.id);
        },
        (error) => {
          console.log('status: ' + error.message);
        }
      );
  }

  deleteBranch(id: number) {
    console.log('deleted branch: ' + id);
    this.http
      .delete<any>('https://localhost:7010/api/Home/DeleteBranch/' + id)
      .subscribe((response: any) => {
        console.log('deleted branch res: ' + response);
      });
    //Call user branches
    this.getAllBranches(this.currentUser.id);
  }

  updateProfile() {
    const profileName = this.nameInput.nativeElement.value;
    const profileLastName = this.lastnameInput.nativeElement.value;
    const profilePhone = this.phoneInput.nativeElement.value;

    if (
      profileName.length === 0 ||
      profileLastName.length === 0 ||
      profilePhone.length === 0
    ) {
      this.notifyService.showError(
        'Todos los campos deben estar llenos.',
        'Error'
      );
    } else {
      this.http
        .patch<any>(
          'https://localhost:7010/api/UsersControllers/updateUserProfile',
          {
            id: this.currentUser.id,
            name: profileName,
            lastname: profileLastName,
            phone: profilePhone,
          },
          { observe: 'response' }
        )
        .subscribe(
          (response) => {
            console.log(response);
            this.notifyService.showSuccess(
              'Datos actualizados con exito.',
              'Sucess'
            );
          },
          (error) => {
            console.log(error);
            this.notifyService.showError(
              'A ocurrido un error al actualizar.',
              'Error'
            );
          }
        );
    }
  }

  logOut() {
    Cookie.delete('jwtToken');
    this.router.navigate(['/home']);
  }
}
