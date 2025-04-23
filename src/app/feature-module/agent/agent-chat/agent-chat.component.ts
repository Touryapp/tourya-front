import { Component } from '@angular/core';
import { routes } from '../../../shared/routes/routes';

@Component({
  selector: 'app-agent-chat',
  standalone: false,
  
  templateUrl: './agent-chat.component.html',
  styleUrl: './agent-chat.component.scss'
})
export class AgentChatComponent {
routes=routes;
isOpen=false;
isSearch=false;
isEmoji():void{
  this.isOpen=!this.isOpen
}
openSearch():void{
  this.isSearch=!this.isSearch
}
}
