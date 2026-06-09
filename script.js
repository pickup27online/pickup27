// ============================================================
// CATÁLOGO DE PRODUCTOS
// ============================================================

const CATALOGO = {
    '🍚 Mercado': [
        {
            id: 'arroz_1kg',
            nombre: 'Arroz Rainha Brasil 1kg',
            precio: 580,
            descripcion: 'Arroz integral de alta calidad, perfecto para tu mesa.',
            stock: 50
        },
        {
            id: 'avena_1kg',
            nombre: 'Avena Integral 1kg',
            precio: 670,
            descripcion: 'Avena fresca y refrescante para desayunos nutritivos.',
            stock: 30
        }
    ],
    '🍺 Líquidos': [
        {
            id: 'cerveza_unlaguer',
            nombre: 'Cerveza Unlaguer',
            precio: 210,
            descripcion: 'Cerveza fría y refrescante para disfrutar.',
            stock: 120
        }
    ]
};

// ============================================================
// FUNCIONES DE CARRITO (localStorage)
// ============================================================

function obtenerCarrito() {
    return JSON.parse(localStorage.getItem('carrito')) || {};
}

function guardarCarrito(carrito) {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

function agregarAlCarrito(productoId, cantidad = 1) {
    const carrito = obtenerCarrito();
    const producto = buscarProducto(productoId);
    
    if (!producto) return;

    if (carrito[productoId]) {
        carrito[productoId].cantidad += cantidad;
    } else {
        carrito[productoId] = {
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: cantidad
        };
    }

    guardarCarrito(carrito);
}

function quitarDelCarrito(productoId) {
    const carrito = obtenerCarrito();
    delete carrito[productoId];
    guardarCarrito(carrito);
}

function obtenerTotal() {
    const carrito = obtenerCarrito();
    let total = 0;
    Object.values(carrito).forEach(item => {
        total += item.precio * item.cantidad;
    });
    return total;
}

// ============================================================
// FUNCIONES DE BÚSQUEDA
// ============================================================

function buscarProducto(productoId) {
    for (const categoria in CATALOGO) {
        const producto = CATALOGO[categoria].find(p => p.id === productoId);
        if (producto) return producto;
    }
    return null;
}

function obtenerCategoriaDeProducto(productoId) {
    for (const categoria in CATALOGO) {
        const producto = CATALOGO[categoria].find(p => p.id === productoId);
        if (producto) return categoria;
    }
    return null;
}

// ============================================================
// RENDERIZAR CATÁLOGO
// ============================================================

function mostrarCategorias() {
    const categoriasDiv = document.getElementById('categorias');
    if (!categoriasDiv) return;

    categoriasDiv.innerHTML = '';
    Object.keys(CATALOGO).forEach(categoria => {
        const btn = document.createElement('button');
        btn.className = 'btn-categoria';
        btn.textContent = categoria;
        btn.dataset.categoria = categoria;
        btn.addEventListener('click', () => {
            document.querySelectorAll('.btn-categoria').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            mostrarProductos(categoria);
        });
        categoriasDiv.appendChild(btn);
    });

    // Marcar la primera como activa
    const firstBtn = categoriasDiv.querySelector('.btn-categoria');
    if (firstBtn) firstBtn.classList.add('active');
}

function mostrarProductos(categoria) {
    const productosDiv = document.getElementById('productos');
    if (!productosDiv) return;

    const productos = CATALOGO[categoria] || [];
    productosDiv.innerHTML = '';

    productos.forEach(producto => {
        const div = document.createElement('div');
        div.className = 'producto';

        const estadoStock = producto.stock > 0 ? `Stock: ${producto.stock}` : 'Agotado';
        const colorStock = producto.stock > 0 ? '#27ae60' : '#e74c3c';

        div.innerHTML = `
            <div class="info-producto">
                <div class="nombre-producto">${producto.nombre}</div>
                <div class="precio-producto">${producto.precio} CUP</div>
                <div class="stock-producto" style="color: ${colorStock};">${estadoStock}</div>
            </div>
            <div class="controles-producto">
                <button class="btn-cantidad" onclick="cambiarCantidad('${producto.id}', -1)" ${producto.stock === 0 ? 'disabled' : ''}>−</button>
                <span class="cantidad-mostrada" id="cant-${producto.id}">1</span>
                <button class="btn-cantidad" onclick="cambiarCantidad('${producto.id}', 1)" ${producto.stock === 0 ? 'disabled' : ''}>+</button>
                <button class="btn-primary" onclick="agregarAlCarrito('${producto.id}', parseInt(document.getElementById('cant-${producto.id}').textContent)); document.getElementById('cant-${producto.id}').textContent = '1'; alert('✅ Agregado al carrito')" ${producto.stock === 0 ? 'disabled' : ''}>Agregar</button>
            </div>
        `;

        productosDiv.appendChild(div);
    });
}

function cambiarCantidad(productoId, cambio) {
    const elemento = document.getElementById(`cant-${productoId}`);
    let cantidad = parseInt(elemento.textContent) || 1;
    cantidad = Math.max(1, Math.min(99, cantidad + cambio));
    elemento.textContent = cantidad;
}

// ============================================================
// CARRITO
// ============================================================

function mostrarCarrito() {
    const carritoDiv = document.getElementById('carrito-contenido');
    const totalDiv = document.getElementById('total');
    
    if (!carritoDiv) return;

    const carrito = obtenerCarrito();
    carritoDiv.innerHTML = '';

    if (Object.keys(carrito).length === 0) {
        carritoDiv.innerHTML = '<div class="carrito-vacio">🛒 Tu carrito está vacío</div>';
        if (totalDiv) totalDiv.textContent = '0 CUP';
        return;
    }

    Object.entries(carrito).forEach(([productoId, item]) => {
        const subtotal = item.precio * item.cantidad;
        const div = document.createElement('div');
        div.className = 'item-carrito';

        div.innerHTML = `
            <div class="detalles-item">
                <div class="nombre-item">${item.nombre}</div>
                <div class="cantidad-precio-item">${item.cantidad} x ${item.precio} CUP</div>
            </div>
            <div class="subtotal-item">${subtotal} CUP</div>
            <button class="btn-eliminar" onclick="quitarDelCarrito('${productoId}'); mostrarCarrito()">🗑️ Quitar</button>
        `;

        carritoDiv.appendChild(div);
    });

    // Actualizar total
    if (totalDiv) {
        totalDiv.textContent = `${obtenerTotal()} CUP`;
    }
}

// ============================================================
// CONFIRMACIÓN
// ============================================================

function mostrarResumenPedido() {
    const resumenDiv = document.getElementById('resumen-pedido');
    const totalDiv = document.getElementById('total-pedido');
    
    if (!resumenDiv) return;

    const carrito = obtenerCarrito();
    resumenDiv.innerHTML = '';

    Object.entries(carrito).forEach(([productoId, item]) => {
        const subtotal = item.precio * item.cantidad;
        const div = document.createElement('div');
        div.className = 'item-pedido';

        div.innerHTML = `
            <div>
                <strong>${item.nombre}</strong><br>
                ${item.cantidad} x ${item.precio} CUP
            </div>
            <strong>${subtotal} CUP</strong>
        `;

        resumenDiv.appendChild(div);
    });

    if (totalDiv) {
        totalDiv.textContent = `${obtenerTotal()} CUP`;
    }
}

// ============================================================
// CONEXIÓN CON TELEGRAM (placeholder por ahora)
// ============================================================

function enviarPedidoATelegram(carrito) {
    const resumen = Object.entries(carrito).map(([id, item]) => {
        return `${item.nombre}\n${item.cantidad} x ${item.precio} CUP = ${item.precio * item.cantidad} CUP`;
    }).join('\n\n');

    const total = obtenerTotal();
    const mensaje = `🛍️ NUEVO PEDIDO\n\n${resumen}\n\n💰 TOTAL: ${total} CUP`;

    // Aquí se conectará con el bot de Telegram
    console.log('Pedido a enviar:', mensaje);
    
    // Por ahora, solo confirmamos localmente
    alert('✅ Pedido confirmado!\n\nTe contactaremos pronto por Telegram para confirmar.\n\n' + mensaje);

    // Limpiar carrito
    localStorage.removeItem('carrito');
    
    // Redirigir al inicio
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

// ============================================================
// INICIALIZACIÓN
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    // El carrito persiste automáticamente con localStorage
});
