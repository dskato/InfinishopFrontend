import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavHeaderSimpleComponent } from './nav-header-simple.component';

describe('NavHeaderSimpleComponent', () => {
  let component: NavHeaderSimpleComponent;
  let fixture: ComponentFixture<NavHeaderSimpleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NavHeaderSimpleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavHeaderSimpleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
