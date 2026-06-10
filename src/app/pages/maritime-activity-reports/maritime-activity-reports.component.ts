import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaritimeActivityReportService } from '../../shared/services/maritime-activity-report.service';
import { MaritimeActivityReport, MaritimeFlag, PaginatedMaritimeReports } from '../../shared/models/maritime-activity-report.model';
import { SharedModule } from '../../shared/shared-module';
import { materialModule } from '../../shared/material.module';
import { routes } from '../../shared/routes/routes';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { Subject, takeUntil } from 'rxjs';
import { CountryService } from '../../shared/services/country.service';
import { DepartmentService } from '../../shared/services/department.service';
import { CityService } from '../../shared/services/city.service';
import { SearchToursService } from '../clients/list-tours/search-tours.service';

@Component({
  selector: 'app-maritime-activity-reports',
  templateUrl: './maritime-activity-reports.component.html',
  styleUrls: ['./maritime-activity-reports.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    SharedModule,
    materialModule
  ]
})
export class MaritimeActivityReportsComponent implements OnInit {
  @Input() embedMode: boolean = false;
  public routes = routes;
  private destroy$ = new Subject<void>();

  // Data
  reports: MaritimeActivityReport[] = [];
  dataSource = new MatTableDataSource<MaritimeActivityReport>([]);
  displayedColumns: string[] = ['id', 'country', 'city', 'tag', 'flag', 'reportDate', 'actions'];
  
  // Dashboard Stats
  todayReport: MaritimeActivityReport | null = null;
  totalElements = 0;
  pageSize = 10;
  currentPage = 0;

  // Filters
  filterForm: FormGroup;
  
  // Form (Modal Simulation)
  reportForm: FormGroup;
  isEditMode = false;
  selectedReportId: number | null = null;
  showFormModal = false;

  countries: any[] = [];
  departments: any[] = [];
  cities: any[] = [];
  categories: any[] = [];
  subCategories: any[] = [];
  tags: any[] = [];
  minDate: string = '';

