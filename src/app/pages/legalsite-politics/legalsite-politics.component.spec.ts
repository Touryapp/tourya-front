import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LegalsitePoliticsComponent } from './legalsite-politics.component';

describe('LegalsitePoliticsComponent', () => {
  let component: LegalsitePoliticsComponent;
  let fixture: ComponentFixture<LegalsitePoliticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LegalsitePoliticsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LegalsitePoliticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
