import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BecomeAnExpertComponent } from './become-an-expert.component';

describe('BecomeAnExpertComponent', () => {
  let component: BecomeAnExpertComponent;
  let fixture: ComponentFixture<BecomeAnExpertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BecomeAnExpertComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BecomeAnExpertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
