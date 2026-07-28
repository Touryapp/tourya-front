import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TourDetailsProviderComponent } from './tour-details.component';

describe('TourDetailsProviderComponent', () => {
  let component: TourDetailsProviderComponent;
  let fixture: ComponentFixture<TourDetailsProviderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TourDetailsProviderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TourDetailsProviderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
