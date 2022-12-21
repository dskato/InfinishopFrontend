import { Component, Inject, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  FormControl,
  FormGroup,
  Validators,
  AbstractControl,
  ValidatorFn,
  ValidationErrors,
} from '@angular/forms';
import { ToastServiceService } from '../_services/toast-service.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
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
import { Router } from '@angular/router';

//INTERFACES
export interface ChipsInfo {
  id: number;
  name: string;
  price: number;
}

export interface PriceDialogData {
  price: number;
}

export interface ServiceData {
  servicesName: string;
  price: number;
}

//CLASS
@Component({
  selector: 'app-register-mechanic',
  templateUrl: './register-mechanic.component.html',
  styleUrls: ['./register-mechanic.component.scss'],
})
export class RegisterMechanicComponent implements OnInit {
  //CONSTRUCTOR
  constructor(
    private http: HttpClient,
    private notifyService: ToastServiceService,
    public dialog: MatDialog,
    private router: Router
  ) {}

  //LISTS FOR DROPDOWN
  public vehicles: { name: string }[] = [{ name: 'Autos' }, { name: 'Motos' }];
  public vehicleType : string = "";
  public countryList: Country[] = [];
  public provinceList: Province[] = [];
  public citiesList: City[] = [];
  public cityID: number = -1;
  public gmsList: GlobalMechanicalServices[] = [];

  //LIST FOR CHIPS
  public chipList: ChipsInfo[] = [];
  public serviceList: ServiceData[] = [];

  //DIALOG VARIABLE
  private servicePrice: number = 0;

  //DTO

  //FORM INIT
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
      weburl: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
      ]),
      description: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
      ]),
      services_select: new FormControl(''),
    },
    { validators: passwordMatchingValidatior }
  );

  //GET PETITIONS
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

  getProvincesByCountryId(event: any) {
    console.log('Selected country: ' + event.countryId);
    this.http
      .get<any>(
        'https://localhost:7010/api/Location/GetProvincesByCountryId/' +
          event.countryId
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

  getCitiesByProvinceId(event: any) {
    console.log('Selected province: ' + event.provinceId);
    this.citiesList = [];
    this.http
      .get<any>(
        'https://localhost:7010/api/Location/GetCitiesByProvinceId/' +
          event.provinceId
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

  getGlobalServicesByOption(event: any) {
    let selection = event.name;
    this.vehicleType = event.name;

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

  getCityId(event: any) {
    this.cityID = event.cityId;
    console.log('Selected city id: ' + this.cityID);
  }

 

  getSelectedService(event: any) {
    console.log('Selected service: ' + event.gmsName);
    //Remove repeated items
    this.chipList = this.chipList.filter((item) => item.id != event.gmsId);

    //Open dialog
    const dialogRef = this.dialog.open(AddpriceDialogComponent, {
      width: '250px',
      data: { price: this.servicePrice },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result != undefined && result > 0) {
        this.servicePrice = result;
        this.chipList.push({
          id: event.gmsId,
          name: event.gmsName,
          price: this.servicePrice,
        });
      }
    });
  }

  validateBeforeSend(): boolean {
    var canProceed = false;

    this.registerForm.valid ? (canProceed = true) : (canProceed = false);

    return canProceed;
  }

  registerUser(): void {

    for (let x = 0; x < this.chipList.length; x++) {
      this.serviceList.push({
        servicesName: this.chipList[x].name,
        price: Number(this.chipList[x].price),
      });
    }

    
    if (this.validateBeforeSend()) {
      this.http
        .post<any>(
          'https://localhost:7010/api/account/registermechanic',
          {
            email: this.f.email.getRawValue(),
            password: this.f.password.getRawValue(),
            firstName: this.f.firstname.getRawValue(),
            lastName: this.f.lastname.getRawValue(),
            typeOfVehicle: this.vehicleType,
            nameSucursal: this.f.businessName.getRawValue(),
            contactPhone: this.f.businessContact.getRawValue(),
            webPage: this.f.weburl.getRawValue(),
            description: this.f.description.getRawValue(),
            cityId: Number(this.cityID),
            address: this.f.address.getRawValue(),
            serviceLs: this.serviceList,
          },
          { observe: 'response' }
        )
        .subscribe(
          (response) => {
            console.log('status: ' + response.status);
            if (response.status == 200) {
              this.showToasterSuccess();
              this.navigateToLogin();
            }
          },
          (error) => {
            console.log('status: ' + error.message);

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

  ngOnInit(): void {
    this.getCountries();
  }

  get f() {
    return this.registerForm.controls;
  }

  removeChip(chip: ChipsInfo): void {
    this.chipList = this.chipList.filter((item) => item.id != chip.id);
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

  drop(event: CdkDragDrop<ChipsInfo[]>) {
    moveItemInArray(this.chipList, event.previousIndex, event.currentIndex);
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
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
