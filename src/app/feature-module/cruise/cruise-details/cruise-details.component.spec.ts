import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CruiseDetailsComponent } from './cruise-details.component';

describe('CruiseDetailsComponent', () => {
  let component: CruiseDetailsComponent;
  let fixture: ComponentFixture<CruiseDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CruiseDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CruiseDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
