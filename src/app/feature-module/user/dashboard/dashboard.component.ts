import { Component, OnInit } from '@angular/core';
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
import { routes } from '../../../shared/routes/routes';


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
  selector: 'app-dashboard',
  standalone: false,
  
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  routes = routes
  public toursChart: Partial<ChartOptions> | any;
  public transactionChart: Partial<ChartOptions> | any;
  public val=0;
  originalSeries: number[] = [9, 8, 6, 4]; // Original values before normalization

  ngOnInit(): void {
    const maxValue = 10;

    // Normalize series to percentages
    const normalizedSeries = this.originalSeries.map((value) => (value / maxValue) * 100);

    this.toursChart = {
      series: normalizedSeries,
      chart: {
        height: 280,
        type: 'radialBar',
      },
      plotOptions: {
        radialBar: {
          offsetY: 0,
          startAngle: 0,
          endAngle: 270,
          hollow: {
            margin: 5,
            size: '30%',
            background: 'transparent',
          },
          dataLabels: {
            labels: ['Hotels', 'Cars', 'Tours', 'Flights'],
            name: {
              show: true,
              offsetY: 20,
              fontSize: '14px',
            },
            value: {
              show: true,
              offsetY: -10,
              fontSize: '16px',
              
            },
            
          },
        },
      },
      colors: ['#155EEF', '#212E47', '#98AA30', '#CF3425'],
      labels: ['Hotels', 'Cars', 'Tours', 'Flights'],
      responsive: [
        {
          breakpoint: 480,
          options: {
            legend: {
              show: true,
            },
            plotOptions: {
              radialBar: {
                dataLabels: {
                  fontSize: '8px',
                },
              },
            },
          },
        },
      ],
    };
this.transactionChart={
  chart: {
    height: 250,
    type: 'bar',
    stacked: true,
    toolbar: {
      show: false,
    }
  },
  colors: ['#CF3425', '#FEEDEB'],
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
}
    
  }


  
  

