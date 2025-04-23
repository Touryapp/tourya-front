import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerHotelBookingComponent } from './customer-hotel-booking.component';

describe('CustomerHotelBookingComponent', () => {
  let component: CustomerHotelBookingComponent;
  let fixture: ComponentFixture<CustomerHotelBookingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomerHotelBookingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerHotelBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
