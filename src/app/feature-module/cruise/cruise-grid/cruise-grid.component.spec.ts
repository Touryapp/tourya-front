import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CruiseGridComponent } from './cruise-grid.component';

describe('CruiseGridComponent', () => {
  let component: CruiseGridComponent;
  let fixture: ComponentFixture<CruiseGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CruiseGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CruiseGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
