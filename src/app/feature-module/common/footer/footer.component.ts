import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DataService } from '../../../shared/data/data.service';
import { SideBarService } from '../../../shared/side-bar/side-bar.service';
import { CommonService } from '../../../shared/common/common.service';
import { routes } from '../../../shared/routes/routes';


@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.scss',
    standalone: false
})
export class FooterComponent implements OnInit {
  public routes= routes;
  currentYear!: number;
  base = '';
  public page = '';
  last = '';
  constructor(
    private cdRef: ChangeDetectorRef,
     private data: DataService,
        private sideBar: SideBarService,
        private common: CommonService,
  ) { 
    this.common.base.subscribe((res: string) => {
    this.base = res;
  });
  this.common.page.subscribe((res: string) => {
    this.page = res;
  });
  this.common.page.subscribe((res: string) => {
    this.last = res;
  });}
  ngOnInit(): void {
    this.currentYear = new Date().getFullYear();
    this.cdRef.detectChanges();
  }
  
}
