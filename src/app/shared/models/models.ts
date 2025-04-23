  export interface pageSelection {
  skip: number;
  limit: number;
}
export interface apiResultFormat {
  data: [];
  totalData: number;
}

export interface url {
  url: string;
}

export interface apiResultFormat {
  data: [];
  totalData: number;
}


export interface url {
  url: string;
}


export class passwordResponce {
  passwordResponceText?: string;
  passwordResponceImage?: string;
  passwordResponceKey?: string;
}


export interface Star {
  show?: boolean;
  half?: boolean;
}
export interface SideBarMenu {
  showMyTab?: boolean;
  menuValue?: string;
  menuValue2?:string;
  route?: string;
  hasSubRoute?: boolean;
  showSubRoute: boolean;
  homeName?:string;
  secondData?:boolean;
  icon: string;
  base?: string;
  base2?:string;
  base3?:string;
  base4?:string;
  base5?:string;
  base7?:string;
  base8?:string;
  base9?:string;
  base10?:string;
  last1?: string;
  last?: string;
  page?: string;
  last2?: string;
  count?:string;
  materialicons?: string;
  subMenus: SubMenu[];
  dot?: boolean;
  changeLogVersion?: boolean;
  hasSubRouteTwo?: boolean;
  page1?: string;
  img?: string;
}
export interface breadCrumbItems {
  label: string;
  active?: boolean;
}
export interface SubMenu {
  menuValue: string;
  route?: string;
  base?: string;
  page?: string;
  page1?: string;
  page2?: string;
  base2?: string;
  base3?: string;
  base4?: string;
  base5?: string;
  base6?: string;
  base7?: string;
  base8?: string;
  last?:string;
  dot?:boolean;
  currentActive?: boolean;
  hasSubRoute?: boolean;
  showSubRoute?: boolean;
  customSubmenuTwo?: boolean;
  subMenusTwo?: SubMenu[];
}

export interface SideBar {
  tittle: string;
  subTitle?:string;
  subTitle2?:string;
  base?: string;
  base1?: string;
  base2?: string;
  base3?: string;
  base4?: string;
  base5?: string;
  base6?: string;
  showAsTab: boolean,
  separateRoute: boolean,
  route?: string;
  img?:string;
  twoTitle?:boolean;
  menu: SideBarMenu[];

}
export interface SideBar2 {
  tittle: string;
  subTitle?:string;
  subTitle2?:string;
  base?: string;
  base1?: string;
  base2?: string;
  base3?: string;
  base4?: string;
  base5?: string;
  base6?: string;
  showAsTab: boolean,
  separateRoute: boolean,
  route?: string;
  img?:string;
  twoTitle?:boolean;
  menu: SideBarMenu[];

}
export interface SubMenuTwo {
  menuValue: string;
  route: string;
  base?: string;
  base1?: string;
  base2?: string;
  base3?: string;
  hasSubRoute?: boolean;
  showSubRoute?: boolean;
}

export interface SubMenu2 {
  menuValue: string;
  route?: string;
  base?: string;
  base1?: string;
  base2?: string;
  base3?: string;
  hasSubRoute?: boolean;
  showSubRoute?: boolean;
  customSubmenuTwo?: boolean;
  subMenusTwo?: SubMenuTwo[];
}
export interface Menu {
  menuValue: string;
  hasSubRouteTwo?: boolean;
  showSubRoute?: boolean;
  hasSubRoute?: boolean;
  icon?: string;
  base?: string;
  base1?: string;
  base2?: string;
  base3?: string;
  base4?: string;
  base5?: string;
  base6?: string;
  base7?: string;
  base8?: string;
  base9?: string;
  base10?: string;
  subMenus?: SubMenu2[];
  customSubmenuTwo?: boolean;
  subMenusTwo?: SubMenuTwo[];
}
export interface MainMenu {
  title: string;
  showAsTab: boolean;
  separateRoute: boolean;
  menu: Menu[];
}

