const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/MI PC/Documents/dev/TourYa/tourya-front/public/i18n';

const updates = {
  'es.json': {
    login: 'Iniciar Sesión',
    logout: 'Cerrar Sesión',
    myBooking: 'Mis Reservas',
    myProfile: 'Mi Perfil',
    menu: {
      tours: 'Tours',
      tourList: 'Lista de Tours',
      schedulesTemplates: 'Plantillas de Horarios',
      myBookings: 'Mis Reservas',
      myReviews: 'Mis Reseñas',
      wishlist: 'Lista de Deseos',
      myPayments: 'Mis Pagos',
      blog: 'Blog',
      contactUs: 'Contáctenos',
      legal: 'Legal',
      termsAndConditions: 'Términos y Condiciones',
      privacyPolicy: 'Política de Privacidad',
      providers: 'Proveedores'
    }
  },
  'en.json': {
    login: 'Login',
    logout: 'Logout',
    myBooking: 'My Booking',
    myProfile: 'My Profile',
    menu: {
      tours: 'Tours',
      tourList: 'Tour List',
      schedulesTemplates: 'Schedules Templates',
      myBookings: 'My Bookings',
      myReviews: 'My Reviews',
      wishlist: 'Wishlist',
      myPayments: 'My Payments',
      blog: 'Blog',
      contactUs: 'Contact Us',
      legal: 'Legal',
      termsAndConditions: 'Terms & Conditions',
      privacyPolicy: 'Privacy Policy',
      providers: 'Providers'
    }
  },
  'pt.json': {
    login: 'Entrar',
    logout: 'Sair',
    myBooking: 'Minhas Reservas',
    myProfile: 'Meu Perfil',
    menu: {
      tours: 'Tours',
      tourList: 'Lista de Tours',
      schedulesTemplates: 'Modelos de Horários',
      myBookings: 'Minhas Reservas',
      myReviews: 'Minhas Avaliações',
      wishlist: 'Lista de Desejos',
      myPayments: 'Meus Pagamentos',
      blog: 'Blog',
      contactUs: 'Contate-nos',
      legal: 'Legal',
      termsAndConditions: 'Termos e Condições',
      privacyPolicy: 'Política de Privacidade',
      providers: 'Fornecedores'
    }
  }
};

for (const file of ['es.json', 'en.json', 'pt.json']) {
  const filepath = path.join(dir, file);
  if (fs.existsSync(filepath)) {
    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    data.header = updates[file];
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Updated ${file}`);
  }
}
