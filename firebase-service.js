// ========== SERVICIO DE FIREBASE FIRESTORE ==========
// Este archivo maneja toda la comunicación con Firebase
// Optimizado para el plan Spark gratuito

let db;
let auth;

// Inicializar Firebase cuando esté disponible
async function inicializarFirebase() {
    try {
        // Validar que la configuración esté completa
        if (!firebaseConfig.projectId || firebaseConfig.projectId.includes('TU_')) {
            console.warn('⚠️ Firebase no está configurado aún. Usando localStorage como fallback.');
            return false;
        }

        // Inicializar Firebase solo si no existe ya
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }

        // Obtener referencias
        db = firebase.firestore();
        auth = firebase.auth();

        // Habilitar caché local para reducir lecturas (IMPORTANTE para plan Spark)
        db.enablePersistence().catch((err) => {
            if (err.code == 'failed-precondition') {
                console.log('Múltiples pestañas abiertas');
            } else if (err.code == 'unimplemented') {
                console.log('Navegador no soporta persistencia');
            }
        });

        console.log('✅ Firebase inicializado correctamente');
        return true;
    } catch (error) {
        console.error('❌ Error inicializando Firebase:', error);
        return false;
    }
}

// ========== FUNCIONES DE PRODUCTOS ==========

// Obtener todos los productos con caché
async function obtenerProductos() {
    try {
        if (!db) {
            const initSuccess = await inicializarFirebase();
            if (!initSuccess || !db) return JSON.parse(localStorage.getItem('ofixhub_productos') || '[]');
        }

        // Obtener de Firestore con prioridad a caché local
        const snapshot = await db.collection('productos')
            .orderBy('fechaCreacion', 'desc')
            .get();

        const productos = [];
        snapshot.forEach(doc => {
            productos.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return productos;
    } catch (error) {
        console.error('Error obteniendoproductos:', error);
        return JSON.parse(localStorage.getItem('ofixhub_productos') || '[]');
    }
}

// Agregar producto (optimizado para Spark)
async function agregarProducto(nombre, detalles, precio, imagen, precioAnterior) {
    try {
        if (!db) {
            await inicializarFirebase();
        }

        if (!db) {
            // Fallback a localStorage
            const productos = JSON.parse(localStorage.getItem('ofixhub_productos') || '[]');
            const nuevo = { id: Date.now().toString(), nombre, detalles, precio, precioAnterior: precioAnterior || null, imagen, fechaCreacion: new Date() };
            productos.push(nuevo);
            localStorage.setItem('ofixhub_productos', JSON.stringify(productos));
            return nuevo;
        }

        const nuevoProducto = {
            nombre,
            detalles,
            precio: parseFloat(precio),
            precioAnterior: precioAnterior ? parseFloat(precioAnterior) : null,
            imagen,
            fechaCreacion: firebase.firestore.FieldValue.serverTimestamp(),
            activo: true
        };

        const docRef = await db.collection('productos').add(nuevoProducto);

        return {
            id: docRef.id,
            ...nuevoProducto
        };
    } catch (error) {
        console.error('Error agregando producto:', error);
        throw error;
    }
}

// Editar producto
async function editarProducto(id, nombre, detalles, precio, imagen, precioAnterior) {
    try {
        if (!db) {
            await inicializarFirebase();
        }

        if (!db) {
            // Fallback a localStorage
            let productos = JSON.parse(localStorage.getItem('ofixhub_productos') || '[]');
            productos = productos.map(p => p.id == id ? { id, nombre, detalles, precio, precioAnterior: precioAnterior || null, imagen } : p);
            localStorage.setItem('ofixhub_productos', JSON.stringify(productos));
            return;
        }

        await db.collection('productos').doc(id).update({
            nombre,
            detalles,
            precio: parseFloat(precio),
            precioAnterior: precioAnterior ? parseFloat(precioAnterior) : null,
            imagen,
            fechaActualizacion: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('Error editando producto:', error);
        throw error;
    }
}

// Eliminar producto (soft delete para conservar datos)
async function eliminarProducto(id) {
    try {
        if (!db) {
            await inicializarFirebase();
        }

        if (!db) {
            // Fallback a localStorage
            let productos = JSON.parse(localStorage.getItem('ofixhub_productos') || '[]');
            productos = productos.filter(p => p.id != id);
            localStorage.setItem('ofixhub_productos', JSON.stringify(productos));
            return;
        }

        // Soft delete: marcar como inactivo en lugar de eliminar
        await db.collection('productos').doc(id).update({
            activo: false,
            fechaEliminacion: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('Error eliminando producto:', error);
        throw error;
    }
}

// ========== OPTIMIZACIONES PARA PLAN SPARK ==========

// Función para limpiar productos inactivos (ejecutar ocasionalmente)
// NOTA: Solo hacer esto desde server-side o con Firestore Rules seguras
async function limpiarProductosInactivos() {
    try {
        if (!db) return;

        // Obtener productos inactivos de hace más de 30 días
        const hace30Dias = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const snapshot = await db.collection('productos')
            .where('activo', '==', false)
            .where('fechaEliminacion', '<', hace30Dias)
            .get();

        // Eliminar en lote (máx 500 por operación)
        const batch = db.batch();
        let count = 0;

        snapshot.forEach(doc => {
            if (count < 500) {
                batch.delete(doc.ref);
                count++;
            }
        });

        if (count > 0) {
            await batch.commit();
            console.log(`🧹 ${count} productos inactivos eliminados`);
        }
    } catch (error) {
        console.error('Error limpiando productos:', error);
    }
}

// Escuchar cambios en tiempo real (máximo 1 listener activo en plan Spark)
function escucharProductos(callback) {
    try {
        if (!db) {
            callback(JSON.parse(localStorage.getItem('ofixhub_productos') || '[]'));
            return;
        }

        return db.collection('productos')
            .where('activo', '==', true)
            .orderBy('fechaCreacion', 'desc')
            .onSnapshot((snapshot) => {
                const productos = [];
                snapshot.forEach(doc => {
                    productos.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                callback(productos);
            });
    } catch (error) {
        console.error('Error escuchando productos:', error);
        callback(JSON.parse(localStorage.getItem('ofixhub_productos') || '[]'));
    }
}

// Inicializar Firebase cuando el documento esté listo
document.addEventListener('DOMContentLoaded', () => {
    if (typeof firebase !== 'undefined') {
        inicializarFirebase();
    }
});
