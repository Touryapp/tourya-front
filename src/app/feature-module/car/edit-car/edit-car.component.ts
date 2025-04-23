import { Component, HostListener } from '@angular/core';
import { routes } from '../../../shared/routes/routes';
import { Router } from '@angular/router';
import { Editor, Toolbar } from 'ngx-editor';

@Component({
  selector: 'app-edit-car',
  standalone: false,
  
  templateUrl: './edit-car.component.html',
  styleUrl: './edit-car.component.scss'
})
export class EditCarComponent {
  public routes=routes;
  bsValue=new Date();
  isDelete : boolean[]=[false];
  constructor(private router:Router){}
  editor!: Editor;
  toolbar: Toolbar = [
    ['bold', 'italic', 'format_clear'],
    ['underline', 'strike'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['image'],
  ];
  tabs = [
    { id: 'basic_info', label: 'Basic Info' },
    { id: 'specifications', label: 'Specifications' },
    { id: 'additional_service', label: 'Additional Service' },
    { id: 'description', label: 'Description' },
    { id: 'features', label: 'Features' },
    { id: 'location', label: 'Locations' },
    { id: 'faq', label: 'FAQ' },
    { id: 'gallery', label: 'Gallery' },
  ];

  activeTab: string = this.tabs[0].id ; // Default to the first tab

  @HostListener('window:scroll', [])
  onScroll(): void {
    const scrollPosition = window.scrollY || document.documentElement.scrollTop;

  this.tabs.forEach((tab) => {
      const element = document.getElementById(tab.id);
      if (element) {
        const sectionTop = element.offsetTop - 100; // Adjust offset for fixed headers
        const sectionBottom = sectionTop + element.offsetHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
          this.activeTab = tab.id;
        }
      }
    });
  }


  scrollTo(id: string): void {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.activeTab = id; // Update the active tab
    }
  }
  formData: any[] = []; // Initialize with an empty object to start with one row

  addNewRow() {
    this.formData.push({});
  }

  removeRow(index: number) {
      this.formData.splice(index, 1);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  trackByIndex(index: number, item: any) {
    return index;
  }
  onDelete(index:number):void{
    this.isDelete[index]=!this.isDelete[index];
  }
  onSubmit() :void { 
    this.router.navigateByUrl('/car/car-grid'); 
  }
  ngOnInit(): void {

    this.editor = new Editor();
  }
  ngOnDestroy(): void {
    this.editor.destroy();
  }
}
