import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerCarBookingComponent } from './customer-car-booking.component';

describe('CustomerCarBookingComponent', () => {
  let component: CustomerCarBookingComponent;
  let fixture: ComponentFixture<CustomerCarBookingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomerCarBookingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerCarBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
