import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentChatComponent } from './agent-chat.component';

describe('AgentChatComponent', () => {
  let component: AgentChatComponent;
  let fixture: ComponentFixture<AgentChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AgentChatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgentChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
