# 🔥 Configuración de Firebase para OfixHub

## Paso 1: Crear Proyecto en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Crear proyecto"
3. Nombre del proyecto: `ofixhub`
4. Desmarca "Google Analytics" (para plan Spark gratis)
5. Haz clic en "Crear proyecto"

## Paso 2: Obtener Configuración de Firebase

1. En Firebase Console, haz clic en tu proyecto
2. Ve a **Configuración del proyecto** (engranaje arriba a la izquierda)
3. Copia la configuración que aparece bajo "firebaseConfig"
4. Reemplaza los valores en `firebase-config.js`:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "ofixhub-YOUR_ID.firebaseapp.com",
    projectId: "ofixhub-YOUR_ID",
    storageBucket: "ofixhub-YOUR_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

## Paso 3: Crear Base de Datos Firestore

1. En Firebase Console, ve a **Firestore Database**
2. Haz clic en "Crear base de datos"
3. Selecciona: **Modo de producción** (importante para seguridad)
4. Elige la región más cercana a ti
5. Haz clic en "Crear"

## Paso 4: Configurar Firestore Rules (IMPORTANTE)

1. En Firestore, ve a la pestaña **Reglas**
2. Reemplaza todo con esto:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /productos/{document=**} {
      // Permitir lectura a todos
      allow read: if true;
      
      // Solo permitir escritura desde admin
      // Reemplaza 'TU_EMAIL_AQUI' con tu correo
      allow write: if request.auth != null && 
                      request.auth.token.email == 'ofixhub@gmail.com';
    }
  }
}
```

3. Haz clic en "Publicar"

## Paso 5: Configurar Authentication

1. En Firebase Console, ve a **Authentication**
2. Haz clic en "Comenzar"
3. Ve a **Proveedores de registro**
4. Habilita **Email/Contraseña**
5. Guarda

## Paso 6: Agregar tu Email de Admin

1. En Authentication, ve a **Usuarios**
2. Haz clic en "Agregar usuario"
3. Email: `ofixhub@gmail.com`
4. Contraseña: Crea una segura
5. Haz clic en "Crear usuario"

## Paso 7: Actualizar index.html

Agrega estos scripts en el `<head>` de index.html, ANTES de tu script.js:

```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js"></script>

<!-- Firebase Configuration -->
<script src="firebase-config.js"></script>
<script src="firebase-service.js"></script>

<!-- Tu script.js (después de Firebase)
<script src="script.js"></script>
```

## Paso 8: Actualizar admin.html

Cambia la referencia en admin.html de:
```html
<script src="pages/admin.js"></script>
```

A:
```html
<script src="pages/admin-firebase.js"></script>
```

## Paso 9: Desplegar en Firebase Hosting (Opcional)

### Instalar Firebase CLI:
```bash
npm install -g firebase-tools
```

### Inicializar Firebase en tu proyecto:
```bash
firebase login
firebase init hosting
```

Cuando pregunta:
- **Public directory:** `.` (punto)
- **Single page app:** `y` (sí)

### Desplegar:
```bash
firebase deploy
```

Tu sitio estará en: `https://ofixhub-project.web.app`

---

## ⚠️ LÍMITES DEL PLAN SPARK GRATUITO

| Recurso | Límite Diario |
|---------|---------------|
| Lecturas | 50,000 |
| Escrituras | 20,000 |
| Eliminaciones | 20,000 |
| Almacenamiento | 1 GB |
| Descargas | 1 GB/mes |

**Estimación:**
- Con 100 productos y 1000 visitantes: Usa ~5-10% del límite diario
- **Suficiente para un negocio pequeño/mediano**

### Optimizaciones implementadas:
✅ Caché local para reducir lecturas
✅ Soft delete (no elimina, marca como inactivo)
✅ Ordenamiento por fecha en BD
✅ Fallback automático a localStorage si Firebase falla

---

## 🔐 SEGURIDAD

**NUNCA compartir:**
- La clave API (está en firebase-config.js, pero es pública)
- Las credenciales de admin
- La contraseña de Firebase

**Las Firestore Rules protegen tu BD** para que:
- Solo tú puedas escribir productos
- Todos puedan leer productos
- Los visitantes no puedan modificar nada

---

## ❓ TROUBLESHOOTING

**"Firebase is not defined"**
- Asegúrate de que los scripts de Firebase estén en index.html antes de script.js

**"Permission denied"**
- Verifica que tu email esté en las Firestore Rules
- Verifica que hayas iniciado sesión en Firebase

**"Los productos no aparecen"**
- Ve a Firestore Console y verifica que haya documentos en la colección "productos"
- Abre DevTools (F12) y revisa la consola por errores

---

¡Listo! Tu sitio ahora usa Firebase 🎉
