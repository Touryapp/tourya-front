import { Component, OnInit, Input } from '@angular/core';
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
import { RequestProvider, RequestProviderGallery } from '../../../shared/dto/requestProvider-response.dto';
import { ProviderDocumentType } from '../../../shared/enums/provider-document-type.enum';
import { ProviderDocumentTypeDto } from '../../../shared/dto/provider-document-type.dt';
import { ProviderServiceType } from '../../../shared/enums/provider-document-type.enum';
import { RequestProviderDocumentType } from '../../../shared/dto/RequestProviderDocumentTypeList.dto';
import { AuthService } from '../../../core/services/auth.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';


@Component({
  selector: 'app-requestprovider',
  standalone: false,
  templateUrl: './requestprovider.component.html',
  styleUrl: './requestprovider.component.scss'
})
export class RequestproviderComponent implements OnInit {
  @Input() isEmbedded: boolean = false;
  requestProviderForm!: FormGroup;
  loading = false;
  isLoadingData = true;
  successMessage = '';
  errorMessage = '';
  countries: Country[] = [];
  departments: Department[] = [];
  cities: City[] = [];
  imageUrls: string[] = [];
  documentTypes: ProviderDocumentTypeDto[] = [
    { id: ProviderDocumentType.NIT, description: 'Nit' },
    { id: ProviderDocumentType.CC, description: 'Cédula de ciudadanía' },
  ];
  serviceTypes: ProviderServiceType[] = [
    ProviderServiceType.TOUR,
    ProviderServiceType.TRANSPORT,
    ProviderServiceType.MEALS_FOOD_BEVERAGE,
    ProviderServiceType.ACCOMMODATION_LODGING
  ];
  
  // Lista dinámica de tipos de documentos para request provider
  requestProviderDocumentTypes: RequestProviderDocumentType[] = [];
  public routes = routes;

  tabs = [
    { id: "basic_info", label: "Basic Info" },
    { id: "gallery", label: "Documents" },
  ];

  activeTab: string = this.tabs[0].id;
  documentosFiles: File[] = [];
  agregarGaleria: {addedGalleries: any[], deletedGalleries: any[]} = {addedGalleries: [], deletedGalleries: []}
  dataRequestProvider: any = {};
  isExistingData = false;
  
  // Variables para los archivos dinámicos basados en tipos de documentos
  documentFiles: { [key: number]: File | null } = {};
  
  // Variables para manejar archivos existentes
  existingFiles: { [key: number]: any } = {}; // Archivos ya cargados en el servidor
  
  // Variable para almacenar el ID del request provider
  requestProviderById: number | null = null;
  
  // Variable para controlar si se puede cambiar a Submitted
  canChangeToSubmitted: boolean = false;
  
  constructor(
    private fb: FormBuilder,
    private countryService: CountryService,
    private departmentService: DepartmentService,
    private cityService: CityService,
    private requestProviderService: RequestProvidersService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadInitialData();
  }

  async loadInitialData() {
    this.isLoadingData = true;
    try {
      // Cargar países y tipos de documentos en paralelo
      await Promise.all([
        this.loadCountriesPromise(),
        this.loadDocTypesPromise()
      ]);
      // Cargar datos del proveedor (esto anida la carga de departamentos y ciudades si hay datos existentes)
      await this.loadConsultDataPromise();
    } catch (error) {
      console.error('Error al cargar datos iniciales del proveedor:', error);
    } finally {
      this.isLoadingData = false;
    }
  }

  loadCountriesPromise(): Promise<void> {
    return new Promise((resolve) => {
      this.countryService.getCountries().subscribe({
        next: (data: any) => {
          if (data) {
            this.countries = data;
          } else {
            this.countries = [];
          }
          resolve();
        },
        error: (err: any) => {
          console.error("Error getting countries:", err);
          this.countries = [];
          resolve();
        }
      });
    });
  }

