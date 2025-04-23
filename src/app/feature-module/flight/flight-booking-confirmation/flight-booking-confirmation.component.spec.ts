import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightBookingConfirmationComponent } from './flight-booking-confirmation.component';

describe('FlightBookingConfirmationComponent', () => {
  let component: FlightBookingConfirmationComponent;
  let fixture: ComponentFixture<FlightBookingConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FlightBookingConfirmationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlightBookingConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
