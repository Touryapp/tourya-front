import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PagesModuleRoutingModule } from "./pages-module-routing.module";
import { PagesModuleComponent } from "./pages-module.component";
import { SharedModule } from "../shared/shared-module";
import { FormsModule } from "@angular/forms";
import { DefaultHeaderComponent } from "../shared/common/default-header/default-header.component";
import { BlogsiteComponent } from './blogsite/blogsite.component';
import { LegalSiteComponent } from './legal-site/legal-site.component';

@NgModule({
  declarations: [PagesModuleComponent, DefaultHeaderComponent, BlogsiteComponent, LegalSiteComponent],
  imports: [CommonModule, PagesModuleRoutingModule, SharedModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PagesModuleModule {}
