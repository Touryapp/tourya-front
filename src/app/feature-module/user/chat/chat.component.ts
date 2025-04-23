import { Component } from '@angular/core';
import { routes } from '../../../shared/routes/routes';

@Component({
  selector: 'app-chat',
  standalone: false,
  
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent {
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
