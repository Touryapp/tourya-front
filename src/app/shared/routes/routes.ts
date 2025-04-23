export class routes {
    private static Url = '';

  public static get baseUrl(): string {
    return this.Url;
  }


  //ui-interface routes


//auth routes
public static get login(): string {
  return this.baseUrl + '/login';
}
public static get register(): string {
  return this.baseUrl + '/register';
}
public static get forgotPassword(): string {
  return this.baseUrl + '/forgot-password';
}
public static get changePassword(): string {
  return this.baseUrl + '/change-password';
}
// error 
public static get error404(): string {
  return this.baseUrl + '/error-404';
}
public static get error500(): string {
  return this.baseUrl + '/error-500';
}
public static get underMaintenance(): string {
  return this.baseUrl + '/under-maintenance';
}
public static get comingSoon(): string {
  return this.baseUrl + '/coming-soon';
}


public static get home(): string {
  return this.baseUrl + '/index';
}
public static get home2(): string {
  return this.baseUrl + '/index-2';
}
public static get home3(): string {
  return this.baseUrl + '/index-3';
}
public static get home4(): string {
  return this.baseUrl + '/index-4';
}
public static get home5(): string {
  return this.baseUrl + '/index-5';
}
public static get home6(): string {
  return this.baseUrl + '/index-6';
}

public static get hotel(): string {
  return this.baseUrl + '/hotel';
}
public static get hotelList(): string {
  return this.hotel + '/hotel-list';
}
public static get hotelMap(): string {
  return this.hotel + '/hotel-map';
}
public static get hotelGrid(): string {
  return this.hotel + '/hotel-grid';
}
public static get hotelDetails(): string {
  return this.hotel + '/hotel-details';
}
public static get hotelBooking(): string {
  return this.hotel + '/hotel-booking';
}
public static get addHotel(): string {
  return this.hotel + '/add-hotel';
}
public static get editHotel(): string {
  return this.hotel + '/edit-hotel';
}
public static get bookingConfirmation(): string {
  return this.hotel + '/booking-confirmation';
}
public static get car(): string {
  return this.baseUrl + '/car';
}
public static get carGrid(): string {
  return this.car + '/car-grid';
}
public static get carList(): string {
  return this.car + '/car-list';
}
public static get carMap(): string {
  return this.car + '/car-map';
}
public static get carDetails(): string {
  return this.car + '/car-details';
}
public static get carBooking(): string {
  return this.car + '/car-booking';
}
public static get carBookingConfirmation(): string {
  return this.car + '/car-booking-confirmation';
}
public static get addCar(): string {
  return this.car + '/add-car';
}
public static get editCar(): string {
  return this.car + '/edit-car';
}
public static get flight(): string {
  return this.baseUrl + '/flight';
}
public static get flightGrid(): string {
  return this.flight + '/flight-grid';
}
public static get flightList(): string {
  return this.flight + '/flight-list';
}
public static get flightDetails(): string {
  return this.flight + '/flight-details';
}
public static get flightBookingConfirmation(): string {
  return this.flight + '/flight-booking-confirmation';
}
public static get addFlight(): string {
  return this.flight + '/add-flight';
}
public static get editFlight(): string {
  return this.flight + '/edit-flight';
}
public static get cruise(): string {
  return this.baseUrl + '/cruise';
}
public static get cruiseGrid(): string {
  return this.cruise + '/cruise-grid';
}
public static get cruiseList(): string {
  return this.cruise + '/cruise-list';
}
public static get cruiseMap(): string {
  return this.cruise + '/cruise-map';
}
public static get cruiseDetails(): string {
  return this.cruise + '/cruise-details';
}
public static get addCruise(): string {
  return this.cruise + '/add-cruise';
}
public static get editCruise(): string {
  return this.cruise + '/edit-cruise';
}
public static get CruiseBooking(): string {
  return this.cruise + '/cruise-booking';
}
public static get cruiseBookingConfirmation(): string {
  return this.cruise + '/cruise-booking-confirmation';
}
public static get tour(): string {
  return this.baseUrl + '/tour';
}
public static get tourGrid(): string {
  return this.tour + '/tour-grid';
}
public static get tourMap(): string {
  return this.tour + '/tour-map';
}
public static get tourList(): string {
  return this.tour + '/tour-list';
}
public static get tourDetails(): string {
  return this.tour + '/tour-details';
}
public static get addTour(): string {
  return this.tour + '/add-tour';
}
public static get editTour(): string {
  return this.tour + '/edit-tour';
}
public static get tourBookingConfirmation(): string {
  return this.tour + '/tour-booking-confirmation';
}

// page routes


public static get index(): string {
  return  this.baseUrl + '/index';
}

//pages

public static get pages(): string {
  return  this.baseUrl + '/pages';
}
public static get aboutUs(): string {
  return  this.pages + '/about-us';
}
public static get gallery(): string {
  return  this.pages + '/gallery';
}
public static get testimonial(): string {
  return  this.pages + '/testimonial';
}
public static get faq(): string {
  return  this.pages + '/faq';
}
public static get pricingPlan(): string {
  return  this.pages + '/pricing-plan';
}
public static get team(): string {
  return  this.pages + '/team';
}
public static get invoices(): string {
  return  this.pages + '/invoices';
}
public static get blogGrid(): string {
  return  this.pages + '/blog-grid';
}
public static get blogList(): string {
  return  this.pages + '/blog-list';
}
public static get blogDetails(): string {
  return  this.pages + '/blog-details';
}
public static get contactUs(): string {
  return  this.pages + '/contact-us';
}
public static get destination(): string {
  return  this.pages + '/destination';
}
public static get termsConditions(): string {
  return  this.pages + '/terms-conditions';
}
public static get privacyPolicy(): string {
  return  this.pages + '/privacy-policy';
}
public static get becomeAnExpert(): string {
  return  this.pages + '/become-an-expert';
}
public static get indexRTL(): string {
  return  this.pages + '/index-rtl';
}
//user and admin
public static get user(): string {
  return this.baseUrl + '/user';
}
public static get userDashboard(): string {
  return this.user + '/dashboard';
}
public static get customerFlightBooking(): string {
  return this.user + '/customer-flight-booking';
}
public static get customerHotelBooking(): string {
  return this.user + '/customer-hotel-booking';
}
public static get customerCarBooking(): string {
  return this.user + '/customer-car-booking';
}
public static get customerCruiseBooking(): string {
  return this.user + '/customer-cruise-booking';
}
public static get customerTourBooking(): string {
  return this.user + '/customer-tour-booking';
}
public static get review(): string {
  return this.user + '/review';
}
public static get chat(): string {
  return this.user + '/chat';
}
public static get wishlist(): string {
  return this.user + '/wishlist';
}
public static get wallet(): string {
  return this.user + '/wallet';
}
public static get payment(): string {
  return this.user + '/payment';
}
public static get myProfile(): string {
  return this.user + '/my-profile';
}
public static get notification(): string {
  return this.user + '/notification';
}
public static get profileSettings(): string {
  return this.user + '/profile-settings';
}
public static get securitySettings(): string {
  return this.user + '/security-settings';
}
public static get notificationSettings(): string {
  return this.user + '/notification-settings';
}
public static get integrationSettings(): string {
  return this.user + '/integration-settings';
}
//Agent
public static get agent(): string {
  return this.baseUrl + '/agent';
}
public static get agentDashboard(): string {
  return this.agent + '/agent-dashboard';
}
public static get agentListings(): string {
  return this.agent + '/listings';
}
public static get agentHotelBooking(): string {
  return this.agent + '/hotel-booking';
}
public static get agentCarBooking(): string {
  return this.agent + '/car-booking';
}
public static get agentCruiseBooking(): string {
  return this.agent + '/cruise-booking';
}
public static get agentTourBooking(): string {
  return this.agent + '/tour-booking';
}
public static get agentFlightBooking(): string {
  return this.agent + '/flight-booking';
}
public static get agentEnquirers(): string {
  return this.agent + '/enquirers';
}
public static get agentEnquirersDetails(): string {
  return this.agent + '/enquiry-details';
}
public static get agentEarnings(): string {
  return this.agent + '/earnings';
}
public static get agentReview(): string {
  return this.agent + '/reviews';
}
public static get agentSettings(): string {
  return this.agent + '/settings';
}
public static get agentAccountSettings(): string {
  return this.agent + '/account-settings';
}
public static get agentSecuritySettings(): string {
  return this.agent + '/security-settings';
}
public static get agentPlansSettings(): string {
  return this.agent + '/plans-settings';
}
public static get agentPlans(): string {
  return this.agent + '/plans-billings';
}
public static get agentNotification(): string {
  return this.agent + '/agent-notification';
}
public static get agentChat(): string {
  return this.agent + '/agent-chat';
}
}