  private processDocumentTypes(data: RequestProviderDocumentType[]): void {
    const mandatoryDocumentNames = [
      'camara de comercio',
      'rut',
      'rnt',
      'cedula del representante legal',
      'seguros de operacion',
      'contrato de mandato (firmado)',
      'contrato de vinculacion (firmado)'
    ];

    const normalizeString = (str: string) => {
      return str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : '';
    };

    data.forEach(doc => {
      const docNameNormalized = normalizeString(doc.name);
      doc.mandatory = mandatoryDocumentNames.includes(docNameNormalized);
    });

    this.requestProviderDocumentTypes = data;
    this.documentFiles = {};
    data.forEach(docType => {
      this.documentFiles[docType.id] = null;
    });
  }

  loadDocTypesPromise(): Promise<void> {
    return new Promise((resolve) => {
      this.requestProviderService.typeDocuments().subscribe({
        next: (data: RequestProviderDocumentType[]) => {
          this.processDocumentTypes(data);
          resolve();
        },
        error: (err: any) => {
          console.error('Error al cargar tipos de documentos:', err);
          resolve();
        }
      });
    });
  }

  loadConsultDataPromise(): Promise<void> {
    return new Promise((resolve) => {
      this.requestProviderService.consultData().subscribe({
        next: async (data: RequestProvider) => {
          if (data && data.id && data.provider) {
            this.isExistingData = true;
            this.dataRequestProvider.status = data.status;
            
            // Sincronizar el estado en el local storage
            this.authService.setRequestProviderStatus(data.status as any);
            
            // Si el estado es Approved y no está incrustado, redirigir inmediatamente al panel de proveedor
            if (data.status === 'Approved' && !this.isEmbedded) {
              this.router.navigate(['/providers/provider-panel']);
              resolve();
              return;
            }
            
            this.dataRequestProvider.declinedReason = data.declinedReason;
            this.dataRequestProvider.incompleteReason = data.incompleteReason;
            this.requestProviderById = data.id;
            this.canChangeToSubmitted = data.status === 'Created';
            
            await this.loadDepartmentsPromise(data.provider.country.id);
            await this.loadCitiesPromise(data.provider.state.id);
            
            this.requestProviderForm.patchValue({
              name: data.provider.name,
              documentNumber: data.provider.documentNumber,
              documentType: data.provider.documentType,
              serviceType: data.provider.serviceType,
              country: data.provider.country.id,
              department: data.provider.state.id,
              city: data.provider.city.id,
              address: data.provider.address,
              phone: data.provider.phone,
              rnt: data.provider.rnt || ''
            });
            
            if (data.status === 'Incomplete Information' || data.status === 'Created') {
              this.requestProviderForm.enable();
            } else {
              this.requestProviderForm.disable();
            }
            
            this.loadExistingFiles(data);
          }
          resolve();
        },
        error: (err: any) => {
          console.error('Error al consultar datos de proveedor:', err);
          resolve();
        }
      });
    });
  }

  loadDepartmentsPromise(countryId: number): Promise<void> {
    return new Promise((resolve) => {
      this.departmentService.getDepartmentsByCountryId(countryId).subscribe({
        next: (data: any) => {
          if (data) {
            this.departments = data;
          } else {
            this.departments = [];
          }
          resolve();
        },
        error: (err: any) => {
          console.error("Error getting departments:", err);
          this.departments = [];
          resolve();
        }
      });
    });
  }

  loadCitiesPromise(departmentId: number): Promise<void> {
    return new Promise((resolve) => {
      this.cityService.getCitiesByDepartmentId(departmentId).subscribe({
        next: (data) => {
          if (data) {
            this.cities = data;
          } else {
            this.cities = [];
          }
          resolve();
        },
        error: (err) => {
          console.error("Error getting cities:", err);
          this.cities = [];
          resolve();
        }
      });
    });
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
      rnt: ['', [Validators.required]],
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
        "phone": formData.phone,
        "rnt": formData.rnt,
        "userEmail": this.authService.getUser()?.email
      }
      console.log('Data to save:', datasaveforprovider);
      // Simular envío de datos
      this.requestProviderService.saveRequestProvider(datasaveforprovider).subscribe({
        next: (data: RequestProvider) => {
          console.log('Data saved:', data);
          this.loading = false;
          this.successMessage = 'Provider request submitted successfully. We will contact you soon.';
          this.requestProviderForm.reset();
          // Refrescar la vista después de 3 segundos
          setTimeout(() => {
            this.successMessage = '';
            this.loadInitialData();
          }, 3000);
        },
        error: (err: any) => {
          console.error('Error saving data:', err);
          this.loading = false;
          this.errorMessage = 'Error saving data. Please try again.';
        }
      });
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
     let orderIndex = 0;

