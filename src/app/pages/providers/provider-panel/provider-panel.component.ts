import { Component, OnInit } from '@angular/core';
import { routes } from "../../../shared/routes/routes";
import { RequestProvider } from '../../../shared/dto/requestProvider-response.dto';
import { RequestProvidersService } from '../requestproviders/request-providers.service';

@Component({
  selector: 'app-provider-panel',
  standalone: false,
  templateUrl: './provider-panel.component.html',
  styleUrl: './provider-panel.component.scss'
})
export class ProviderPanelComponent implements OnInit {
  public routes = routes;
  
  showModal = false;
  showRequestInfoModal = false;
  showConfirmModal = false;
  showDeclineConfirmModal = false;
  selectedProvider: RequestProvider | null = null;
  requestInfoMessage: string = '';
  requestProviders: any = { content: [] };
  mostrarTours: boolean = false;
  declinedReason: string = '';

  constructor(private requestProvidersService: RequestProvidersService) {}

  ngOnInit(): void {
    
  }

  
} 