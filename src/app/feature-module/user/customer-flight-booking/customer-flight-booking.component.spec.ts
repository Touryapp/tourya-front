import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerFlightBookingComponent } from './customer-flight-booking.component';

describe('CustomerFlightBookingComponent', () => {
  let component: CustomerFlightBookingComponent;
  let fixture: ComponentFixture<CustomerFlightBookingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomerFlightBookingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerFlightBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
