import { Component, OnInit } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

export interface GlobalMechanicalServices {
  gmsId: number;
  gmsName: string;
}



export interface Provinces {
  provinceName: string;
}

@Component({
  selector: 'app-nav-header',
  templateUrl: './nav-header.component.html',
  styleUrls: ['./nav-header.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class NavHeaderComponent implements OnInit {
  imageSrc = 'assets/images/WikiMovilNoB.png';
  imageAlt = 'Logo';

  public isCollapsed: boolean = false;
  public vehicles: { name: string }[] = [{ name: 'Autos' }, { name: 'Motos' }];
  public typeOfService: { name: string }[] = [
    { name: 'Mecanicas' },
    { name: 'Repuestos' },
  ];
  public provinceList: Provinces[] = [];
  public gmsList: GlobalMechanicalServices[] = [];

  public typeOfVehicle: string = 'TIPO DE AUTO';
  public provinceName: string = 'PROVINCIA';
  public serviceName: string = 'SERVICIOS';

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.getAllProvinces();
  }

  navigateToLogIn(): void {
    this.router.navigate(['/login']);
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
  }

  public getSelectedProvince(event: any) {
    console.log(event.provinceName);
    this.provinceName = event.provinceName;
  }

  public getSelectedService(event: any) {
    console.log(event.gmsName);
    this.serviceName = event.gmsName;
  }
}
