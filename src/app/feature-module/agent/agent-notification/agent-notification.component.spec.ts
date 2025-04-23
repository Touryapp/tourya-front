import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentNotificationComponent } from './agent-notification.component';

describe('AgentNotificationComponent', () => {
  let component: AgentNotificationComponent;
  let fixture: ComponentFixture<AgentNotificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AgentNotificationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgentNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