     Object.keys(this.documentFiles).forEach(key => {
       const documentId = parseInt(key);
       const file = this.documentFiles[documentId];
       
       if (file) {
         documentosFiles.push(file);
         
         // Buscar el nombre del documento en la lista de tipos
         const documentType = this.requestProviderDocumentTypes.find(type => type.id === documentId);
         
         addedGalleries.push({
           description: documentType?.name || `Documento ${documentId}`,
           orderIndex: orderIndex++,
           documentTypeId: documentId
         });
       }
     });

     if (documentosFiles.length === 0) {
       console.warn('No hay archivos para guardar');
       return;
     }

     // Actualizar el objeto agregarGaleria con la estructura correcta
     this.agregarGaleria.addedGalleries = addedGalleries;

     console.log(`🚀 Enviando ${documentosFiles.length} documentos al servidor...`);
     console.log('Estructura addedGalleries:', this.agregarGaleria);
     console.log('Archivos eliminados:', this.agregarGaleria.deletedGalleries);

     this.requestProviderService.saveGallery(
       this.requestProviderById,
       documentosFiles,
       this.agregarGaleria
            ).subscribe({
         next: (response: any) => {
           console.log('✅ Todos los documentos enviados exitosamente al servidor:', response);
          Swal.fire({
            title: '¡Éxito!',
            text: '¡Documentos enviados exitosamente al servidor!',
            icon: 'success',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#0062ff'
          });
           
           // Limpiar archivos nuevos después de envío exitoso
           this.documentFiles = {};
           this.requestProviderDocumentTypes.forEach(docType => {
             this.documentFiles[docType.id] = null;
           });
           
           // Limpiar lista de eliminados y agregados
           this.agregarGaleria.deletedGalleries = [];
           this.agregarGaleria.addedGalleries = [];
           
           // Recargar datos para actualizar archivos existentes
           this.consultaData();
       },
       error: (error: any) => {
         console.error('❌ Error al enviar los documentos al servidor:', error);
        Swal.fire({
          title: 'Error',
          text: 'Error al enviar los documentos al servidor. Por favor, inténtalo de nuevo.',
          icon: 'error',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#0062ff'
        });
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
            this.dataRequestProvider.status = data.status;
            this.dataRequestProvider.declinedReason = data.declinedReason;
            this.dataRequestProvider.incompleteReason = data.incompleteReason;
            // Guardar el ID del request provider para usar en saveGallery
            this.requestProviderById = data.id;
            
            // Verificar si se puede cambiar a Submitted (solo cuando el status es Created)
            this.canChangeToSubmitted = data.status === 'Created';
            
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
              phone: data.provider.phone,
              rnt: data.provider.rnt || ''
            });
            // Deshabilitar el formulario salvo en estado Incomplete Information o Created
            if (data.status === 'Incomplete Information' || data.status === 'Created') {
              this.requestProviderForm.enable();
            } else {
              this.requestProviderForm.disable();
            }
            
            // Cargar archivos existentes si existen
            this.loadExistingFiles(data);
          }
        },
      error: (err: any) => {
        console.error('Error:', err);
      }
    });
  }

  loadExistingFiles(data: RequestProvider) {
    // Limpiar archivos existentes anteriores
    this.existingFiles = {};
    
    // Cargar archivos existentes desde requestProviderGalleryList
    if (data.requestProviderGalleryList && data.requestProviderGalleryList.length > 0) {
      data.requestProviderGalleryList.forEach((gallery: RequestProviderGallery) => {
        if (gallery.documentTypeId) {
          this.existingFiles[gallery.documentTypeId] = {
            id: gallery.id,
            fileName: gallery.documentTypeName || 'Archivo sin nombre',
            fileUrl: gallery.imageUrl,
            documentTypeId: gallery.documentTypeId,
            documentTypeName: gallery.documentTypeName,
            description: gallery.description,
            orderIndex: gallery.orderIndex,
            isExisting: true
          };
          
          console.log(`📁 Archivo existente cargado - ${gallery.documentTypeName}:`, {
            id: gallery.id,
            fileName: gallery.documentTypeName,
            fileUrl: gallery.imageUrl,
            documentTypeId: gallery.documentTypeId
          });
        }
      });
      
      console.log('Archivos existentes cargados:', this.existingFiles);
    }
  }

  loadRequestProviderDocumentTypes() {
    this.requestProviderService.typeDocuments().subscribe({
      next: (data: RequestProviderDocumentType[]) => {
        this.processDocumentTypes(data);
        console.log('Tipos de documentos cargados:', this.requestProviderDocumentTypes);
      },
      error: (err: any) => {
        console.error('Error al cargar tipos de documentos:', err);
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
        Swal.fire({
          title: 'Atención',
          text: 'El archivo es demasiado grande. El tamaño máximo permitido es 10MB.',
          icon: 'warning',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#0062ff'
        });
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
        Swal.fire({
          title: 'Atención',
          text: 'Tipo de archivo no permitido. Solo se aceptan: PDF, JPG, JPEG, PNG, DOC, DOCX',
          icon: 'warning',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#0062ff'
        });
        event.target.value = '';
        return;
      }

      // Guardar el archivo temporalmente (solo localmente)
      this.documentFiles[documentId] = file;
      
      // Obtener el nombre del documento según el ID de la lista dinámica
      const documentType = this.requestProviderDocumentTypes.find(type => type.id === documentId);
      const documentName = documentType?.name || `Documento ${documentId}`;
      
      console.log(`📎 Archivo cargado localmente para ${documentName}:`, {
        fileName: file.name,
        fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        fileType: file.type
      });

      // NO llamar a saveGallery automáticamente - solo guardar localmente
      console.log(`💾 Archivo ${documentName} guardado localmente. Usa "Guardar todos los documentos" para enviarlo al servidor.`);
    }
  }

  // Función para eliminar un archivo (nuevo o existente)
  removeDocumentFile(documentId: number): void {
    // Si hay un archivo nuevo, eliminarlo
    if (this.documentFiles[documentId]) {
      this.documentFiles[documentId] = null;
      const inputElement = document.getElementById(`document-file-${documentId}`) as HTMLInputElement;
      if (inputElement) {
        inputElement.value = '';
      }
    }
    
    // Si hay un archivo existente, eliminarlo
    if (this.existingFiles[documentId]) {
      this.removeExistingFile(documentId);
    }
    
    const documentType = this.requestProviderDocumentTypes.find(type => type.id === documentId);
    const documentName = documentType?.name || `Documento ${documentId}`;
    console.log(`🗑️ Archivo eliminado para ${documentName}`);
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
    const documentType = this.requestProviderDocumentTypes.find(type => type.id === documentId);
    const documentName = documentType?.name || `Documento ${documentId}`;
    
    const galleryData = {
      addedGalleries: [{
        description: documentName,
        orderIndex: 0,
        documentTypeId: documentId
      }],
      deletedGalleries: []
    };

    console.log(`🚀 Guardando ${documentName} en el servidor...`);

    // Llamar al servicio saveGallery
    this.requestProviderService.saveGallery(
      this.requestProviderById, 
      documentosFiles, 
      galleryData
    ).subscribe({
      next: (response: any) => {
        console.log(`✅ ${documentName} guardado exitosamente:`, response);
        // Aquí puedes agregar notificación de éxito al usuario
        // Por ejemplo: this.showSuccessMessage(`${documentName} cargado correctamente`);
      },
      error: (error: any) => {
        console.error(`❌ Error al guardar ${documentName}:`, error);
        // Revertir el archivo en caso de error
        this.documentFiles[documentId] = null;
        const inputElement = document.getElementById(`document-file-${documentId}`) as HTMLInputElement;
        if (inputElement) {
          inputElement.value = '';
        }
        // Mostrar mensaje de error al usuario
        Swal.fire({
          title: 'Error',
          text: `Error al guardar el archivo ${documentName}. Por favor, inténtalo de nuevo.`,
          icon: 'error',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#0062ff'
        });
      }
    });
  }

  // Métodos para calcular totales dinámicamente
  getTotalDocumentTypes(): number {
    return this.requestProviderDocumentTypes.length;
  }

  getTotalLoadedDocuments(): number {
    const newFiles = Object.values(this.documentFiles).filter(file => file !== null).length;
    const existingFiles = Object.keys(this.existingFiles).length;
    return newFiles + existingFiles;
  }

  getTotalMandatoryPending(): number {
    return this.requestProviderDocumentTypes.filter(docType => 
      docType.mandatory && !this.documentFiles[docType.id] && !this.existingFiles[docType.id]
    ).length;
  }

  getTotalReadyToSend(): number {
    return Object.values(this.documentFiles).filter(file => file !== null).length;
  }

  getDocumentStatusMessage(): string {
    const mandatoryPending = this.getTotalMandatoryPending();
    const newFiles = Object.values(this.documentFiles).filter(file => file !== null).length;
    const deletedFiles = this.agregarGaleria.deletedGalleries.length;
    
    if (this.dataRequestProvider.status !== 'Incomplete Information' && this.dataRequestProvider.status !== 'Pre-Approved') {
      return 'Solo lectura - Los documentos no se pueden modificar';
    }
    
    if (mandatoryPending > 0) {
      return `Faltan ${mandatoryPending} documento(s) obligatorio(s) por cargar`;
    } else if (newFiles === 0 && deletedFiles === 0) {
      return 'No hay cambios pendientes';
    } else {
      let message = '';
      if (newFiles > 0) {
        message += `${newFiles} archivo(s) nuevo(s)`;
      }
      if (deletedFiles > 0) {
        if (message) message += ' y ';
        message += `${deletedFiles} archivo(s) eliminado(s)`;
      }
      return `${message} listo(s) para enviar`;
    }
  }

  canSendDocuments(): boolean {
    if (this.dataRequestProvider.status !== 'Incomplete Information' && this.dataRequestProvider.status !== 'Pre-Approved') {
      return false;
    }
    const hasNewFiles = Object.values(this.documentFiles).some(file => file !== null);
    const hasDeletedFiles = this.agregarGaleria.deletedGalleries.length > 0;
    const mandatoryPending = this.getTotalMandatoryPending() === 0;
    
    return (hasNewFiles || hasDeletedFiles) && mandatoryPending;
  }

  getFileSizeInMB(docTypeId: number): string {
    const file = this.documentFiles[docTypeId];
    if (!file) return '0';
    return (file.size / 1024 / 1024).toFixed(2);
  }

  // Verifica si existe un archivo (nuevo o existente) para un tipo de documento
  hasFile(docTypeId: number): boolean {
    return this.documentFiles[docTypeId] !== null || this.existingFiles[docTypeId] !== undefined;
  }

  // Verifica si existe un archivo existente para un tipo de documento
  hasExistingFile(docTypeId: number): boolean {
    return this.existingFiles[docTypeId] !== undefined;
  }

  // Verifica si existe un archivo nuevo para un tipo de documento
  hasNewFile(docTypeId: number): boolean {
    return this.documentFiles[docTypeId] !== null;
  }

  // Obtiene el nombre del archivo (nuevo o existente)
  getFileName(docTypeId: number): string {
    if (this.documentFiles[docTypeId]) {
      return this.documentFiles[docTypeId]!.name;
    }
    if (this.existingFiles[docTypeId]) {
      return this.existingFiles[docTypeId].fileName;
    }
    return '';
  }

  // Elimina un archivo existente
  removeExistingFile(docTypeId: number): void {
    if (this.existingFiles[docTypeId]) {
      const existingFile = this.existingFiles[docTypeId];
      
      // Agregar a la lista de archivos eliminados con la misma estructura que addedGalleries
      this.agregarGaleria.deletedGalleries.push({
        id: existingFile.id,
        description: existingFile.description,
        orderIndex: existingFile.orderIndex,
        documentTypeId: docTypeId
      });
      
      // Eliminar de la lista de archivos existentes
      delete this.existingFiles[docTypeId];
      
      const documentType = this.requestProviderDocumentTypes.find(type => type.id === docTypeId);
      const documentName = documentType?.name || `Documento ${docTypeId}`;
      console.log(`🗑️ Archivo existente eliminado para ${documentName}`);
    }
  }

  // Obtiene la URL del archivo existente
  getFileUrl(docTypeId: number): string {
    if (this.existingFiles[docTypeId]) {
      return this.existingFiles[docTypeId].fileUrl;
    }
    return '';
  }

  // Verifica si se debe mostrar el panel de carga de archivos
  shouldShowGalleryPanel(): boolean {
    if (this.isEmbedded) return this.isExistingData;
    return this.isExistingData && (this.dataRequestProvider.status === 'Pre-Approved' || this.dataRequestProvider.status === 'Incomplete Information');
  }

  // Abre el archivo en una nueva pestaña
  openFile(docTypeId: number): void {
    console.log(`🔍 Intentando abrir archivo para documentTypeId: ${docTypeId}`);
    console.log('📊 Archivos existentes disponibles:', this.existingFiles);
    
    const existingFile = this.existingFiles[docTypeId];
    if (!existingFile) {
      console.warn(`⚠️ No se encontró archivo existente para documentTypeId: ${docTypeId}`);
      Swal.fire('Atención', 'No se encontró el archivo.', 'warning');
      return;
    }
    
    const fileUrl = existingFile.fileUrl;
    console.log(`🔗 URL encontrada: ${fileUrl}`);
    
    if (fileUrl && fileUrl.trim() !== '') {
      try {
        window.open(fileUrl, '_blank');
        console.log(`✅ Archivo abierto exitosamente: ${fileUrl}`);
      } catch (error) {
        console.error(`❌ Error al abrir archivo:`, error);
        Swal.fire('Error', 'Error al abrir el archivo.', 'error');
      }
    } else {
      console.warn(`⚠️ URL vacía o inválida para el documento ${docTypeId}: "${fileUrl}"`);
      Swal.fire('Error', 'La URL del archivo no está disponible o es inválida.', 'error');
    }
  }

  // Método para cambiar el status a Submitted
  changeToSubmitted(): void {
    if (!this.requestProviderById) {
      console.warn('No hay requestProviderById disponible');
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    console.log(`🚀 Intentando cambiar status a Submitted para ID: ${this.requestProviderById}`);

    // Llamar al servicio para cambiar el status a Submitted
    this.requestProviderService.submittedRequest(this.requestProviderById).subscribe({
      next: (response: any) => {
        console.log('✅ Status cambiado a Submitted exitosamente:', response);
        this.loading = false;
        this.successMessage = 'Status cambiado a Submitted exitosamente.';
        
        // Actualizar el status local
        this.dataRequestProvider.status = 'Submitted';
        this.canChangeToSubmitted = false;
        
        // Refrescar la vista después de 2 segundos
        setTimeout(() => {
          this.successMessage = '';
          this.loadInitialData();
        }, 2000);
      },
      error: (error: any) => {
        console.error('❌ Error al cambiar status a Submitted:', error);
        console.error('❌ Detalles del error:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url,
          body: error.error
        });
        
        this.loading = false;
        
        // Mostrar mensaje de error más específico
        if (error.status === 404) {
          this.errorMessage = 'Endpoint no encontrado. Verifica que el backend tenga el endpoint /user/send';
        } else if (error.status === 500) {
          this.errorMessage = 'Error interno del servidor. Contacta al administrador.';
        } else if (error.status === 403) {
          this.errorMessage = 'No tienes permisos para realizar esta acción.';
        } else {
          this.errorMessage = `Error al cambiar el status (${error.status}): ${error.message || 'Error desconocido'}`;
        }
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl("/login");
  }
  
} 

