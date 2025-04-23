import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CruiseMapComponent } from './cruise-map.component';

describe('CruiseMapComponent', () => {
  let component: CruiseMapComponent;
  let fixture: ComponentFixture<CruiseMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CruiseMapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CruiseMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
