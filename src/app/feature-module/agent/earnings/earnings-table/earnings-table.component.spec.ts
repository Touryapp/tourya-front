import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EarningsTableComponent } from './earnings-table.component';

describe('EarningsTableComponent', () => {
  let component: EarningsTableComponent;
  let fixture: ComponentFixture<EarningsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EarningsTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EarningsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
