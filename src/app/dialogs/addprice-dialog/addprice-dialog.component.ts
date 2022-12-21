import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { RegisterMechanicComponent } from 'src/app/register-mechanic/register-mechanic.component';

export interface PriceDialogData{
  price: number;
}


@Component({
  selector: 'app-addprice-dialog',
  templateUrl: './addprice-dialog.component.html',
  styleUrls: ['./addprice-dialog.component.scss']
})
export class AddpriceDialogComponent  {

  constructor(
    public dialogRef: MatDialogRef<RegisterMechanicComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PriceDialogData,
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

}
