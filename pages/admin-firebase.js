// ========== SCRIPT DE GESTIÓN DEL PANEL DE ADMINISTRACIÓN ==========
// La funcionalidad base de datos se maneja globalmente desde firebase-service.js

// ========== FUNCIONALIDAD DE LA PÁGINA ADMIN ==========

function inicializarAdmin() {
    // Solo ejecutar si estamos en la página admin
    const formulario = document.getElementById('productoForm');
    if (!formulario) return;

    formulario.addEventListener('submit', async function (e) {
        e.preventDefault();

        const formId = document.getElementById('productoId');
        const id = formId ? formId.value : undefined;
        const nombre = document.getElementById('nombre').value.trim();
        const detalles = document.getElementById('detalles').value.trim();
        const precio = document.getElementById('precio').value.trim();
        const precioAnterior = document.getElementById('precioAnterior').value.trim();
        const imagen = document.getElementById('imagen').value.trim();

        if (nombre && detalles && precio && imagen) {
            try {
                if (id) {
                    // Si hay un ID, estamos editando
                    await editarProducto(id, nombre, detalles, precio, imagen, precioAnterior);
                    alert('Producto actualizado exitosamente');
                } else {
                    // Si no hay ID, estamos agregando nuevo
                    await agregarProducto(nombre, detalles, precio, imagen, precioAnterior);
                    alert('Producto agregado exitosamente');
                }

                resetearFormularioEdicion();
                await mostrarProductosEnAdmin();
            } catch (error) {
                alert('Error al guardar producto: ' + error.message);
            }
        }
    });

    const btnCancelar = document.getElementById('btnCancelarEdicion');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', resetearFormularioEdicion);
    }

    // Cargar productos al iniciar
    mostrarProductosEnAdmin();
}

async function mostrarProductosEnAdmin() {
    const productos = await obtenerProductos();
    const lista = document.getElementById('productosList');

    if (!lista) return;

    if (productos.length === 0) {
        lista.innerHTML = '<p>No hay productos agregados aún.</p>';
        return;
    }

    lista.innerHTML = productos.map(producto => `
        <div class="producto-item">
            <div class="producto-imagen-admin">
                <img src="${producto.imagen}" alt="${producto.nombre}" onerror="this.src='https://via.placeholder.com/150?text=Sin+imagen'">
            </div>
            <div class="producto-info">
                <h4>${producto.nombre}</h4>
                <p><strong>Precio Actual:</strong> $${parseFloat(producto.precio).toLocaleString('es-CO')}</p>
                ${producto.precioAnterior ? `<p><strong>Precio Anterior:</strong> <del>$${parseFloat(producto.precioAnterior).toLocaleString('es-CO')}</del></p>` : ''}
            </div>
            <div class="producto-acciones">
                <button onclick="modificarProducto('${producto.id}')" class="btn-edit">Editar</button>
                <button onclick="eliminarProductoConConfirmacion('${producto.id}')" class="btn-delete">Eliminar</button>
            </div>
        </div>
    `).join('');
}

function eliminarProductoConConfirmacion(id) {
    if (confirm('¿Está seguro de que desea eliminar este producto?')) {
        eliminarProducto(id).then(() => {
            mostrarProductosEnAdmin();
            alert('Producto eliminado exitosamente');
        }).catch(error => {
            alert('Error al eliminar: ' + error.message);
        });
    }
}

