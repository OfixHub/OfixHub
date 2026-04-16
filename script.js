document.addEventListener("DOMContentLoaded", async function () {
    // ==============================
    // VARIABLES Y ELEMENTOS DEL DOM
    // ==============================
    const toggleNav = document.getElementById("toggleNav");
    const barnav = document.getElementById("barnav");
    const navLinks = barnav.querySelectorAll("a");
    const contenido = document.getElementById("contenido");
    const logo = document.querySelector(".logo");
    const footer = document.querySelector("footer");

    // ==============================
    // CARGA DE PALETAS DESDE JSON
    // ==============================
    let paletas = [];
    try {
        const response = await fetch(`config/paletas.json?v=${Date.now()}`);
        paletas = await response.json();
    } catch (error) {
        console.error('Error al cargar paletas:', error);
        // Paleta por defecto en caso de error
        paletas = [
            {
                "nombre": "Café",
                "background": "#f5f5f5",
                "texto": "#3e2723",
                "navBackground": "#6d4c41",
                "linkColor": "white",
                "linkBorderColor": "#5d4037",
                "linkBackground": "#8d6e63",
                "boxBackground": "#ffffff",
                "footerBackground": "#6d4c41",
                "footerTextColor": "white",
                "btnPrimary": "#795548",
                "btnPrimaryHover": "#5d4037"
            }
        ];
    }

    // ==============================
    // CARGAR TEMA GUARDADO
    // ==============================
    const savedThemeIndex = localStorage.getItem('selectedTheme');
    if (savedThemeIndex !== null && paletas[savedThemeIndex]) {
        cambiarPaleta(paletas[savedThemeIndex]);
    }

    // ==============================
    // FUNCIONES PRINCIPALES
    // ==============================
    function toggleMenu() {
        barnav.classList.toggle("visible");
        toggleNav.classList.toggle("hidden", barnav.classList.contains("visible"));
    }

    function cerrarMenuMovil() {
        if (window.innerWidth <= 768) {
            barnav.classList.remove("visible");
            toggleNav.classList.remove("hidden");
        }
    }

    function ajustarNav() {
        const isDesktop = window.innerWidth > 768;
        barnav.classList.toggle("visible", isDesktop);
        if (isDesktop) {
            toggleNav.classList.add("hidden"); // Ensure hidden on desktop
        } else {
            // On mobile, only show if menu is NOT visible
            if (!barnav.classList.contains("visible")) {
                toggleNav.classList.remove("hidden");
            }
        }
    }

    function marcarEnlaceActivo(pagina) {
        navLinks.forEach(link => link.classList.remove("activo"));
        const enlaceActivo = [...navLinks].find(link => link.getAttribute("href") === pagina);
        if (enlaceActivo) enlaceActivo.classList.add("activo");
    }

    window.cargarContenido = function (pagina) {
        fetch(pagina)
            .then(response => response.text())
            .then(data => {
                contenido.innerHTML = data;
                window.scrollTo(0, 0);
                marcarEnlaceActivo(pagina);

                // Disparar evento para re-iniciar scripts de la página
                const ev = new CustomEvent('paginaCargada', { detail: { pagina } });
                document.dispatchEvent(ev);
            })
            .catch(error => console.error("Error al cargar contenido:", error));
    };

    // ==============================
    // FUNCIONES DE CAMBIO DE TEMA
    // ==============================
    function cambiarPaleta(colores) {
        const root = document.documentElement;
        root.style.setProperty('--bg-body', colores.background);
        root.style.setProperty('--text-main', colores.texto);
        root.style.setProperty('--bg-nav', colores.navBackground);
        root.style.setProperty('--bg-footer', colores.footerBackground);
        root.style.setProperty('--bg-box', colores.boxBackground);
        root.style.setProperty('--link-color', colores.linkColor);
        root.style.setProperty('--link-bg', colores.linkBackground);
        root.style.setProperty('--link-border', colores.linkBorderColor);
        root.style.setProperty('--footer-text', colores.footerTextColor || colores.texto);
        root.style.setProperty('--btn-primary', colores.btnPrimary);
        root.style.setProperty('--btn-primary-hover', colores.btnPrimaryHover);
    }

    function cambiarPaletaAleatoria() {
        const randomIndex = Math.floor(Math.random() * paletas.length);
        const selectedPalette = paletas[randomIndex];
        cambiarPaleta(selectedPalette);
        localStorage.setItem('selectedTheme', randomIndex);
    }

    // ==============================
    // EVENT LISTENERS
    // ==============================
    toggleNav.addEventListener("click", toggleMenu);
    navLinks.forEach(link => link.addEventListener("click", cerrarMenuMovil));
    window.addEventListener("resize", ajustarNav);
    logo.addEventListener("click", cambiarPaletaAleatoria);
    cargarContenido("pages/inicio.html");
    ajustarNav();

    // Close menu when clicking outside
    document.addEventListener("click", function (event) {
        const isClickInsideMenu = barnav.contains(event.target);
        const isClickOnToggle = toggleNav.contains(event.target);

        if (!isClickInsideMenu && !isClickOnToggle && barnav.classList.contains("visible")) {
            barnav.classList.remove("visible");
            toggleNav.classList.remove("hidden");
        }
    });
});

// ==============================
// ACCESO SECRETO A ADMIN CON GOOGLE AUTH
// ==============================
document.addEventListener('keydown', async function (event) {
    // Ctrl + Shift + Alt + A para acceder a admin
    if (event.ctrlKey && event.shiftKey && event.altKey && (event.key === 'A' || event.key === 'a')) {
        event.preventDefault();

        // Verificar si Firebase Auth está disponible en el entorno global
        if (typeof firebase !== 'undefined' && firebase.auth) {
            const provider = new firebase.auth.GoogleAuthProvider();
            try {
                // Iniciar sesión con una ventana emergente de Google
                const result = await firebase.auth().signInWithPopup(provider);
                const user = result.user;

                // Validar correos autorizados
                const correosAutorizados = ['crisrueda99@gmail.com', 'ofixhub@gmail.com'];
                if (!correosAutorizados.includes(user.email)) {
                    await firebase.auth().signOut();
                    alert("Acceso Denegado: Esta cuenta de Google no tiene privilegios de administrador para gestionar OfixHub.");
                    return;
                }

                console.log(`Usuario autenticado: ${user.email}`);

                // Si la autenticación es exitosa y autorizada, se carga el panel
                cargarContenido('pages/admin.html');
                console.log('Admin panel abierto');
            } catch (error) {
                console.error('Error en autenticación:', error);
                alert(`Error al iniciar sesión: ${error.message}`);
            }
        } else {
            console.warn('Firebase Auth no está inicializado, accediendo en modo local/fallback');
            cargarContenido('pages/admin.html');
        }
    }
});

// ==============================
// FORMULARIO DE CONTACTO
// ==============================
function enviarFormulario() {
    const form = document.getElementById('form-google');
    const popup = document.getElementById('popup');
    const okButton = document.getElementById('popup-ok');

    form.submit();
    popup.style.display = 'flex';

    okButton.onclick = () => {
        popup.style.display = 'none';
        form.reset();
    };
}