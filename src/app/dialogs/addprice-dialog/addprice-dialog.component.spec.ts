import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddpriceDialogComponent } from './addprice-dialog.component';

describe('AddpriceDialogComponent', () => {
  let component: AddpriceDialogComponent;
  let fixture: ComponentFixture<AddpriceDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddpriceDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddpriceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
