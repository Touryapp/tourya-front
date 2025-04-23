import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WithdrawTableComponent } from './withdraw-table.component';

describe('WithdrawTableComponent', () => {
  let component: WithdrawTableComponent;
  let fixture: ComponentFixture<WithdrawTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WithdrawTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WithdrawTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
