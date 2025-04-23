import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TourListingComponent } from './tour-listing.component';

describe('TourListingComponent', () => {
  let component: TourListingComponent;
  let fixture: ComponentFixture<TourListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TourListingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TourListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
