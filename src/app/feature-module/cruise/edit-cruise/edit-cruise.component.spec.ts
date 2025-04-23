import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCruiseComponent } from './edit-cruise.component';

describe('EditCruiseComponent', () => {
  let component: EditCruiseComponent;
  let fixture: ComponentFixture<EditCruiseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditCruiseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditCruiseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
