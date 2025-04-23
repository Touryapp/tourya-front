import { Component, HostListener } from '@angular/core';
import { routes } from '../../../shared/routes/routes';
import { Router } from '@angular/router';
import { Editor, Toolbar } from 'ngx-editor';

@Component({
  selector: 'app-add-flight',
  standalone: false,
  
  templateUrl: './add-flight.component.html',
  styleUrl: './add-flight.component.scss'
})
export class AddFlightComponent {
  public routes=routes;
  bsValue=new Date();
  time: Date | null = null;
  isDelete : boolean[]=[false];
  constructor(private router:Router){}
  editor!: Editor;
  editor1!: Editor;
  toolbar: Toolbar = [
    ['bold', 'italic', 'format_clear'],
    ['underline', 'strike'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['image'],
  ];
  tabs = [
    { id: 'basic_info', label: 'Basic Info' },
    { id: 'specifications', label: 'specifications' },
    { id: 'departure', label: 'Arrival &Departure' },
    { id: 'location', label: 'Locations' },
    { id: 'additional_service', label: 'Additional Service' },
    { id: 'amenties', label: 'Amenities' },
    { id: 'faq', label: 'FAQ' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'description', label: 'Description' },
  ];
  tabs1 = [
    { id: 'basic_info_2', label: 'Basic Info' },
    { id: 'description_2', label: 'Description' },
    { id: 'specification', label: 'Specifications' },
    { id: 'popular_amenities_2', label: 'Amenities' },
    { id: 'gallery_2', label: 'Gallery' },
  ];
  activeTab: string = this.tabs[0]?.id || this.tabs1[0]?.id; // Default to the first tab

  @HostListener('window:scroll', [])
  onScroll(): void {
    const scrollPosition = window.scrollY || document.documentElement.scrollTop;

      // Combine tabs and tabs1 for iteration
  const allTabs = [...this.tabs, ...this.tabs1];

  allTabs.forEach((tab) => {
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
    this.router.navigateByUrl('/flight/flight-grid'); 
  }
  ngOnInit(): void {
    this.editor = new Editor();
    this.editor1 = new Editor();
  }
  ngOnDestroy(): void {
    this.editor.destroy();
    this.editor1.destroy();
  }

}
