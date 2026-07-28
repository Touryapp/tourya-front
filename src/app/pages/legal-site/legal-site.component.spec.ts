import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LegalSiteComponent } from './legal-site.component';

describe('LegalSiteComponent', () => {
  let component: LegalSiteComponent;
  let fixture: ComponentFixture<LegalSiteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LegalSiteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LegalSiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
