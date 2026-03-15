import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientCreditsComponent } from './client-credits.component';

describe('ClientCreditsComponent', () => {
  let component: ClientCreditsComponent;
  let fixture: ComponentFixture<ClientCreditsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClientCreditsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientCreditsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