async function modificarProducto(id) {
    const productos = await obtenerProductos();
    const producto = productos.find(p => p.id == id);

    if (!producto) return;

    // Rellenamos el formulario principal
    document.getElementById('productoId').value = producto.id;
    document.getElementById('nombre').value = producto.nombre;
    document.getElementById('detalles').value = producto.detalles;
    document.getElementById('precio').value = producto.precio;
    document.getElementById('precioAnterior').value = producto.precioAnterior || '';
    document.getElementById('imagen').value = producto.imagen;

    // Cambiar la apariencia del formulario a "Modo Edición"
    document.getElementById('formTitulo').innerText = 'Editar Producto';
    document.getElementById('btnGuardarProducto').innerText = 'Guardar Cambios';
    document.getElementById('btnCancelarEdicion').style.display = 'block';

    // Hacer scroll suave hacia arriba para que el admin vea el formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetearFormularioEdicion() {
    const formulario = document.getElementById('productoForm');
    if (formulario) formulario.reset();

    const idInput = document.getElementById('productoId');
    if (idInput) idInput.value = '';

    const titulo = document.getElementById('formTitulo');
    if (titulo) titulo.innerText = 'Agregar Nuevo Producto';

    const btnGuardar = document.getElementById('btnGuardarProducto');
    if (btnGuardar) btnGuardar.innerText = 'Agregar Producto';

    const btnCancelar = document.getElementById('btnCancelarEdicion');
    if (btnCancelar) btnCancelar.style.display = 'none';
}

// Función para cargar productos en la página principal
async function cargarProductosEnPagina() {
    const productos = await obtenerProductos();
    const grid = document.getElementById('productosGrid');

    if (!grid) return; // Si no estamos en la página productos, no hacer nada

    if (productos.length === 0) {
        grid.innerHTML = '<p class="empty-message">No hay productos disponibles en este momento.</p>';
        return;
    }

    grid.innerHTML = productos.map((producto, index) => `
        <div class="producto-card" onclick="toggleCard(event, this)">
            <div class="producto-imagen">
                <img src="${producto.imagen}" alt="${producto.nombre}" onerror="this.src='https://via.placeholder.com/300?text=Sin+imagen'">
                ${producto.precioAnterior ? `<div class="oferta-badge">¡Oferta!</div>` : ''}
            </div>
            <h3>${producto.nombre}</h3>
            <div class="producto-detalles-container">
                <p class="producto-detalles">${producto.detalles}</p>
                <span class="ver-mas-texto">Ver detalles completo...</span>
            </div>
            <div class="precios-container">
                ${producto.precioAnterior ? `<p class="producto-precio-viejo"><del>$${parseFloat(producto.precioAnterior).toLocaleString('es-CO')}</del></p>` : ''}
                <p class="producto-precio">Precio: $${parseFloat(producto.precio).toLocaleString('es-CO')}</p>
            </div>
            <a href="https://wa.me/3138835376?text=Hola,%20me%20interesa%20el%20producto%20${encodeURIComponent(producto.nombre)}%20a%20$${encodeURIComponent(producto.precio)}" 
               target="_blank" class="btn-primary" onclick="event.stopPropagation()">Comprar</a>
        </div>
    `).join('');
}

// Escuchar cuando se navegue a diferentes páginas (Router SPA)
document.addEventListener('paginaCargada', (e) => {
    const pagina = e.detail.pagina;
    if (pagina.includes('admin.html')) {
        inicializarAdmin();
    } else if (pagina.includes('productos.html')) {
        cargarProductosEnPagina();
    }
});

// Toggling para las tarjetas de producto
window.toggleCard = function (event, element) {
    const isExpanded = element.classList.contains('expanded');

    // Cerrar cualquier tarjeta que esté abierta
    document.querySelectorAll('.producto-card.expanded').forEach(card => card.classList.remove('expanded'));

    // Si no estaba expandida, se expande
    if (!isExpanded) {
        element.classList.add('expanded');
    }

    // Evita que el click se propague al documento (lo que cerraría inmediatamente)
    event.stopPropagation();
};

// Si hacemos clic en cualquier otro lugar del documento, se cierran las tarjetas expandidas
document.addEventListener('click', () => {
    document.querySelectorAll('.producto-card.expanded').forEach(card => card.classList.remove('expanded'));
});

// Inicialización inicial por si se carga directamente
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('productoForm')) inicializarAdmin();
    if (document.getElementById('productosGrid')) cargarProductosEnPagina();
});
