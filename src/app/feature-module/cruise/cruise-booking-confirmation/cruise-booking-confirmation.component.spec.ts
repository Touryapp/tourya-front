import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CruiseBookingConfirmationComponent } from './cruise-booking-confirmation.component';

describe('CruiseBookingConfirmationComponent', () => {
  let component: CruiseBookingConfirmationComponent;
  let fixture: ComponentFixture<CruiseBookingConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CruiseBookingConfirmationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CruiseBookingConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
