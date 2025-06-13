import { Component, OnInit } from '@angular/core';
import { RequestProvider } from '../../../shared/dto/requestProvider-response.dto';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: false
})
export class DashboardComponent implements OnInit {
  // Lista simulada de solicitudes de proveedores
  requestProviders: RequestProvider[] = [
    {
      id: 1,
      status: 'Pending',
      provider: {
        id: 101,
        name: 'Juan Pérez',
        documentNumber: '12345678',
        documentType: 'DNI',
        serviceType: 'Hotel',
        country: { id: 1, name: 'Argentina' },
        city: { id: 1, name: 'Buenos Aires' },
        state: { id: 1, name: 'Buenos Aires' },
        department: 'Centro',
        address: 'Calle Falsa 123',
        phone: '+54 11 1234-5678',
        status: 'Active'
      }
    },
    {
      id: 2,
      status: 'Approved',
      provider: {
        id: 102,
        name: 'María Gómez',
        documentNumber: '87654321',
        documentType: 'CUIT',
        serviceType: 'Tour',
        country: { id: 2, name: 'Chile' },
        city: { id: 2, name: 'Santiago' },
        state: { id: 2, name: 'RM' },
        department: 'Las Condes',
        address: 'Av. Principal 456',
        phone: '+56 2 2345-6789',
        status: 'Active'
      }
    },
    {
      id: 3,
      status: 'Rejected',
      provider: {
        id: 103,
        name: 'Carlos Ruiz',
        documentNumber: '11223344',
        documentType: 'DNI',
        serviceType: 'Car',
        country: { id: 3, name: 'Uruguay' },
        city: { id: 3, name: 'Montevideo' },
        state: { id: 3, name: 'Montevideo' },
        department: 'Centro',
        address: 'Calle 8 789',
        phone: '+598 2 3456-7890',
        status: 'Inactive'
      }
    }
  ];

  constructor() { }

  ngOnInit(): void {
  }

} 