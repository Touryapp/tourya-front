# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Core Development
- `npm start` or `ng serve` - Start development server on http://localhost:4200
- `ng build` - Build the project for production (outputs to `dist/template`)
- `ng build --watch --configuration development` - Build in development mode with file watching
- `ng test` - Run unit tests using Karma and Jasmine
- `ng lint` - Run ESLint linting on TypeScript and HTML files

### Code Generation
- `ng generate component component-name` - Generate a new component (non-standalone by default)
- `ng generate service service-name` - Generate a new service
- `ng generate module module-name` - Generate a new module
- `ng generate directive|pipe|guard|interface|enum` - Generate other Angular artifacts

### Testing
- `ng test --watch=false` - Run tests once without watching
- `ng test --code-coverage` - Run tests with coverage report

## Project Architecture

### Technology Stack
- **Framework**: Angular 19 with TypeScript
- **Styling**: SCSS, Bootstrap 5, Angular Material, PrimeNG
- **Authentication**: Firebase Auth with Google/Facebook social login
- **State Management**: RxJS with BehaviorSubject pattern
- **Maps**: Angular Google Maps, Leaflet
- **Calendar**: FullCalendar, Angular Calendar
- **Charts**: ApexCharts, Chart.js
- **Testing**: Jasmine + Karma

### Module Structure
The application follows a feature-based modular architecture:

```
src/app/
├── auth/                    # Authentication components (login, register, error pages)
├── core/                    # Core services and interceptors
│   ├── guards/             # Route guards (auth, admin, redirect guards)
│   ├── interceptors/       # HTTP interceptors (auth interceptor)
│   └── services/           # Core services (auth service)
├── feature-module/         # Feature modules (lazy-loaded)
│   ├── agent/             # Agent-specific features (dashboard, bookings, etc.)
│   └── [other-features]/
├── pages/                  # Main application pages
│   ├── admin/             # Admin panel
│   ├── clients/           # Client-facing pages
│   └── providers/         # Provider panel
├── shared/                 # Shared components, pipes, DTOs
└── environments/          # Environment configurations
```

### Key Architecture Patterns

#### Authentication & Authorization
- **Firebase Integration**: Social authentication (Google, Facebook) configured in `app.module.ts`
- **JWT Tokens**: Custom JWT authentication for backend API integration
- **Role-Based Access**: Three roles - USER, PROVIDER, ADMIN with corresponding guards
- **Auth Service**: Centralized authentication logic in `core/services/auth.service.ts`

#### Module Loading Strategy
- **Lazy Loading**: Feature modules are lazy-loaded via routing
- **Shared Module**: Common UI components and third-party modules exported from `shared/shared-module.ts`
- **Material Module**: Angular Material components organized in dedicated module

#### Data Flow
- **Reactive Forms**: Used throughout the application
- **HTTP Client**: With custom auth interceptor for token management
- **RxJS Observables**: For reactive data handling
- **Local Storage**: For token and user data persistence

### Environment Configuration
- Development API: `http://44.203.38.85:8088/api/v1`
- Firebase project: `tourya-169d6`
- Internationalization: ngx-translate with JSON files in `/assets/i18n/`

### Build Configuration
- **Angular CLI**: Version 19 with application builder
- **Bundle Budgets**: 5MB warning/error limits for production
- **Asset Optimization**: Images served from `public` folder
- **Style Processing**: Global styles include Bootstrap, Material Design, custom themes

### Component Guidelines
- **Prefix**: All components use `app-` prefix
- **Selectors**: Components use kebab-case, directives use camelCase
- **Non-Standalone**: Components are traditional Angular components (not standalone)
- **SCSS**: Component-scoped styling with global theme variables

### Third-Party Integrations
- **Google Maps**: For location-based features
- **Calendar Systems**: FullCalendar and Angular Calendar for scheduling
- **Rich Text Editing**: ngx-editor for content management
- **Image Galleries**: Lightgallery and ngx-lightbox for media display
- **Carousels**: ngx-owl-carousel-o and Slick for content sliders

## Development Notes

### Firebase Setup
Firebase is initialized in `app.module.ts` with environment-specific configuration. The auth instance is exported for use across the application.

### Routing Structure
- **Authentication routes**: Direct component routing for login, register, error pages
- **Feature modules**: Lazy-loaded with dedicated routing modules
- **Default route**: Loads pages module for main application content
- **404 handling**: Wildcard route redirects to custom 404 page

### Styling Architecture
- **Custom Theme**: Material Design theme in `custom-theme.scss`
- **Bootstrap Integration**: Bootstrap 5 with custom utilities
- **Icon Libraries**: FontAwesome, PrimeIcons, Tabler Icons, and Iconsax
- **Animation**: AOS (Animate On Scroll) library integrated

### API Integration
- **Base URL**: Configurable via environment files
- **Auth Interceptor**: Automatically adds JWT tokens to requests
- **UUID Tracking**: Request tracking with uuid library for debugging
- **DTOs**: Strongly-typed data transfer objects in `shared/dto/`