export interface FlightDetails {
  isSelected?: boolean;
  sNo?: number;
  Img:string;
  ID: string;
  FlightName: string;
  Flight: string;
  Ticket: string;
  Passanger: string;
  Travel: string;
  Price: string;
  Date: string;
  Status: string;
}
export interface Enquiry {
  isSelected?: boolean;
  sNo?: number;
  type: string;
  enquiryFor: string;
  name: string;
  status: string;
  inquiredOn: string;
}
export interface withdraw {
  isSelected?: boolean;
  sNo?: number;
  ID: string;
  Date: string;
  Amount: string;
  Status: string;
}
export interface earnings {
  isSelected?: boolean;
  sNo?: number;
  ID: string;
  InvoiceFor: string;
  Service: string;
  PaymentType: string;
  Date: string;
  Amount: string;
  Status: string;
}

export interface HotelDetails {
  isSelected?: boolean;
  sNo?: number;
  id: string; 
  img:string;
  hotel: string; 
  room: string; 
  guest: string; 
  days: string; 
  location:string;
  pricing: string; 
  bookedOn: string; 
  status: string; 
}
export interface CarDetails {
  isSelected?: boolean;
  sNo?: number;
  img:string;
  id: string;
  carName: string;
  carType: string;
  travellers: string;
  days: string;
  price: string;
  date: string;
  status: string;
}

export interface CruiseDetails {
  isSelected?: boolean;
  sNo?: number;
  img:string;
  id: string;
  cruiseName: string;
  destination: string;
  cabinType: string;
  guestDetails: string;
  duration: string;
  price: string;
  date: string;
  status: string;
}

export interface TourDetails {
  isSelected?: boolean;
  sNo?: number;
  img:string;
  id: string;
  tourName: string;
  tourType: string;
  travellers: string;
  duration: string;
  price: string;
  date: string;
  status: string;
}

export interface wallet {
  isSelected?: boolean;
  sNo?: number;
  paymentType: string;
  creditOrDebit: string;
  date: string;
  amount: string;
  balance: string;
  status: string;
}

export interface PaymentDetails {
  isSelected?: boolean;
  sNo?: number;
  id: string;
  payment: string;
  service: string;
  paymentType: string;
  date: string;
  amount: string;
  status: string;
}

export interface BookingDetails {
  isSelected?: boolean;
  sNo?: number;
  id: string;
  hotelName: string;
  hotelLocation: string;
  room: string;
  guest: string;
  days: string;
  pricing: string;
  bookedOn: string;
  status: string
}

export interface AgentHotelBooking {
  isSelected?: boolean;
  sNo?: number;
  id: string;
  hotelName: string;
  hotelLocation: string;
  bookedBy: string;
  room: string;
  guest: string;
  days: string;
  pricing: string;
  bookedOn: string;
  status: string;
}

export interface AgentFlightBooking {
  isSelected?: boolean;
  sNo?: number;
  id: string;
  flightName: string;
  airline: string;
  bookedBy: string;
  class: string;
  passengers: string;
  from: string;
  to: string;
  pricing: string;
  location:string;
  bookedOn: string;
  status: string
}

export interface AgentCarBooking {
  isSelected?: boolean;
  sNo?: number;
  id: string;
  carName: string;
  carType: string;
  bookedBy: string;
  travellers: string;
  days: string;
  price: string;
  bookedOn: string;
  status: string;
  location:string;
}

export interface AgentCruiseBooking {
  isSelected?: boolean;
  sNo?: number;
  id: string;
  cruiseName: string;
  cruiseLocation: string;
  bookedBy: string;
  location: string;
  cabinType: string;
  guests: string;
  duration: string;
  price: string;
  bookedOn: string;
  status: string;
}

export interface AgentTourBooking {
  isSelected?: boolean;
  sNo?: number;
  id: string;
  tourName: string;
  tourType: string;
  bookedBy: string;
  location: string;
  travellers: string;
  duration: string;
  price: string;
  bookedOn: string;
  status: string;
}

export interface url {
  url: string;
}


export interface listingDetails {
  img: string;
}
