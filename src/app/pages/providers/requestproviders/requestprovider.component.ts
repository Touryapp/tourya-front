import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HostListener } from '@angular/core';
import { routes } from "../../../shared/routes/routes";
import { Country } from '../../../shared/dto/country.dto';
import { Department } from '../../../shared/dto/department.dto';
import { City } from '../../../shared/dto/city.dto';
import { CountryService } from '../../../shared/services/country.service';
import { DepartmentService } from '../../../shared/services/department.service';
import { CityService } from '../../../shared/services/city.service';
import { RequestProvidersService } from './request-providers.service';
import { RequestProvider } from '../../../shared/dto/requestProvider-response.dto';
import { ProviderDocumentType } from '../../../shared/enums/provider-document-type.enum';
import { ProviderDocumentTypeDto } from '../../../shared/dto/provider-document-type.dt';
import { ProviderServiceType } from '../../../shared/enums/provider-document-type.enum';


@Component({
  selector: 'app-requestprovider',
  standalone: false,
  templateUrl: './requestprovider.component.html',
  styleUrl: './requestprovider.component.scss'
})
export class RequestproviderComponent implements OnInit {
  requestProviderForm!: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';
  countries: Country[] = [];
  departments: Department[] = [];
  cities: City[] = [];
  imageUrls: string[] = [];
  documentTypes: ProviderDocumentTypeDto[] = [
    // { id: ProviderDocumentType.DNI, description: 'Cédula de Ciudadanía' },
    { id: ProviderDocumentType.NIT, description: 'NIT' },
    { id: ProviderDocumentType.RNT, description: 'RNT' },
    // { id: ProviderDocumentType.PASSPORT, description: 'Pasaporte' },
  ];
  serviceTypes: ProviderServiceType[] = [
    ProviderServiceType.TOUR,
    ProviderServiceType.TRANSPORT,
    ProviderServiceType.MEALS_FOOD_BEVERAGE,
    ProviderServiceType.ACCOMMODATION_LODGING
  ];
  public routes = routes;

  tabs = [
    { id: "basic_info", label: "Basic Info" },
    { id: "gallery", label: "Documents" },
  ];

  activeTab: string = this.tabs[0].id;
  documentosFiles: File[] = [];
  agregarGaleria :{addedGalleries: any[], deletedGalleries: any[]} = {addedGalleries: [], deletedGalleries: []}
  dataRequestProvider: any = {};
  isExistingData = false;
  
  // Variables para los 3 tipos de documentos específicos
  documentFiles: { [key: number]: File | null } = {
    1: null, // NIT
    2: null, // RNT  
    3: null  // Other
  };
  
  // Variable para almacenar el ID del request provider
  requestProviderById: number | null = null;
  constructor(
    private fb: FormBuilder,
    private countryService: CountryService,
    private departmentService: DepartmentService,
    private cityService: CityService,
    private requestProviderService: RequestProvidersService
  ) {}

  ngOnInit(): void {
    this.consultaData();
    this.initializeForm();
    this.getCountries();
    
  }

  private initializeForm(): void {
    this.requestProviderForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      documentNumber: ['', [Validators.required, Validators.minLength(6)]],
      documentType: ['', [Validators.required]],
      serviceType: ['', [Validators.required]],
      country: ['', [Validators.required]],
      department: ['', [Validators.required]],
      address: ['', [Validators.required, Validators.minLength(10)]],
      phone: ['', [Validators.required, Validators.minLength(10)]],
      city: ['', [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.requestProviderForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      
      const formData = this.requestProviderForm.value;
      console.log('Form Data:', formData);
      const datasaveforprovider = {
        "name": formData.name,
        "documentNumber": formData.documentNumber,
        "documentType": formData.documentType,
        "serviceType": formData.serviceType,
        "countryId": formData.country,
        "stateId": formData.department,
        "cityId": formData.city,
        "department": formData.department,
        "address": formData.address,
        "phone": formData.phone
      }
      console.log('Data to save:', datasaveforprovider);
      // Simular envío de datos
      this.requestProviderService.saveRequestProvider(datasaveforprovider).subscribe({
        next: (data: RequestProvider) => {
          console.log('Data saved:', data);
          this.loading = false;
          this.successMessage = 'Provider request submitted successfully. We will contact you soon.';
          this.requestProviderForm.reset();
        },
        error: (err: any) => {
          console.error('Error saving data:', err);
          this.loading = false;
          this.errorMessage = 'Error saving data. Please try again.';
        }
      });
      // setTimeout(() => {
      //   this.loading = false;
      //   this.successMessage = 'Provider request submitted successfully. We will contact you soon.';
      //   this.requestProviderForm.reset();
      // }, 2000);
    } else {
      this.errorMessage = 'Please fill in all required fields correctly.';
    }
  }

  
  @HostListener("window:scroll", [])
  onScroll(): void {
    const scrollPosition = window.scrollY || document.documentElement.scrollTop;

    this.tabs.forEach((tab) => {
      const element = document.getElementById(tab.id);
      if (element) {
        const sectionTop = element.offsetTop - 100;
        const sectionBottom = sectionTop + element.offsetHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
          this.activeTab = tab.id;
        }
             }
     });
   }

