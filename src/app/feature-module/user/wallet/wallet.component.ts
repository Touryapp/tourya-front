import { Component } from '@angular/core';
import { routes } from '../../../shared/routes/routes';
import { apiResultFormat, wallet } from '../../../shared/models/models';
import { pageSelection, PaginationService, tablePageSize } from '../../../shared/custom-pagination/pagination.service';
import { MatTableDataSource } from '@angular/material/table';
import { DataService } from '../../../shared/data/data.service';
import { Router } from '@angular/router';
import { Sort } from '@angular/material/sort';

@Component({
  selector: 'app-wallet',
  standalone: false,
  
  templateUrl: './wallet.component.html',
  styleUrl: './wallet.component.scss'
})
export class WalletComponent {
  public routes=routes;
  isPayment=true;
  isPayment1=false;
  isPayment2=false;
  password: boolean[] = [false, false]; // Add more as needed
   initChecked = false;
    selectedTime: Date = new Date(); 
    // pagination variables
    public pageSize = 10;
    public tableData: wallet[] = [];
    public tableDataCopy: wallet[] = [];
    public actualData: wallet[] = [];
    public serialNumberArray: number[] = [];
    public totalData = 0;
    showFilter = false;
    dataSource!: MatTableDataSource<wallet>;
    public searchDataValue = '';
    isOpen = false
    openSuccessModal() {
      this.isOpen = !this.isOpen;
    }
    ngOnDestroy(): void {
      this.isOpen = false
    }
    constructor(
      private data: DataService,
      private router: Router,
      private pagination: PaginationService
    ) {
      this.data.getWallet().subscribe((apiRes: apiResultFormat) => {
        this.actualData = apiRes.data;
        this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
          if (this.router.url == this.routes.wallet) {
            this.getTableData({ skip: res.skip, limit: res.limit });
            this.pageSize = res.pageSize;
          }
        });
      });
    }
    private getTableData(pageOption: pageSelection): void {
      this.data.getWallet().subscribe((apiRes: apiResultFormat) => {
        this.tableData = [];
        this.tableDataCopy = [];
        this.serialNumberArray = [];
        this.totalData = apiRes.totalData;
        apiRes.data.map((res: wallet, index: number) => {
          const serialNumber = index + 1;
          if (index >= pageOption.skip && serialNumber <= pageOption.limit) {
            res.sNo = serialNumber;
            this.tableData.push(res);
            this.tableDataCopy.push(res);
            this.serialNumberArray.push(serialNumber);
          }
        });
        this.dataSource = new MatTableDataSource<wallet>(this.actualData);
        this.pagination.calculatePageSize.next({
          totalData: this.totalData,
          pageSize: this.pageSize,
          tableData: this.tableData,
          tableDataCopy: this.tableDataCopy,
          serialNumberArray: this.serialNumberArray,
        });
      });
    }
  
    public searchData(value: string): void {
      if (value == '') {
        this.tableData = this.tableDataCopy;
      } else {
        this.dataSource.filter = value.trim().toLowerCase();
        this.tableData = this.dataSource.filteredData;
      }
    }
  
    public sortData(sort: Sort) {
      const data = this.tableData.slice();
  
      if (!sort.active || sort.direction === '') {
        this.tableData = data;
      } else {
        this.tableData = data.sort((a, b) => {
          const aValue = (a as never)[sort.active];
  
          const bValue = (b as never)[sort.active];
          return (aValue < bValue ? -1 : 1) * (sort.direction === 'asc' ? 1 : -1);
        });
      }
    }
  
    // Placeholder for the dropdown
    dropdownPlaceholder = 'Select';
  
  
    // Selected value
    selectedOption: number | null = 2;
  
    // Handle value change
    onDropdownChange(selectedValue: number | string): void {
      console.log('Selected Value:', selectedValue);
      this.selectedOption = selectedValue as number;
    }
    togglePassword(index: number): void {
      this.password[index] = !this.password[index];
    }
    onPayment() : void{
     this.isPayment1=false;
     this.isPayment=true;
     this.isPayment2=false;
    }
    onPayment1() : void{
     this.isPayment=false;
     this.isPayment1=true;
     this.isPayment2=false;
    }
    onPayment2() : void{
     this.isPayment2=true;
     this.isPayment=false;
     this.isPayment1=false;
    }
}
