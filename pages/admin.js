// ========== GESTIÓN DE PRODUCTOS EN LOCALSTORAGE ==========

const STORAGE_KEY = 'ofixhub_productos';

// Obtener todos los productos
function obtenerProductos() {
    const productos = localStorage.getItem(STORAGE_KEY);
    return productos ? JSON.parse(productos) : [];
}

// Guardar productos
function guardarProductos(productos) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(productos));
}

// Agregar un producto
function agregarProducto(nombre, detalles, precio, imagen) {
    const productos = obtenerProductos();
    const nuevoProducto = {
        id: Date.now(),
        nombre,
        detalles,
        precio,
        imagen
    };
    productos.push(nuevoProducto);
    guardarProductos(productos);
    return nuevoProducto;
}

// Eliminar un producto
function eliminarProducto(id) {
    let productos = obtenerProductos();
    productos = productos.filter(p => p.id !== id);
    guardarProductos(productos);
}

// Editar un producto
function editarProducto(id, nombre, detalles, precio, imagen) {
    let productos = obtenerProductos();
    const index = productos.findIndex(p => p.id === id);
    if (index !== -1) {
        productos[index] = {
            id,
            nombre,
            detalles,
            precio,
            imagen
        };
        guardarProductos(productos);
    }
}

// ========== FUNCIONALIDAD DE LA PÁGINA ADMIN ==========

function inicializarAdmin() {
    // Solo ejecutar si estamos en la página admin
    const formulario = document.getElementById('productoForm');
    if (!formulario) return;

    formulario.addEventListener('submit', function (e) {
        e.preventDefault();

        const nombre = document.getElementById('nombre').value.trim();
        const detalles = document.getElementById('detalles').value.trim();
        const imagen = document.getElementById('imagen').value.trim();

        if (nombre && detalles && precio && imagen) {
            agregarProducto(nombre, detalles, precio, imagen
            agregarProducto(nombre, detalles, precio);
            formulario.reset();
            mostrarProductosEnAdmin();
            alert('Producto agregado exitosamente');
        }
    });

    // Cargar productos al iniciar
    mostrarProductosEnAdmin();
}

function mostrarProductosEnAdmin() {
    const productos = obtenerProductos();
    const lista = document.getElementById('productosList');

    if (!lista) return; // Si no estamos en la página admin, no hacer nada

    if (productos.length === 0) {
        lista.innerHTML = '<p>No hay productos agregados aún.</p>';
        return;
    }

    lista.innerHTML = productos.map(producto => `
        <div class="producto-item"magen-admin">
                <img src="${producto.imagen}" alt="${producto.nombre}" onerror="this.src='https://via.placeholder.com/150?text=Sin+imagen'">
            </div>
            <div class="producto-i>
            <div class="producto-info">
                <h4>${producto.nombre}</h4>
                <p><strong>Detalles:</strong> ${producto.detalles}</p>
                <p><strong>Precio:</strong> $${parseFloat(producto.precio).toLocaleString('es-CO')}</p>
            </div>
            <div class="producto-acciones">
                <button onclick="modificarProducto(${producto.id})" class="btn-edit">Editar</button>
                <button onclick="eliminarProductoConConfirmacion(${producto.id})" class="btn-delete">Eliminar</button>
            </div>
        </div>
    `).join('');
}

function eliminarProductoConConfirmacion(id) {
    if (confirm('¿Está seguro de que desea eliminar este producto?')) {
        eliminarProducto(id);
        mostrarProductosEnAdmin();
        alert('Producto eliminado exitosamente');
    }
}

function modificarProducto(id) {
    const productos = obtenerProductos();
    const producto = productos.find(p => p.id === id);

    if (!producto) return;

    const nuevoNombre = prompt('Nombre del producto:', producto.nombre);
    if (nuevoNombre === null) return;

    const nuevoDetalles = prompt('Detalles del producto:', producto.detalles);
    if (nuevoDetalles === null) return;
const nuevaImagen = prompt('URL de la imagen:', producto.imagen);
    if (nuevaImagen === null) return;

    if (nuevoNombre && nuevoDetalles && nuevoPrecio && nuevaImagen) {
        editarProducto(id, nuevoNombre, nuevoDetalles, nuevoPrecio, nuevaImagenecio);
    if (nuevoPrecio === null) return;

    if (nuevoNombre && nuevoDetalles && nuevoPrecio) {
        editarProducto(id, nuevoNombre, nuevoDetalles, nuevoPrecio);
        mostrarProductosEnAdmin();
        alert('Producto actualizado exitosamente');
    }
}

// Ejecutar cuando DOMContentLoaded o cuando se cargue dinamicamente
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarAdmin);
} else {
    // Si el documento ya se cargó, ejecutar inmediatamente
    inicializarAdmin();
}