   // Función para guardar todos los documentos cargados
   saveAllDocumentsToGallery(): void {
     if (!this.requestProviderById) {
       console.warn('No hay requestProviderById disponible');
       return;
     }

     // Recopilar todos los archivos cargados
     const documentosFiles: File[] = [];
     const addedGalleries: any[] = [];
     const documentNames = { 1: 'NIT', 2: 'RNT', 3: 'Other' };

     Object.keys(this.documentFiles).forEach(key => {
       const documentId = parseInt(key);
       const file = this.documentFiles[documentId];
       
       if (file) {
         documentosFiles.push(file);
         addedGalleries.push({
           documentTypeId: documentId,
           documentTypeName: documentNames[documentId as keyof typeof documentNames],
           fileName: file.name,
           fileSize: file.size,
           uploadedAt: new Date().toISOString()
         });
       }
     });

     if (documentosFiles.length === 0) {
       console.warn('No hay archivos para guardar');
       return;
     }

     console.log(`🚀 Enviando ${documentosFiles.length} documentos al servidor...`);

     this.requestProviderService.saveGallery(
       this.requestProviderById,
       documentosFiles,
       addedGalleries
     ).subscribe({
       next: (response: any) => {
         console.log('✅ Todos los documentos enviados exitosamente al servidor:', response);
         alert('¡Documentos enviados exitosamente al servidor!');
       },
       error: (error: any) => {
         console.error('❌ Error al enviar los documentos al servidor:', error);
         alert('Error al enviar los documentos al servidor. Por favor, inténtalo de nuevo.');
       }
     });
   }

