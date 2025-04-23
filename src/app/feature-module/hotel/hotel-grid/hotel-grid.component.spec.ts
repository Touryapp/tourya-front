import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HotelGridComponent } from './hotel-grid.component';

describe('HotelGridComponent', () => {
  let component: HotelGridComponent;
  let fixture: ComponentFixture<HotelGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HotelGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HotelGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
