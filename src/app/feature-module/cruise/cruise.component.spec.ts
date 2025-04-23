import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CruiseComponent } from './cruise.component';

describe('CruiseComponent', () => {
  let component: CruiseComponent;
  let fixture: ComponentFixture<CruiseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CruiseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CruiseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
