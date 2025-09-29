import { Injectable } from '@angular/core';
import { routes } from '../routes/routes';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { apiResultFormat, MainMenu, SideBar, SideBar2, SideBarMenu } from '../models/models';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private collapseSubject = new BehaviorSubject<boolean>(false);
  collapse$ = this.collapseSubject.asObservable();

  toggleCollapse() {
    this.collapseSubject.next(!this.collapseSubject.value);
  }
  constructor(private http: HttpClient) {}
  public getDataTable(): Observable<apiResultFormat> {
    return this.http.get<apiResultFormat>('assets/json/data-tables.json').pipe(
      map((res: apiResultFormat) => {
        return res;
      })
    );
  }
  public getFlightBooking(): Observable<apiResultFormat> {
    return this.http.get<apiResultFormat>('assets/json/flight-booking.json').pipe(
      map((res: apiResultFormat) => {
        return res;
      })
    );
  }
  public getEnquiry(): Observable<apiResultFormat> {
    return this.http.get<apiResultFormat>('assets/json/enquiry.json').pipe(
      map((res: apiResultFormat) => {
        return res;
      })
    );
  }
  public getEarnings(): Observable<apiResultFormat> {
    return this.http.get<apiResultFormat>('assets/json/earning.json').pipe(
      map((res: apiResultFormat) => {
        return res;
      })
    );
  }
  public getwithdraw(): Observable<apiResultFormat> {
    return this.http.get<apiResultFormat>('assets/json/withdraw.json').pipe(
      map((res: apiResultFormat) => {
        return res;
      })
    );
  }
  public getHotelBooking(): Observable<apiResultFormat> {
    return this.http.get<apiResultFormat>('assets/json/hotel-booking.json').pipe(
      map((res: apiResultFormat) => {
        return res;
      })
    );
  }
  public getCarBooking(): Observable<apiResultFormat> {
    return this.http.get<apiResultFormat>('assets/json/car-booking.json').pipe(
      map((res: apiResultFormat) => {
        return res;
      })
    );
  }
  public getCruiseBooking(): Observable<apiResultFormat> {
    return this.http.get<apiResultFormat>('assets/json/cruise-booking.json').pipe(
      map((res: apiResultFormat) => {
        return res;
      })
    );
  }
  public getTourBooking(): Observable<apiResultFormat> {
    return this.http.get<apiResultFormat>('assets/json/tour-booking.json').pipe(
      map((res: apiResultFormat) => {
        return res;
      })
    );
  }
  public getWallet(): Observable<apiResultFormat> {
    return this.http.get<apiResultFormat>('assets/json/wallet.json').pipe(
      map((res: apiResultFormat) => {
        return res;
      })
    );
  }
  public getPayment(): Observable<apiResultFormat> {
    return this.http.get<apiResultFormat>('assets/json/payment.json').pipe(
      map((res: apiResultFormat) => {
        return res;
      })
    );
  }
  public getAgentDashboard(): Observable<apiResultFormat> {
    return this.http.get<apiResultFormat>('assets/json/agent-dashboard.json').pipe(
      map((res: apiResultFormat) => {
        return res;
      })
    );
  }
  public getAgentHotel(): Observable<apiResultFormat> {
    return this.http.get<apiResultFormat>('assets/json/agent-hotel-booking.json').pipe(
      map((res: apiResultFormat) => {
        return res;
      })
    );
  }
  public getAgentFlight(): Observable<apiResultFormat> {
    return this.http.get<apiResultFormat>('assets/json/agent-flight-booking.json').pipe(
      map((res: apiResultFormat) => {
        return res;
      })
    );
  }
  public getAgentCar(): Observable<apiResultFormat> {
    return this.http.get<apiResultFormat>('assets/json/agent-car-booking.json').pipe(
      map((res: apiResultFormat) => {
        return res;
      })
    );
  }
  public getAgentCruise(): Observable<apiResultFormat> {
    return this.http.get<apiResultFormat>('assets/json/agent-cruise-booking.json').pipe(
      map((res: apiResultFormat) => {
        return res;
      })
    );
  }
  public getAgentTour(): Observable<apiResultFormat> {
    return this.http.get<apiResultFormat>('assets/json/agent-tour-booking.json').pipe(
      map((res: apiResultFormat) => {
        return res;
      })
    );
  }
  public sideBar2 : SideBar2[]=[
    {
      tittle:'Main',
      base:'user',
      showAsTab: false,
      separateRoute: false,
      menu:[
        {
          menuValue: 'Dashboard',
          route: routes.userDashboard,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'dashboard',
          page: '',
          last: '',
          subMenus: [],
          icon:'isax-grid-55'
        },
        {
          menuValue: 'Bookings',
          hasSubRoute: true,
          showSubRoute: false,
          icon:'isax-calendar-tick5',
          base:'customer-flight-booking',
          base2:'customer-hotel-booking',
          base3:'customer-car-booking',
          base4:'customer-cruise-booking',
          base5:'customer-tour-booking',
          subMenus: [
            {
              menuValue: 'Flights',
              route: routes.customerFlightBooking,
              hasSubRoute: false,
              base: "customer-flight-booking"
            },
            {
              menuValue: 'Hotels',
              route: routes.customerHotelBooking,
              hasSubRoute: false,
              base: "customer-hotel-booking"
            },
            {
              menuValue: 'Cars',
              route: routes.customerCarBooking,
              hasSubRoute: false,
              base: "customer-car-booking"
            },
            {
              menuValue: 'Cruise',
              route: routes.customerCruiseBooking,
              hasSubRoute: false,
              base: "customer-cruise-booking"
            },
            {
              menuValue: 'Tour',
              route: routes.customerTourBooking,
              hasSubRoute: false,
              base: "customer-tour-booking"
            },
          ],
        },
        {
          menuValue: 'My Reviews',
          route: routes.review,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'review',
          page: '',
          last: '',
          subMenus: [],
          icon:'isax-magic-star5'
        },
        {
          menuValue: 'Messages',
          route: routes.chat,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'message',
          count:'1',
          page: '',
          last: '',
          subMenus: [],
          icon:'isax-message-square5'
        },
        {
          menuValue: 'Wishlist',
          route: routes.wishlist,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'wishlist',
          page: '',
          last: '',
          subMenus: [],
          icon:'isax-heart5'
        },
      ]
    },
    {
      tittle:'Finance',
      base:'wallet',
      showAsTab: false,
      separateRoute: false,
      menu:[
        {
          menuValue: 'Wallet',
          route: routes.wallet,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'wallet',
          page: '',
          last: '',
          subMenus: [],
          icon:'isax-wallet-add-15'
        },
        {
          menuValue: 'Payments',
          route: routes.payment,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'payemnt',
          page: '',
          last: '',
          subMenus: [],
          icon:'isax-money-recive5'
        },
      ]
    },
    {
      tittle:'Account',
      base:'my-profile',
      showAsTab: false,
      separateRoute: false,
      menu:[
        {
          menuValue: 'My Profile',
          route: routes.myProfile,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'my-profile',
          page: '',
          last: '',
          subMenus: [],
          icon:'isax-profile-tick5'
        },
        {
          menuValue: 'Notifications',
          route: routes.notification,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'notification',
          count:'2',
          page: '',
          last: '',
          subMenus: [],
          icon:'isax-notification-bing5'
        },
        {
          menuValue: 'Settings',
          route: routes.profileSettings,
          hasSubRoute: false,
          showSubRoute: false,
          base5: 'profile-settings',
          base2:'notification-settings',
          base3:'security-settings',
          base4:'integration-settings',
          page: '',
          last: '',
          subMenus: [],
          icon:'isax-notification-bing5'
        },
        {
          menuValue: 'Logout',
          route: routes.index,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'index',
          page: '',
          last: '',
          subMenus: [],
          icon:'isax-notification-bing5'
        },
      ]
    }
  ]
  public getSideBarData2: BehaviorSubject<Array<SideBar2>> = new BehaviorSubject<
  Array<SideBar2>
  >(this.sideBar2);
  public agentSideBar : SideBar2[]=[
    {
      tittle:'Main',
      base:'dashboard',
      showAsTab: false,
      separateRoute: false,
      menu:[
        {
          menuValue: 'Dashboard',
          route: routes.agentDashboard,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'agent-dashboard',
          page: '',
          last: '',
          subMenus: [],
          icon:'isax-grid-55'
        },
        {
          menuValue: 'Listings',
          route: routes.agentListings,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'listings',
          page: '',
          last: '',
          subMenus: [],
          icon:'isax-menu-14'
        },
        {
          menuValue: 'Bookings',
          hasSubRoute: true,
          showSubRoute: false,
          icon:'isax-calendar-tick5',
          base:'fligt-booking',
          base2:'hotel-booking',
          base3:'car-booking',
          base4:'cruise-booking',
          base5:'tour-booking',
          subMenus: [
            {
              menuValue: 'Hotels',
              route: routes.agentHotelBooking,
              hasSubRoute: false,
              base: "hotel-booking"
            },
            {
              menuValue: 'Cars',
              route: routes.agentCarBooking,
              hasSubRoute: false,
              base: "car-booking"
            },
            {
              menuValue: 'Cruise',
              route: routes.agentCruiseBooking,
              hasSubRoute: false,
              base: "cruise-booking"
            },
            {
              menuValue: 'Tour',
              route: routes.agentTourBooking,
              hasSubRoute: false,
              base: "tour-booking"
            },
            {
              menuValue: 'Flights',
              route: routes.agentFlightBooking,
              hasSubRoute: false,
              base: "fligt-booking"
            },
           
            
            
          ],
        },
        {
          menuValue: 'Enquiries',
          route: routes.agentEnquirers,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'enquirers',
          page: '',
          last: '',
          subMenus: [],
          icon:'isax-magic-star5'
        },
        {
          menuValue: 'Earnings',
          route: routes.agentEarnings,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'earnings',
          page: '',
          last: '',
          subMenus: [],
          icon:'isax-wallet-add-15'
        },
        {
          menuValue: 'Reviews',
          route: routes.agentReview,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'reviews',
          page: '',
          last: '',
          subMenus: [],
          icon:'isax-magic-star5'
        },
        {
          menuValue: 'Settings',
          route: routes.agentSettings,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'settings',
          base2:'account-settings',
          base3:'security-settings',
          base4:'plans-settings',
          page: '',
          last: '',
          subMenus: [],
          icon:'isax-setting-25'
        },
      
      ]
    },
    
  ]
  public getAgentSideBar: BehaviorSubject<Array<SideBar2>> = new BehaviorSubject<
  Array<SideBar2>
  >(this.agentSideBar);
  public resetData2(): void {
    this.sideBar2.map((res: SideBar2) => {
      res.showAsTab = false;
      res.menu.map((menus: SideBarMenu) => {
        menus.showSubRoute = false;
      });
    });
  }
  public sideBar: SideBar[] = [
    {
      tittle: 'Tour',
      base: 'tour',
      route: routes.tourPage,
      showAsTab: false,
      separateRoute: false,
      twoTitle: false,
      menu: [],
      isSubMenu: false,
    },
    {
      tittle: 'Blog',
      base: 'blog',
      route: routes.blogPage,
      showAsTab: false,
      separateRoute: false,
      twoTitle: false,
      menu: [],
      isSubMenu: false,
    },
    {
      tittle: 'Contactenos',
      base: 'contactenos',
      route: routes.contactUs,
      showAsTab: false,
      separateRoute: false,
      twoTitle: false,
      menu: [],
      isSubMenu: false,
    },
    {
      tittle: 'Legal',
      base: 'legal',
      route: routes.legalPage,
      showAsTab: false,
      separateRoute: false,
      twoTitle: false,
      menu: [
        {
          menuValue: 'Legal',
          route: routes.legalPage,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'legal',
          page: '',
          last: '',
          subMenus: [],
          icon:'isax-legal-55',
        }
      ],
      isSubMenu: true,
    },
    {
      tittle: 'Proveedores',
      base: 'proveedores',
      route: routes.proveedoresPage,
      showAsTab: false,
      separateRoute: false,
      twoTitle: false,
      menu: [],
      isSubMenu: false,
    }
  ]
}
