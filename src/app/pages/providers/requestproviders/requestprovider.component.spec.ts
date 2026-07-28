import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestproviderComponent } from './requestprovider.component';

describe('RequestproviderComponent', () => {
  let component: RequestproviderComponent;
  let fixture: ComponentFixture<RequestproviderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RequestproviderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestproviderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
}); 