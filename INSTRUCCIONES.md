# BeautyFlow - App de Reservas para Peluquería

## Instalación Rápida

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar Firebase

#### Crear proyecto en Firebase:
1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Crea un nuevo proyecto
3. Activa **Authentication** (Email/Password y Google)
4. Activa **Firestore Database**
5. Ve a Configuración del proyecto > Aplicaciones > Web
6. Copia las credenciales

#### Crear archivo .env:
Copia `.env.example` a `.env` y completa con tus credenciales:
```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

### 3. Poblar datos iniciales

Ejecuta para ver los datos de ejemplo:
```bash
npm run seed
```

Luego en Firebase Console > Firestore, crea las colecciones:
- `services` - Servicios de la peluquería
- `stylists` - Estilistas/profesionales
- `businessConfig` - Configuración del negocio

### 4. Iniciar la app
```bash
npm run dev
```

La app estará en `http://localhost:3000`

---

## Crear Usuario Admin

1. Regístrate normalmente desde la app
2. Ve a Firebase Console > Firestore > users
3. Encuentra tu usuario y cambia el campo `role` de `"client"` a `"admin"`
4. Recarga la app

---

## Estructura del Proyecto

```
src/
├── components/      # Componentes reutilizables
├── config/          # Configuración (Firebase)
├── context/         # Estado global (Auth, Booking)
├── hooks/           # Custom hooks
├── pages/
│   ├── auth/        # Login, Register
│   ├── client/      # Páginas del cliente
│   └── admin/       # Panel de administración
├── services/        # Llamadas a Firebase
└── utils/           # Utilidades
```

---

## Funcionalidades

### Cliente:
- ✅ Registro/Login (Email + Google)
- ✅ Ver servicios disponibles
- ✅ Seleccionar múltiples servicios
- ✅ Elegir estilista preferido
- ✅ Seleccionar fecha y hora
- ✅ Confirmar reserva
- ✅ Ver historial de citas
- ✅ Cancelar citas
- ✅ Perfil de usuario

### Admin:
- ✅ Dashboard con estadísticas
- ✅ Ver todas las citas
- ✅ Cambiar estado de citas
- ✅ Gestionar servicios (CRUD)
- ✅ Gestionar estilistas (CRUD)
- ✅ Configuración del negocio

---

## Configurar Stripe (Pagos)

Para pagos reales necesitas:

1. Cuenta en [Stripe](https://stripe.com)
2. Obtener claves de API
3. Crear Firebase Cloud Function para crear PaymentIntents

Por ahora los pagos están simulados. Para implementar pagos reales:
1. Configura Firebase Cloud Functions
2. Implementa el endpoint `/createPaymentIntent`
3. Actualiza `paymentService.js`

---

## Despliegue

### Firebase Hosting:
```bash
npm run build
firebase deploy
```

### Vercel:
```bash
npm run build
vercel
```

---

## Personalización

### Cambiar colores:
Edita `tailwind.config.js`:
```js
colors: {
  "primary": "#46ec13",      // Color principal
  "background-dark": "#142210", // Fondo oscuro
  ...
}
```

### Cambiar nombre:
1. Busca "BeautyFlow" en todo el proyecto
2. Reemplaza con el nombre de tu negocio
3. Actualiza `manifest.json`

---

## Soporte

Si tienes problemas:
1. Revisa la consola del navegador
2. Verifica las reglas de Firestore
3. Asegúrate de que las variables de entorno estén configuradas
