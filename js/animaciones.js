/* ============================================================
   MALVA BAKERY - ANIMACIONES
   Maneja las animaciones al hacer scroll usando
   IntersectionObserver (moderno, liviano, sin librerías).
============================================================ */

document.addEventListener('DOMContentLoaded', function () {

    /* --------------------------------------------------------
       ANIMACIONES AL HACER SCROLL
       Agrega la clase "visible" cuando el elemento entra
       en pantalla. El CSS se encarga del efecto visual.
    -------------------------------------------------------- */

    const elementosAnimados = document.querySelectorAll(
        '.producto, .seccion-productos, .titulo-subtitulo-productos, ' +
        '.newsletter, .footer, .seccion-texto, .seguinos, ' +
        '.contenedor-contacto, .seccion-tienda .titulo-subtitulo-tienda, ' +
        '.confirmacion-detalle, .seccion-confirmacion, ' +
        '.pasos-checkout, .checkout-grid, ' +
        '.img-nosotros, .figcaption-personalizado'
    );

    const observadorScroll = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (entrada) {
            if (entrada.isIntersecting) {
                entrada.target.classList.add('visible');
                /* Una vez visible, deja de observar ese elemento */
                observadorScroll.unobserve(entrada.target);
            }
        });
    }, {
        threshold: 0.12,   /* Se activa cuando el 12% del elemento es visible */
        rootMargin: '0px 0px -40px 0px'  /* Un poco antes del borde inferior */
    });

    elementosAnimados.forEach(function (el) {
        el.classList.add('animar-scroll');
        observadorScroll.observe(el);
    });


    /* --------------------------------------------------------
       ANIMACIÓN ESCALONADA DE PRODUCTOS
       Los productos dentro de una sección aparecen
       uno a uno con un pequeño delay entre cada uno.
    -------------------------------------------------------- */

    const seccionesProductos = document.querySelectorAll(
        '.seccion-productos, .seccion-tienda'
    );

    seccionesProductos.forEach(function (seccion) {
        const productos = seccion.querySelectorAll('.producto');
        productos.forEach(function (producto, index) {
            producto.style.transitionDelay = (index * 80) + 'ms';
        });
    });


    /* --------------------------------------------------------
       ANIMACIÓN DEL HEADER AL HACER SCROLL
       El header se vuelve un poco más compacto y agrega
       una sombra suave cuando el usuario scrollea hacia abajo.
    -------------------------------------------------------- */

    const header = document.querySelector('header');

    if (header) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 30) {
                header.classList.add('header-scrolled');
            } else {
                header.classList.remove('header-scrolled');
            }
        }, { passive: true });
    }


    /* --------------------------------------------------------
       ANIMACIÓN DE LA IMAGEN HERO AL HACER SCROLL
       Efecto parallax suave en la imagen del hero.
    -------------------------------------------------------- */

    const heroImg = document.querySelector('section figure img');

    if (heroImg) {
        window.addEventListener('scroll', function () {
            const scrollY = window.scrollY;
            heroImg.style.transform = 'translateY(' + (scrollY * 0.15) + 'px)';
        }, { passive: true });
    }

});