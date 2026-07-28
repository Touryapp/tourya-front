import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperatorPoliciesComponent } from './operator-policies.component';

describe('OperatorPoliciesComponent', () => {
  let component: OperatorPoliciesComponent;
  let fixture: ComponentFixture<OperatorPoliciesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OperatorPoliciesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OperatorPoliciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
