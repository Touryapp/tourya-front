import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CruiseListingComponent } from './cruise-listing.component';

describe('CruiseListingComponent', () => {
  let component: CruiseListingComponent;
  let fixture: ComponentFixture<CruiseListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CruiseListingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CruiseListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
