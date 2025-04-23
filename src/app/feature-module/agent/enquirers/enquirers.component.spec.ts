import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnquirersComponent } from './enquirers.component';

describe('EnquirersComponent', () => {
  let component: EnquirersComponent;
  let fixture: ComponentFixture<EnquirersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EnquirersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnquirersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
