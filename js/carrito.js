/* ============================================================
   MALVA BAKERY - LÓGICA DEL CARRITO
   Usa localStorage para que el carrito se mantenga
   mientras navegás entre páginas del sitio.
============================================================ */

const CARRITO_KEY = 'malva_carrito';
const COSTO_ENVIO = 2500;

/* Lee el carrito guardado, o devuelve un array vacío */
function obtenerCarrito() {
    const data = localStorage.getItem(CARRITO_KEY);
    return data ? JSON.parse(data) : [];
}

/* Guarda el carrito y actualiza el contador del header */
function guardarCarrito(carrito) {
    localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito));
    actualizarContador();
}

/* Convierte "$5.150" -> 5150 */
function precioATexto(precioTexto) {
    return parseInt(precioTexto.replace(/[^0-9]/g, ''), 10);
}

/* Convierte 5150 -> "$5.150" */
function formatearPrecio(numero) {
    return '$' + numero.toLocaleString('es-AR');
}

/* Agrega un producto al carrito (o suma 1 si ya está) */
function agregarAlCarrito(nombre, precio, imagen) {
    const carrito = obtenerCarrito();
    const existente = carrito.find(item => item.nombre === nombre);

    if (existente) {
        existente.cantidad += 1;
    } else {
        carrito.push({ nombre, precio, imagen, cantidad: 1 });
    }

    guardarCarrito(carrito);
    mostrarAvisoAgregado(nombre);
}

/* Cambia la cantidad de un producto (delta puede ser +1 o -1) */
function cambiarCantidad(nombre, delta) {
    let carrito = obtenerCarrito();
    const item = carrito.find(p => p.nombre === nombre);
    if (!item) return;

    item.cantidad += delta;

    if (item.cantidad <= 0) {
        carrito = carrito.filter(p => p.nombre !== nombre);
    }

    guardarCarrito(carrito);
    renderizarCarrito();
}

/* Elimina un producto por completo */
function eliminarDelCarrito(nombre) {
    let carrito = obtenerCarrito();
    carrito = carrito.filter(p => p.nombre !== nombre);
    guardarCarrito(carrito);
    renderizarCarrito();
}

/* Calcula el subtotal de todos los productos */
function calcularSubtotal() {
    const carrito = obtenerCarrito();
    return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
}

/* Actualiza el numerito en el ícono del carrito (header) */
function actualizarContador() {
    const carrito = obtenerCarrito();
    const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
    const contadores = document.querySelectorAll('.contador-carrito');

    contadores.forEach(contador => {
        if (totalItems > 0) {
            contador.textContent = totalItems;
            contador.style.display = 'flex';
        } else {
            contador.style.display = 'none';
        }
    });
}

/* Muestra un mensajito breve cuando se agrega un producto */
function mostrarAvisoAgregado(nombre) {
    const aviso = document.createElement('div');
    aviso.className = 'aviso-agregado';
    aviso.textContent = `${nombre} agregado al carrito`;
    document.body.appendChild(aviso);

    setTimeout(() => aviso.classList.add('mostrar'), 10);
    setTimeout(() => {
        aviso.classList.remove('mostrar');
        setTimeout(() => aviso.remove(), 300);
    }, 1800);
}

/* ============================================================
   RENDERIZADO DEL CARRITO (solo se usa en carrito.html)
============================================================ */
function renderizarCarrito() {
    const lista = document.getElementById('carrito-lista-items');
    if (!lista) return; // No estamos en carrito.html

    const carrito = obtenerCarrito();

    if (carrito.length === 0) {
        lista.innerHTML = '<p class="carrito-vacio">Tu carrito está vacío. <a href="tienda.html">Ir a la tienda →</a></p>';
        document.querySelectorAll('.resumen-subtotal, .resumen-envio, .resumen-total-monto').forEach(el => el.textContent = formatearPrecio(0));
        const botonContinuar = document.querySelector('.boton-checkout');
        if (botonContinuar) botonContinuar.classList.add('boton-deshabilitado');
        return;
    }

    lista.innerHTML = carrito.map(item => `
        <div class="carrito-item">
            <img src="${item.imagen}" alt="${item.nombre}">
            <div class="carrito-item-info">
                <h5>${item.nombre}</h5>
                <p class="carrito-item-precio">${formatearPrecio(item.precio)}</p>
            </div>
            <div class="carrito-item-cantidad">
                <button class="cantidad-btn" onclick="cambiarCantidad('${item.nombre}', -1)">−</button>
                <span>${item.cantidad}</span>
                <button class="cantidad-btn" onclick="cambiarCantidad('${item.nombre}', 1)">+</button>
            </div>
            <button class="carrito-item-eliminar" title="Eliminar" onclick="eliminarDelCarrito('${item.nombre}')">&times;</button>
        </div>
    `).join('');

    const subtotal = calcularSubtotal();
    const total = subtotal + COSTO_ENVIO;

    document.querySelectorAll('.resumen-subtotal').forEach(el => el.textContent = formatearPrecio(subtotal));
    document.querySelectorAll('.resumen-envio').forEach(el => el.textContent = formatearPrecio(COSTO_ENVIO));
    document.querySelectorAll('.resumen-total-monto').forEach(el => el.textContent = formatearPrecio(total));

    const botonContinuar = document.querySelector('.boton-checkout');
    if (botonContinuar) botonContinuar.classList.remove('boton-deshabilitado');
}

