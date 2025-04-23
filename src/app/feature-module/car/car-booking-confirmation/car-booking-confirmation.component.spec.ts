import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarBookingConfirmationComponent } from './car-booking-confirmation.component';

describe('CarBookingConfirmationComponent', () => {
  let component: CarBookingConfirmationComponent;
  let fixture: ComponentFixture<CarBookingConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CarBookingConfirmationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarBookingConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
