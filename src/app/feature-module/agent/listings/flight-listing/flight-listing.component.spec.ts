import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightListingComponent } from './flight-listing.component';

describe('FlightListingComponent', () => {
  let component: FlightListingComponent;
  let fixture: ComponentFixture<FlightListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FlightListingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlightListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
