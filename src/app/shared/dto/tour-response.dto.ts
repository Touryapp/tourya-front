export interface Tour {
  id: number;
  name: string;
  description: string;
  duration: string;
  maxPeople: number;
  highlight: boolean;
  tourCategory: TourCategory;
  provider: Provider;
}

interface TourCategory {
  id: number;
  name: string;
  description: string;
}

interface Provider {
  id: number;
  nombre: string;
  numeroDocumento: string;
  tipoDocumento: string;
  tipoServicio: string;
  pais: string;
  departamento: string;
  ciudad: string;
  direccion: string;
  telefono: string;
  status: string;
}
