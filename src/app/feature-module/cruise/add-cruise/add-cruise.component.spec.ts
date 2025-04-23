import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCruiseComponent } from './add-cruise.component';

describe('AddCruiseComponent', () => {
  let component: AddCruiseComponent;
  let fixture: ComponentFixture<AddCruiseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddCruiseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddCruiseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
