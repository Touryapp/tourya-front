import { routes } from './../../../shared/routes/routes';
import { Component } from '@angular/core';
import { Editor, Toolbar } from 'ngx-editor';
@Component({
  selector: 'app-enquiry-details',
  standalone: false,
  
  templateUrl: './enquiry-details.component.html',
  styleUrl: './enquiry-details.component.scss'
})
export class EnquiryDetailsComponent {
routes = routes
editor!: Editor;
toolbar: Toolbar = [
  ['bold', 'italic', 'format_clear'],
  ['underline', 'strike'],
  [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
  ['image'],
];
ngOnInit(): void {

  this.editor = new Editor();
}
ngOnDestroy(): void {
  this.editor.destroy();
}
}