/* ============================================================
   RENDERIZADO DEL RESUMEN EN PAGO (solo se usa en pago.html)
============================================================ */
function renderizarResumenPago() {
    const lista = document.getElementById('resumen-pago-items');
    if (!lista) return; // No estamos en pago.html

    const carrito = obtenerCarrito();

    if (carrito.length === 0) {
        window.location.href = 'carrito.html';
        return;
    }

    lista.innerHTML = carrito.map(item => `
        <div class="resumen-producto-mini">
            <p>${item.nombre} <span>x${item.cantidad}</span></p>
            <p>${formatearPrecio(item.precio * item.cantidad)}</p>
        </div>
    `).join('');

    const subtotal = calcularSubtotal();
    const total = subtotal + COSTO_ENVIO;

    document.querySelectorAll('.resumen-subtotal').forEach(el => el.textContent = formatearPrecio(subtotal));
    document.querySelectorAll('.resumen-envio').forEach(el => el.textContent = formatearPrecio(COSTO_ENVIO));
    document.querySelectorAll('.resumen-total-monto').forEach(el => el.textContent = formatearPrecio(total));
}

/* ============================================================
   GUARDA EL ÚLTIMO PEDIDO ANTES DE CONFIRMAR
   (para que confirmacion.html pueda mostrarlo)
============================================================ */
function confirmarPedido() {
    const carrito = obtenerCarrito();
    if (carrito.length === 0) return;

    const subtotal = calcularSubtotal();
    const total = subtotal + COSTO_ENVIO;
    const numeroPedido = 'MB-' + Math.floor(10000 + Math.random() * 89999);

    const pedido = { carrito, subtotal, envio: COSTO_ENVIO, total, numeroPedido };
    localStorage.setItem('malva_ultimo_pedido', JSON.stringify(pedido));

    /* Vacía el carrito porque el pedido ya se hizo */
    localStorage.removeItem(CARRITO_KEY);
}

/* ============================================================
   RENDERIZADO DE LA CONFIRMACIÓN (solo se usa en confirmacion.html)
============================================================ */
function renderizarConfirmacion() {
    const contenedor = document.getElementById('confirmacion-resumen-items');
    if (!contenedor) return; // No estamos en confirmacion.html

    const data = localStorage.getItem('malva_ultimo_pedido');
    if (!data) {
        window.location.href = '../index.html';
        return;
    }

    const pedido = JSON.parse(data);

    document.querySelector('.confirmacion-numero h3').textContent = '#' + pedido.numeroPedido;

    contenedor.innerHTML = pedido.carrito.map(item => `
        <div class="resumen-producto-mini">
            <p>${item.nombre} <span>x${item.cantidad}</span></p>
            <p>${formatearPrecio(item.precio * item.cantidad)}</p>
        </div>
    `).join('');

    document.querySelectorAll('.resumen-subtotal').forEach(el => el.textContent = formatearPrecio(pedido.subtotal));
    document.querySelectorAll('.resumen-envio').forEach(el => el.textContent = formatearPrecio(pedido.envio));
    document.querySelectorAll('.resumen-total-monto').forEach(el => el.textContent = formatearPrecio(pedido.total));
}

/* ============================================================
   INICIALIZACIÓN: se ejecuta en todas las páginas que incluyan este script
============================================================ */
document.addEventListener('DOMContentLoaded', function () {
    actualizarContador();
    renderizarCarrito();
    renderizarResumenPago();
    renderizarConfirmacion();

    /* Conecta todos los botones "AGREGAR AL CARRITO" de la página */
    document.querySelectorAll('.boton[data-nombre]').forEach(boton => {
        boton.addEventListener('click', function () {
            const nombre = this.dataset.nombre;
            const precio = parseInt(this.dataset.precio, 10);
            const imagen = this.dataset.imagen;
            agregarAlCarrito(nombre, precio, imagen);
        });
    });

    /* Conecta el botón de confirmar pago, si existe en esta página */
    const botonConfirmar = document.getElementById('boton-confirmar-pago');
    if (botonConfirmar) {
        botonConfirmar.addEventListener('click', function (e) {
            confirmarPedido();
        });
    }
});