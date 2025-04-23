import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndexRtlComponent } from './index-rtl.component';

describe('IndexRtlComponent', () => {
  let component: IndexRtlComponent;
  let fixture: ComponentFixture<IndexRtlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IndexRtlComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndexRtlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