  scrollTo(id: string): void {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });

      this.activeTab = id;

      setTimeout(() => {
        window.scrollTo(0, element.offsetTop - 75);
      }, 0);
    }
  }

  onCountryChange(value: any) {
    console.log('Country changed:', value);
    this.departments = [];
    this.cities = [];
    this.getDepartments(+value);
  }

  getCountries() {
    this.countryService.getCountries().subscribe({
      next: (data: any) => {
        if (data) {
          this.countries = data;
        } else {
          this.countries = [];
        }
      },
      error: (err: any) => {
        console.error("Error getting countries.");
        console.error(err);
        this.countries = [];
      },
    });
  }

  getDepartments(countryId: number) {
    this.departmentService.getDepartmentsByCountryId(countryId).subscribe({
      next: (data: any) => {
        if (data) {
          this.departments = data;
        } else {
          this.departments = [];
        }
      },
      error: (err: any) => {
        console.error("Error getting departments.");
        console.error(err);
        this.departments = [];
      },
    });
  }
  getCities(departmentId: number) {
    this.cityService.getCitiesByDepartmentId(departmentId).subscribe({
      next: (data) => {
        if (data) {
          this.cities = data;
        } else {
          this.cities = [];
        }
      },
      error: (err) => {
        console.error("Error getting cities.");
        console.error(err);
        this.cities = [];
      },
    });
  }
  onDepartmentChange(value: any) {
    this.cities = [];
    this.getCities(+value);
  }

  onFileSelected(event: any): void {
    const files: FileList = event.target.files;

    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files.item(i);
        if (file) {
          // Create a FileReader to read the file as Data URL
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.imageUrls.push(e.target.result);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  }
  onDeleteImage(index: number): void {
    this.imageUrls.splice(index, 1);
  }

  consultaData(){
    this.requestProviderService.consultData().subscribe({
              next: async (data: RequestProvider) => {
          if (data && data.id && data.provider) {
            this.isExistingData = true;
            // Guardar el ID del request provider para usar en saveGallery
            this.requestProviderById = data.id;
            
            // Cargar departamentos y ciudades antes de llenar el formulario
            await new Promise((resolve) => {
              this.getDepartments(data.provider.country.id);
              // Esperar un pequeño tiempo para que los departamentos se carguen
              setTimeout(resolve, 300);
            });
            await new Promise((resolve) => {
              this.getCities(data.provider.state.id);
              setTimeout(resolve, 300);
            });
            this.requestProviderForm.patchValue({
              name: data.provider.name,
              documentNumber: data.provider.documentNumber,
              documentType: data.provider.documentType,
              serviceType: data.provider.serviceType,
              country: data.provider.country.id,
              department: data.provider.state.id,
              city: data.provider.city.id,
              address: data.provider.address,
              phone: data.provider.phone
            });
            // Deshabilitar el formulario
            this.requestProviderForm.disable();
          }
        },
      error: (err: any) => {
        console.error('Error:', err);
      }
    });
  }

  // Función para activar el input file específico
  triggerFileInput(documentId: number): void {
    console.log(`🖱️ Haciendo clic en botón para documento ID: ${documentId}`);
    
    const inputElement = document.getElementById(`document-file-${documentId}`) as HTMLInputElement;
    
    if (inputElement) {
      console.log(`✅ Disparando click en input file para documento ${documentId}`);
      inputElement.click();
    } else {
      console.error(`❌ No se encontró el elemento input con ID: document-file-${documentId}`);
    }
  }

  // Función alternativa para debug - sin depender de disabled
  testFileInput(documentId: number): void {
    console.log(`🧪 TEST: Probando input para documento ${documentId}`);
    
    // Crear un input temporal para probar
    const tempInput = document.createElement('input');
    tempInput.type = 'file';
    tempInput.accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx';
    tempInput.style.display = 'none';
    
    tempInput.onchange = (event: any) => {
      console.log(`🎯 Archivo seleccionado en test:`, event.target.files[0]);
      this.onDocumentFileSelected(event, documentId);
      document.body.removeChild(tempInput);
    };
    
    document.body.appendChild(tempInput);
    tempInput.click();
  }

  // Función para manejar la selección de archivos
  onDocumentFileSelected(event: any, documentId: number): void {
    const file = event.target.files[0];
    if (file) {
      // Validar tamaño del archivo (máximo 10MB)
      const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSizeInBytes) {
        alert('El archivo es demasiado grande. El tamaño máximo permitido es 10MB.');
        event.target.value = '';
        return;
      }

      // Validar tipo de archivo
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        alert('Tipo de archivo no permitido. Solo se aceptan: PDF, JPG, JPEG, PNG, DOC, DOCX');
        event.target.value = '';
        return;
      }

      // Guardar el archivo temporalmente (solo localmente)
      this.documentFiles[documentId] = file;
      
      // Obtener el nombre del documento según el ID
      const documentNames = { 1: 'NIT', 2: 'RNT', 3: 'Other' };
      console.log(`📎 Archivo cargado localmente para ${documentNames[documentId as keyof typeof documentNames]}:`, {
        fileName: file.name,
        fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        fileType: file.type
      });

      // NO llamar a saveGallery automáticamente - solo guardar localmente
      console.log(`💾 Archivo ${documentNames[documentId as keyof typeof documentNames]} guardado localmente. Usa "Guardar todos los documentos" para enviarlo al servidor.`);
    }
  }

  // Función para eliminar un archivo
  removeDocumentFile(documentId: number): void {
    this.documentFiles[documentId] = null;
    const inputElement = document.getElementById(`document-file-${documentId}`) as HTMLInputElement;
    if (inputElement) {
      inputElement.value = '';
    }
    
    const documentNames = { 1: 'NIT', 2: 'RNT', 3: 'Other' };
    console.log(`🗑️ Archivo eliminado para ${documentNames[documentId as keyof typeof documentNames]}`);
  }

  // Función para guardar un documento específico usando saveGallery
  saveDocumentToGallery(documentId: number, file: File): void {
    if (!this.requestProviderById) {
      console.warn('No hay requestProviderById disponible para guardar el documento');
      return;
    }

    // Preparar los archivos para enviar
    const documentosFiles: File[] = [file];
    
    // Preparar los metadatos según la estructura esperada
    const documentNames = { 1: 'NIT', 2: 'RNT', 3: 'Other' };
    const addedGalleries = [{
      documentTypeId: documentId,
      documentTypeName: documentNames[documentId as keyof typeof documentNames],
      fileName: file.name,
      fileSize: file.size,
      uploadedAt: new Date().toISOString()
    }];

    console.log(`🚀 Guardando ${documentNames[documentId as keyof typeof documentNames]} en el servidor...`);

    // Llamar al servicio saveGallery
    this.requestProviderService.saveGallery(
      this.requestProviderById, 
      documentosFiles, 
      addedGalleries
    ).subscribe({
      next: (response: any) => {
        console.log(`✅ ${documentNames[documentId as keyof typeof documentNames]} guardado exitosamente:`, response);
        // Aquí puedes agregar notificación de éxito al usuario
        // Por ejemplo: this.showSuccessMessage(`${documentNames[documentId]} cargado correctamente`);
      },
      error: (error: any) => {
        console.error(`❌ Error al guardar ${documentNames[documentId as keyof typeof documentNames]}:`, error);
        // Revertir el archivo en caso de error
        this.documentFiles[documentId] = null;
        const inputElement = document.getElementById(`document-file-${documentId}`) as HTMLInputElement;
        if (inputElement) {
          inputElement.value = '';
        }
        // Mostrar mensaje de error al usuario
        alert(`Error al guardar el archivo ${documentNames[documentId as keyof typeof documentNames]}. Por favor, inténtalo de nuevo.`);
      }
    });
  }

  
} 

