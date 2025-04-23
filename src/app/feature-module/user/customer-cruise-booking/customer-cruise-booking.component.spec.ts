import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerCruiseBookingComponent } from './customer-cruise-booking.component';

describe('CustomerCruiseBookingComponent', () => {
  let component: CustomerCruiseBookingComponent;
  let fixture: ComponentFixture<CustomerCruiseBookingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomerCruiseBookingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerCruiseBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
