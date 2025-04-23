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
      tittle: 'Home',
      base: 'index',
      base1: 'index-2',
      base2: 'index-3',
      base3: 'index-4',
      base4: 'index-5',
      base5: 'index-6',
      showAsTab: false,
      separateRoute: true,
      menu: [
        {
          menuValue: 'Home - 1',
          img: 'assets/img/menu/home-01.jpg',
          homeName:'All Bookings',
          route: routes.home,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'index',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue: 'Home - 2',
          img: 'assets/img/menu/home-02.jpg',
          route: routes.home2,
          homeName:'Hotels',
          hasSubRoute: false,
          showSubRoute: false,
          base: 'index-2',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue: 'Home - 3',
          img: 'assets/img/menu/home-03.jpg',
          route: routes.home3,
          homeName:'Cars',
          hasSubRoute: false,
          showSubRoute: false,
          base: 'index-3',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue: 'Home - 4',
          img: 'assets/img/menu/home-04.jpg',
          route: routes.home4,
          homeName:'Flight',
          hasSubRoute: false,
          showSubRoute: false,
          base: 'index-4',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue: 'Home - 5',
          img: 'assets/img/menu/home-05.jpg',
          route: routes.home5,
          homeName:'Cruise',
          hasSubRoute: false,
          showSubRoute: false,
          base: 'index-5',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue: 'Home - 6',
          img: 'assets/img/menu/home-06.jpg',
          route: routes.home6,
          homeName:'Tours',
          hasSubRoute: false,
          showSubRoute: false,
          base: 'index-6',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
      ],
    },
    {
      tittle: 'Flight',
      base: 'flight',
      subTitle:'Flight Booking',
      showAsTab: false,
      separateRoute: false,
      twoTitle:false,
      img: 'assets/img/menu/flight.jpg',
      menu: [
        {
          menuValue: 'Flight Grid',
          route: routes.flightGrid,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'flight-grid',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue: 'Flight List',
          route: routes.flightList,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'flight-list',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue: 'Flight Details',
          route: routes.flightDetails,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'flight-details',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue: 'Flight Booking',
          route: routes.flightBookingConfirmation,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'flight-booking-confirmation',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue: 'Add Flight',
          route: routes.addFlight,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'add-flight',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
      ],
    },
    {
      tittle: 'Hotel',
      base: 'hotel',
      subTitle:'Hotel Booking',
      showAsTab: false,
      separateRoute: false,
      twoTitle:false,
      img: 'assets/img/menu/hotel.jpg',
      menu: [
        {
          menuValue: 'Hotel Grid',
          route: routes.hotelGrid,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'hotel-grid',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue: 'Hotel List',
          route: routes.hotelList,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'hotel-list',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue: 'Hotel Map',
          route: routes.hotelMap,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'hotel-map',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue: 'Hotel Details',
          route: routes.hotelDetails,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'hotel-details',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue: 'Hotel Booking',
          route: routes.bookingConfirmation,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'hotel-bookings',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue: 'Add Hotel',
          route: routes.addHotel,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'add-hotel',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
      ],
    },
    {
      tittle: 'Car',
      base: 'car',
      subTitle:'Car Booking',
      showAsTab: false,
      separateRoute: false,
      twoTitle:false,
      img: 'assets/img/menu/car.jpg',
      menu: [
        {
          menuValue: 'Car Grid',
          route: routes.carGrid,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'car-grid',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue: 'Car List',
          route: routes.carList,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'car-list',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue: 'Car Map',
          route: routes.carMap,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'car-map',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue: 'Car Details',
          route: routes.carDetails,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'car-details',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue: 'Car Booking',
          route: routes.carBookingConfirmation,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'car-bookings',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue: 'Add Car',
          route: routes.addCar,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'add-car',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
      ],
    },
    {
      tittle: 'Cruise',
      base: 'cruise',
      subTitle:'Cruise Booking',
      showAsTab: false,
      separateRoute: false,
      twoTitle:false,
      img: 'assets/img/menu/cruise.jpg',
      menu: [
        {
          menuValue: 'Cruise Grid',
          route: routes.cruiseGrid,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'cruise-grid',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue: 'Cruise List',
          route: routes.cruiseList,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'cruise-list',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue: 'Cruise Map',
          route: routes.cruiseMap,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'cruise-map',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue: 'Cruise Details',
          route: routes.cruiseDetails,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'cruise-details',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue: 'Cruise Booking',
          route: routes.cruiseBookingConfirmation,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'cruise-bookings',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue: 'Add Cruise',
          route: routes.addCruise,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'add-cruise',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
      ],
    },
    {
      tittle: 'Tour',
      base: 'tour',
      subTitle:'Tour Booking',
      showAsTab: false,
      separateRoute: false,
      twoTitle:false,
      img: 'assets/img/menu/tour.jpg',
      menu: [
        {
          menuValue: 'Tour Grid',
          route: routes.tourGrid,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'tour-grid',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue: 'Tour List',
          route: routes.tourList,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'tour-list',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue: 'Tour Map',
          route: routes.tourMap,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'tour-map',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue: 'Tour Details',
          route: routes.tourDetails,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'tour-details',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue: 'Tour Booking',
          route: routes.tourBookingConfirmation,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'tour-bookings',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue: 'Add Tour',
          route: routes.addTour,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'add-tour',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
      ],
    },
    {
      tittle: 'Pages',
      base: 'pages',
      subTitle:'Pages',
      subTitle2:' ',
      showAsTab: false,
      separateRoute: false,
      twoTitle:true,
      img: 'assets/img/menu/flight.jpg',
      menu: [
        {
          menuValue: 'About',
          route: routes.aboutUs,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'about-us',
          page: '',
          last: '',
          subMenus: [],
          icon:''
          },
        {
          menuValue: 'Gallery',
          route: routes.gallery,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'gallery',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue: 'Testimonials',
          route: routes.testimonial,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'testimonial',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue: 'Faq',
          route: routes.faq,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'faq',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue: 'Pricing Plan',
          route: routes.pricingPlan,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'pricing-plan',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue: 'Teams',
          route: routes.team,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'team',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue: 'Invoice',
          route: routes.invoices,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'invoices',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue: 'Blogs Grid',
          route: routes.blogGrid,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'blog-grid',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue: 'Blogs List',
          route: routes.blogList,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'blog-list',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue: 'Blogs Details',
          route: routes.blogDetails,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'blog-details',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue: 'Contact Us',
          route: routes.contactUs,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'contact-us',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue: 'Booking Confirmation',
          route: routes.bookingConfirmation,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'booking-confirmation',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue2: 'Destination',
          route: routes.destination,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'destination',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue2: 'Terms & Conditions',
          route: routes.termsConditions,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'Terms-Conditions',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue2: 'Privacy Policy',
          route: routes.privacyPolicy,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'privacy-policy',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue2: 'Login',
          route: routes.login,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'login',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue2: 'Register',
          route: routes.register,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'register',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue2: 'Forgot Password',
          route: routes.forgotPassword,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'forgot-password',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue2: 'Change Password',
          route: routes.changePassword,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'change-password',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue2: '404 Error',
          route: routes.error404,
          hasSubRoute: false,
          showSubRoute: false,
          base: '404-error',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue2: '500 Error',
          route: routes.error500,
          hasSubRoute: false,
          showSubRoute: false,
          base: '500-error',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue2: 'Under Maintenance',
          route: routes.underMaintenance,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'under-maintenance',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue2: 'Coming Soon',
          route: routes.comingSoon,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'coming-soon',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue2: 'RTL',
          route: routes.indexRTL,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'index-rtl',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
      ],
    },
    {
      tittle: 'Dashboard',
      base: 'dashboard',
      subTitle:'User Dashboard',
      subTitle2:'Agent Dashboard',
      base1:'user',
      base2:'agent',
      showAsTab: false,
      separateRoute: false,
      twoTitle:true,
      img: 'assets/img/menu/flight.jpg',
      menu: [
        {
          menuValue: 'Dashboard',
          route: routes.userDashboard,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'dashboard',
          page: '',
          last: '',
          subMenus: [],
          icon:''
          },
        {
          menuValue: 'My Bookings',
          route: routes.customerFlightBooking,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'my-bookings',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue: 'Reviews',
          route: routes.review,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'reviews',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue: 'Message',
          route: routes.chat,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'message',
          page: '',
          last: '',
          subMenus: [],
          icon:''
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
          icon:''
        },
        {
          menuValue: 'Wallet',
          route: routes.wallet,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'wallet',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue: 'Payments',
          route: routes.payment,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'payments',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue: 'Profile Settings',
          route: routes.profileSettings,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'profile-settings',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue: 'Notifications',
          route: routes.notification,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'notifications',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue: 'My Profile',
          route: routes.myProfile,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'my-profile',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue: 'Settings',
          route: routes.securitySettings,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'settings',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue2: 'Dashboard',
          route: routes.agentDashboard,
          hasSubRoute: false,
          showSubRoute: false,  
          base: 'admin-dashboard',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue2: 'Listings',
          route: routes.agentListings,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'listings',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue2: 'Bookings',
          route: routes.agentHotelBooking,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'bookings',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue2: 'Enquiries',
          route: routes.agentEnquirers,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'enquiries',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue2: 'Earnings',
          route: routes.agentEarnings,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'earnings',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue2: 'Reviews',
          route: routes.agentReview,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'reviews',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
        {
          menuValue2: 'Settings',
          route: routes.agentSettings,
          hasSubRoute: false,
          showSubRoute: false,
          base: 'settings',
          page: '',
          last: '',
          subMenus: [],
          icon:''
        },
      ],
    },
  

  ];
  public getSideBarData: BehaviorSubject<Array<SideBar>> = new BehaviorSubject<
  Array<SideBar>
  >(this.sideBar);


}
