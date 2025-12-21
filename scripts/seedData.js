/**
 * Script para poblar la base de datos de Firebase con datos iniciales
 *
 * Para ejecutar este script:
 * 1. Crea un archivo .env con las credenciales de Firebase
 * 2. Ejecuta: npm run seed
 *
 * NOTA: Este script usa el SDK de Admin de Firebase o puede ser
 * ejecutado desde la consola de Firebase directamente.
 */

// Datos de servicios de ejemplo
const services = [
  {
    name: "Corte Estilo Bob",
    description: "Corte moderno y elegante que enmarca el rostro",
    price: 45.00,
    duration: 60,
    category: "cortes",
    imageUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400",
    isPopular: true,
    isActive: true
  },
  {
    name: "Corte de Puntas",
    description: "Mantenimiento básico para puntas saludables",
    price: 25.00,
    duration: 30,
    category: "cortes",
    imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400",
    isPopular: false,
    isActive: true
  },
  {
    name: "Corte Caballero",
    description: "Corte clásico o moderno para hombres",
    price: 20.00,
    duration: 30,
    category: "cortes",
    imageUrl: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400",
    isPopular: false,
    isActive: true
  },
  {
    name: "Balayage Rubio",
    description: "Técnica de coloración degradada natural",
    price: 120.00,
    duration: 180,
    category: "color",
    imageUrl: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=400",
    isPopular: true,
    isActive: true
  },
  {
    name: "Tinte Completo",
    description: "Coloración completa del cabello",
    price: 80.00,
    duration: 120,
    category: "color",
    imageUrl: "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=400",
    isPopular: false,
    isActive: true
  },
  {
    name: "Mechas",
    description: "Mechas clásicas o babylights",
    price: 90.00,
    duration: 150,
    category: "color",
    imageUrl: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=400",
    isPopular: false,
    isActive: true
  },
  {
    name: "Hidratación Profunda",
    description: "Tratamiento nutritivo para cabello seco",
    price: 60.00,
    duration: 45,
    category: "tratamientos",
    imageUrl: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400",
    isPopular: true,
    isActive: true
  },
  {
    name: "Keratina",
    description: "Alisado y tratamiento de keratina brasileña",
    price: 150.00,
    duration: 180,
    category: "tratamientos",
    imageUrl: "https://images.unsplash.com/photo-1522337094846-8a818192de1f?w=400",
    isPopular: false,
    isActive: true
  },
  {
    name: "Manicura Gel",
    description: "Manicura con esmaltado semipermanente",
    price: 40.00,
    duration: 60,
    category: "uñas",
    imageUrl: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400",
    isPopular: true,
    isActive: true
  },
  {
    name: "Pedicura Spa",
    description: "Tratamiento completo de pies con masaje",
    price: 50.00,
    duration: 75,
    category: "uñas",
    imageUrl: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400",
    isPopular: false,
    isActive: true
  },
  {
    name: "Diseño de Cejas",
    description: "Depilación y diseño personalizado",
    price: 20.00,
    duration: 30,
    category: "otros",
    imageUrl: "https://images.unsplash.com/photo-1594225268545-cb29f69a5b08?w=400",
    isPopular: true,
    isActive: true
  },
  {
    name: "Peinado de Noche",
    description: "Peinado elegante para ocasiones especiales",
    price: 50.00,
    duration: 60,
    category: "otros",
    imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400",
    isPopular: false,
    isActive: true
  },
  {
    name: "Maquillaje Profesional",
    description: "Maquillaje para eventos o sesiones",
    price: 70.00,
    duration: 60,
    category: "maquillaje",
    imageUrl: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400",
    isPopular: false,
    isActive: true
  }
];

// Datos de estilistas de ejemplo
const stylists = [
  {
    name: "Ana López",
    photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
    specialties: ["cortes", "color", "tratamientos"],
    rating: 4.9,
    reviewCount: 127,
    isActive: true
  },
  {
    name: "Carlos Rodríguez",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    specialties: ["cortes", "color"],
    rating: 4.8,
    reviewCount: 98,
    isActive: true
  },
  {
    name: "Sofía Martínez",
    photoUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
    specialties: ["uñas", "maquillaje"],
    rating: 4.9,
    reviewCount: 156,
    isActive: true
  },
  {
    name: "Luis García",
    photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
    specialties: ["cortes", "tratamientos"],
    rating: 4.7,
    reviewCount: 84,
    isActive: true
  }
];

// Configuración del negocio
const businessConfig = {
  businessName: "BeautyFlow",
  phone: "+34 600 123 456",
  email: "contacto@beautyflow.com",
  address: "Calle Principal 123, Madrid",
  openTime: "09:00",
  closeTime: "20:00",
  slotDuration: 30,
  daysOff: [0], // Domingo
  currency: "EUR",
  cancellationPolicy: 24
};

// Usuario admin de ejemplo
const adminUser = {
  email: "admin@beautyflow.com",
  name: "Administrador",
  phone: "+34 600 123 456",
  role: "admin",
  photoURL: ""
};

console.log("=== DATOS PARA FIREBASE ===\n");
console.log("Copia estos datos en la consola de Firebase o usa el script de admin:\n");

console.log("--- SERVICIOS ---");
console.log(JSON.stringify(services, null, 2));

console.log("\n--- ESTILISTAS ---");
console.log(JSON.stringify(stylists, null, 2));

console.log("\n--- CONFIGURACIÓN ---");
console.log(JSON.stringify(businessConfig, null, 2));

console.log("\n--- USUARIO ADMIN ---");
console.log(JSON.stringify(adminUser, null, 2));

console.log("\n=== INSTRUCCIONES ===");
console.log("1. Ve a Firebase Console > Firestore Database");
console.log("2. Crea las colecciones: services, stylists, businessConfig, users");
console.log("3. Añade los documentos con los datos de arriba");
console.log("4. Para el admin, primero regístralo desde la app y luego cambia su role a 'admin'");

// Para uso programático con Firebase Admin SDK:
module.exports = { services, stylists, businessConfig, adminUser };
