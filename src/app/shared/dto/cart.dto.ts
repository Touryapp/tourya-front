export interface CartItem {
  id: string; // UUID único para el item
  dayDate: string; // Fecha del día seleccionado (YYYY-MM-DD) - fecha inicio
  startDate?: string; // Fecha de inicio del tour (YYYY-MM-DD)
  endDate?: string; // Fecha de fin del tour (YYYY-MM-DD) - para tours multi-día
  tour: {
    id: number;
    name: string;
    description: string;
    duration: string;
    rating: number;
  };
  schedule: {
    id: number;
    scheduleDate: string;
    startTime: string;
    endTime: string;
  };
  selectedSlot: {
    slotId: number;
    startTime: string;
    endTime: string;
    minCapacity?: number;
    maxCapacity: number;
  };
  participants: {
    ageType: string; // ADULT, CHILD, INFANT, SENIOR
    quantity: number;
    price: number;
  }[];
  totalPrice: number;
  totalParticipants: number;
  address: {
    city: string;
    state: string;
    country: string;
    address: string;
  };
  gallery: {
    imageUrl: string;
    description: string;
    order: number;
  }[];
}

export interface DaySelection {
  date: string; // YYYY-MM-DD
  dayName: string; // Lunes, Martes, etc.
  dayNumber: number; // 1, 2, 3, etc.
  isSelected: boolean;
  tourSelected?: CartItem;
  availableTours: number; // Cantidad de tours disponibles para ese día
}

export interface ParticipantSelection {
  ageType: string;
  label: string;
  minAge: number;
  maxAge: number;
  price: number;
  quantity: number;
  maxQuantity: number;
}

export interface SlotWithPrices {
  slotId: number;
  startTime: string;
  endTime: string;
  minCapacity?: number;
  maxCapacity: number;
  availableCapacity: number; // maxCapacity - currentBookings
  prices?: {
    ageType: string;
    minAge: number;
    maxAge: number;
    price: number;
  }[];
}

export interface CartSummary {
  totalItems: number;
  totalDays: number;
  totalParticipants: number;
  totalPrice: number;
  startDate: string;
  endDate: string;
  items: CartItem[];
}
