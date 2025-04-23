import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerTourBookingComponent } from './customer-tour-booking.component';

describe('CustomerTourBookingComponent', () => {
  let component: CustomerTourBookingComponent;
  let fixture: ComponentFixture<CustomerTourBookingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomerTourBookingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerTourBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