  // Enums for UI
  maritimeFlags = Object.values(MaritimeFlag);

  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private reportsService: MaritimeActivityReportService,
    private countryService: CountryService,
    private departmentService: DepartmentService,
    private cityService: CityService,
    private searchToursService: SearchToursService
  ) {
    this.filterForm = this.fb.group({
      date: [''],
      country: [''],
      city: ['']
    });

    this.reportForm = this.fb.group({
      country: ['', Validators.required],
      department: [''],
      city: ['', Validators.required],
      category: [''],
      subCategory: [''],
      tag: ['', Validators.required],
      flag: [MaritimeFlag.GREEN, Validators.required],
      reportStartDate: ['', Validators.required],
      reportEndDate: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.minDate = new Date().toISOString().split('T')[0];
    this.loadReports();
    this.loadCountries();
    this.loadCategories();
    this.loadTags();
  }

  loadTags(): void {
    this.searchToursService.tagPublic().subscribe({
      next: (res: any[]) => this.tags = res,
      error: (err) => console.error('Error loading tags', err)
    });
  }

  loadCountries(): void {
    this.countryService.getCountries().subscribe({
      next: (res) => this.countries = res,
      error: (err) => console.error('Error loading countries', err)
    });
  }

  loadCategories(): void {
    this.searchToursService.categoriesPublic().subscribe({
      next: (res: any[]) => this.categories = res,
      error: (err) => console.error('Error loading categories', err)
    });
  }

  onCountryChange(event: any): void {
    const selectedName = event.target ? event.target.value : event;
    const selectedCountry = this.countries.find(c => c.name === selectedName);
    
    if (selectedCountry) {
      this.departmentService.getDepartmentsByCountryId(selectedCountry.id).subscribe({
        next: (res) => {
          this.departments = res;
          this.cities = [];
          this.reportForm.patchValue({ department: '', city: '' });
        },
        error: (err) => console.error(err)
      });
    } else {
      this.departments = [];
      this.cities = [];
      this.reportForm.patchValue({ department: '', city: '' });
    }
  }

  onDepartmentChange(event: any): void {
    const selectedName = event.target ? event.target.value : event;
    const selectedDept = this.departments.find(d => d.name === selectedName);
    
    if (selectedDept) {
      this.cityService.getCitiesByDepartmentId(selectedDept.id).subscribe({
        next: (res) => {
          this.cities = res;
          this.reportForm.patchValue({ city: '' });
        },
        error: (err) => console.error(err)
      });
    } else {
      this.cities = [];
      this.reportForm.patchValue({ city: '' });
    }
  }

  onCategoryChange(event: any): void {
    const selectedName = event.target ? event.target.value : event;
    const selectedCategory = this.categories.find(c => c.name === selectedName);
    
    if (selectedCategory && selectedCategory.subCategories) {
      this.subCategories = selectedCategory.subCategories;
    } else {
      this.subCategories = [];
    }
    this.reportForm.patchValue({ subCategory: '' });
  }

  loadReports(): void {
    this.reportsService.getAll(this.currentPage, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PaginatedMaritimeReports) => {
          this.reports = response.content;
          this.dataSource.data = this.reports;
          this.totalElements = response.totalElements;
          
          // Buscar reporte de hoy
          const today = new Date().toISOString().split('T')[0];
          this.todayReport = this.reports.find(r => r.reportStartDate <= today && today <= r.reportEndDate) || null;

          if (this.sort) this.dataSource.sort = this.sort;
        },
        error: (err) => console.error('Error loading reports', err)
      });
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadReports();
  }

  applyFilters(): void {
    const { date, country, city } = this.filterForm.value;
    
    if (date) {
      this.reportsService.getByDate(date).subscribe(res => {
        this.dataSource.data = res;
      });
    } else if (country && city) {
      this.reportsService.getByCountryCity(country, city).subscribe(res => {
        this.dataSource.data = res;
      });
    } else {
      this.loadReports();
    }
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.loadReports();
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.selectedReportId = null;
    this.reportForm.reset({ flag: MaritimeFlag.GREEN });
    this.showFormModal = true;
  }

  openEditModal(report: MaritimeActivityReport): void {
    this.isEditMode = true;
    this.selectedReportId = report.id!;
    this.reportForm.patchValue({
      country: report.country,
      department: report.department || '',
      city: report.city,
      category: report.category || '',
      subCategory: report.subCategory || '',
      tag: report.tag,
      flag: report.flag,
      reportStartDate: report.reportStartDate,
      reportEndDate: report.reportEndDate
    });

    // Load dependent dropdowns if they have values
    if (report.country) {
      const selectedCountry = this.countries.find(c => c.name === report.country);
      if (selectedCountry) {
        this.departmentService.getDepartmentsByCountryId(selectedCountry.id).subscribe(res => {
          this.departments = res;
          if (report.department) {
            const selectedDept = this.departments.find(d => d.name === report.department);
            if (selectedDept) {
              this.cityService.getCitiesByDepartmentId(selectedDept.id).subscribe(resCity => {
                this.cities = resCity;
              });
            }
          }
        });
      }
    }

    if (report.category) {
      const selectedCategory = this.categories.find(c => c.name === report.category);
      if (selectedCategory && selectedCategory.subCategories) {
        this.subCategories = selectedCategory.subCategories;
      }
    }

    this.showFormModal = true;
  }

  closeModal(): void {
    this.showFormModal = false;
  }

  saveReport(): void {
    if (this.reportForm.invalid) return;

    const reportData = this.reportForm.value;

    if (this.isEditMode && this.selectedReportId) {
      this.reportsService.update(this.selectedReportId, reportData).subscribe({
        next: () => {
          this.loadReports();
          this.closeModal();
        },
        error: (err) => console.error('Error updating report', err)
      });
    } else {
      this.reportsService.create(reportData).subscribe({
        next: () => {
          this.loadReports();
          this.closeModal();
        },
        error: (err) => console.error('Error creating report', err)
      });
    }
  }

  deleteReport(id: number): void {
    if (confirm('¿Estás seguro de eliminar este reporte?')) {
      this.reportsService.delete(id).subscribe({
        next: () => this.loadReports(),
        error: (err) => console.error('Error deleting report', err)
      });
    }
  }

  getFlagClass(flag: MaritimeFlag): string {
    switch (flag) {
      case MaritimeFlag.GREEN: return 'bg-success-light text-success';
      case MaritimeFlag.YELLOW: return 'bg-warning-light text-warning';
      case MaritimeFlag.RED: return 'bg-danger-light text-danger';
      default: return 'bg-light text-muted';
    }
  }

  getBadgeClass(flag: MaritimeFlag): string {
    switch (flag) {
      case MaritimeFlag.GREEN: return 'badge-success';
      case MaritimeFlag.YELLOW: return 'badge-warning';
      case MaritimeFlag.RED: return 'badge-danger';
      default: return 'badge-secondary';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
