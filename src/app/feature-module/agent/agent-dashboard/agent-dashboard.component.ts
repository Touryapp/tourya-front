import { routes } from './../../../shared/routes/routes';
import { Component } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexGrid,
  ApexLegend,
  ApexStroke,
  ApexTitleSubtitle,
  ApexXAxis,
  ChartComponent,
} from 'ng-apexcharts';
import { apiResultFormat, BookingDetails } from '../../../shared/models/models';
import { pageSelection, PaginationService, tablePageSize } from '../../../shared/custom-pagination/pagination.service';
import { MatTableDataSource } from '@angular/material/table';
import { DataService } from '../../../shared/data/data.service';
import { Router } from '@angular/router';
import { Sort } from '@angular/material/sort';


export interface ChartOptions {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
  labels: string[];
  responsive: ApexResponsive[];
  colors: string[];
}
@Component({
  selector: 'app-agent-dashboard',
  standalone: false,
  
  templateUrl: './agent-dashboard.component.html',
  styleUrl: './agent-dashboard.component.scss'
})
export class AgentDashboardComponent {
routes  = routes;
 public earning_chart: Partial<ChartOptions> | any;
 public booking_chart: Partial<ChartOptions> | any;


   selectedTime: Date = new Date(); 

   // pagination variables
   public pageSize = 10;
   public tableData: BookingDetails[] = [];
   public tableDataCopy: BookingDetails[] = [];
   public actualData: BookingDetails[] = [];
   public currentPage = 1;
   public skip = 0;
   public limit: number = this.pageSize;
   public serialNumberArray: number[] = [];
   public totalData = 0;
   showFilter = false;
   public pageSelection: pageSelection[] = [];
   dataSource!: MatTableDataSource<BookingDetails>;
   public searchDataValue = '';
   public password: boolean[] = [false,false,false,false];
   constructor(
     private data: DataService,
     private router: Router,
     private pagination: PaginationService
   ) {
     this.data.getAgentDashboard().subscribe((apiRes: apiResultFormat) => {
       this.actualData = apiRes.data;
       this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
         if (this.router.url == this.routes.agentDashboard) {
           this.getTableData({ skip: res.skip, limit: res.limit });
           this.pageSize = res.pageSize;
         }
       });
     });
   }
   private getTableData(pageOption: pageSelection): void {
     this.data.getAgentDashboard().subscribe((apiRes: apiResultFormat) => {
       this.tableData = [];
       this.tableDataCopy = [];
       this.serialNumberArray = [];
       this.totalData = apiRes.totalData;
       apiRes.data.map((res: BookingDetails, index: number) => {
         const serialNumber = index + 1;
         if (index >= pageOption.skip && serialNumber <= pageOption.limit) {
           res.sNo = serialNumber;
           this.tableData.push(res);
           this.tableDataCopy.push(res);
           this.serialNumberArray.push(serialNumber);
         }
       });
       this.dataSource = new MatTableDataSource<BookingDetails>(this.actualData);
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
 ngOnInit():void{
 this.earning_chart={
 chart: {
  height: 280,
  type: 'bar',
  stacked: true,
  toolbar: {
    show: false,
  }
},
colors: ['#0E9384', '#E4EBF1'],
responsive: [{
  breakpoint: 480,
  options: {
    legend: {
      position: 'bottom',
      offsetX: -10,
      offsetY: 0
    }
  }
}],
plotOptions: {
  bar: {
    borderRadius: 5, 
    borderRadiusWhenStacked: 'all',
    horizontal: false,
    endingShape: 'rounded'
  },
},
series: [{
  name: 'Income',
  data: [5000, 16000, 8000, 5000, 4000, 5000, 12000, 5000, 8000, 5000, 5000, 8000]
}, {
  name: 'Expenses',
  data: [5000, 4000, 4000, 5000, 8000, 5000, 4000, 5000, 4000, 5000, 5000, 4000]
}],
xaxis: {
  categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct','Nov', 'Dec'],
  labels: {
    style: {
      colors: '#4E5561', 
      fontSize: '12px',
    }
  }
},
yaxis: {
  labels: {
    formatter: (val:any) => {
      return val / 1000 + 'K'
    },
    offsetX: -15,
    style: {
      colors: '#4E5561', 
      fontSize: '13px',
    }
  }
},
grid: {
  show:false,
},
legend: {
  show: false
},
dataLabels: {
  enabled: false // Disable data labels
},
fill: {
  opacity: 1
},
 }
 this.booking_chart={
  chart: {
    height: 180,
    type: 'donut',
    toolbar: {
      show: false,
    }
  },
  legend: {
    show: false
  },
  colors: ['#212E47', '#3538CD', '#0E9384', '#CF3425', '#98AA30'],
  series: [25, 15, 35, 5, 20],
  labels: ['Cruise', 'Cars', 'Hotels', 'Tour','Flights'],
  plotOptions: {
    pie: {
      donut: {
        size: '65%', // Adjust the inner radius of the donut
      },
    },
  },
  stroke: {
    width: 3, // Adds space between segments
    colors: ['#fff'], // Color of the gap (white in this case)
  },
  dataLabels: {
    enabled: false, // Hides the data labels
  },
 }
}

}
