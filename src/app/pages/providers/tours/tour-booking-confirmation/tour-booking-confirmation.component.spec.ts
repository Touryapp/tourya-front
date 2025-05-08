import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TourBookingConfirmationComponent } from './tour-booking-confirmation.component';

describe('TourBookingConfirmationComponent', () => {
  let component: TourBookingConfirmationComponent;
  let fixture: ComponentFixture<TourBookingConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TourBookingConfirmationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TourBookingConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
