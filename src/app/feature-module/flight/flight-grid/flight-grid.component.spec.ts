import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightGridComponent } from './flight-grid.component';

describe('FlightGridComponent', () => {
  let component: FlightGridComponent;
  let fixture: ComponentFixture<FlightGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FlightGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlightGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
