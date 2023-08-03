//Declaro producto y un render para las cards

class Producto {
    constructor(id, nombre, color, descripcion, precio, linkfoto) {
        this.id = id;
        this.nombre = nombre;
        this.color = color;
        this.descripcion = descripcion;
        this.precio = precio;
        this.linkfoto = linkfoto;
    }

    render() {
        return `
            <div class="card mb-4">
                <div class="card-body p-4  cardProductos">
                    <div class="row d-flex justify-content-between align-items-center">
                        <div class="col-md-2 col-lg-2 col-xl-2">
                            <img src="${this.linkfoto}" class="rounded-3 fotoCard" alt="${this.nombre}">
                        </div>
                        <div class="col-md-2 col-lg-2 col-xl-2">
                            <p class="lead fw-normal mb-2 nombre">${this.nombre}</p>
                            <p><span class="text-muted">Color: </span><span class="color">${this.color}</span></p>
                        </div>
                        <div class="col-md-3 col-lg-3 col-xl-2 d-flex hidden">
                            <input id="form${this.id}" min="0" name="quantity" type="number" class="form-control form-control-sm hidden">
                        </div>
                        <div class="col-md-3 col-lg-2 col-xl-2 offset-lg-1">
                        <h5 class="mb-0 precio"><span>$ </span>${this.precio}</h5>
                        </div>
                        <div class="col-md-3 col-lg-3 col-xl-3 d-flex">
                            <p class="descripcion">${this.descripcion}</p>
                            <button class="btn btn-success botonAgregar">+</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}
// Hago fetch de productos.json con límite y boton adelante

let paginaActual = 1;
const productosPorPagina = 5;

async function fetchProductos() {
    try {
        const response = await fetch('./productos.json');
        const data = await response.json();

        const inicioIndex = (paginaActual - 1) * productosPorPagina;
        const finIndex = inicioIndex + productosPorPagina;
        const productosContenedor = document.querySelector('.productosJson');

        productosContenedor.innerHTML = '';

        for (let i = inicioIndex; i < finIndex && i < data.length; i++) {
            const item = data[i];
            const producto = new Producto(item.id, item.nombre, item.color, item.descripcion, item.precio, item.linkfoto);
            const productoRendered = producto.render();
            productosContenedor.insertAdjacentHTML('beforeend', productoRendered);

            const botonAgregar = productosContenedor.querySelector(`#form${producto.id}`).closest('.card').querySelector('.botonAgregar');
            botonAgregar.addEventListener('click', () => {
                agregarAlCarrito(producto);
            });
        }

        const botonAdelante = document.getElementById('botonAdelante');
        botonAdelante.disabled = finIndex >= data.length;
    } catch (error) {
        console.error('Error fetching productos:', error);
    }
}

// Página mostrada y boton atras

function mostrarPagina(pagina) {
    paginaActual = pagina;
    fetchProductos();
    document.getElementById('paginaActual').textContent = pagina;
}

document.getElementById('botonAtras').addEventListener('click', () => {
    if (paginaActual > 1) {
        mostrarPagina(paginaActual - 1);
    }
});

document.getElementById('botonAdelante').addEventListener('click', () => {
    mostrarPagina(paginaActual + 1);
});

const carrito = [];

//Funciones que agregan productos al carrito y la actualización del mismo

function agregarAlCarrito(producto) {
    const productoExistente = carrito.find(item => item.id === producto.id);

    if (!productoExistente) {
        carrito.push({ ...producto, cantidad: 1 });
    } else {
        productoExistente.cantidad++;
    }

    actualizarCarrito();
}

function actualizarCarrito() {
    const carritoContainer = document.querySelector('.carrito');
    carritoContainer.innerHTML = '';

    carrito.forEach((producto, index) => {
        carritoContainer.innerHTML += renderProductoEnCarrito(producto, index);
    });

    recalcularPrecioTotal();
}
//Función render específico del carrito
function renderProductoEnCarrito(producto, index) {
    return `
        <div class="carrito-item">
            <div class="card mb-4">
                <div class="card-body p-4 cardProductos">
                    <div class="row d-flex justify-content-between align-items-center">
                        <div class="col-md-2 col-lg-2 col-xl-2">
                            <img src="${producto.linkfoto}" class="rounded-3 fotoCard" alt="${producto.nombre}">
                        </div>
                        <div class="col-md-2 col-lg-2 col-xl-2">
                            <p class="lead fw-normal mb-2 nombre">${producto.nombre}</p>
                            <p><span class="text-muted">Color: </span><span class="color">${producto.color}</span></p>
                        </div>
                        <div class="col-md-3 col-lg-3 col-xl-2 d-flex">
                        <input id="form${producto.id}" min="1" name="quantity" type="number" class="cantidadProducto" value="${producto.cantidad}">
                        </div>
                        <div class="col-md-3 col-lg-2 col-xl-2 offset-lg-1">
                        <span class="signoPeso">$ </span><h5 class="mb-0 precio h5precio">${producto.precio}</h5>
                        </div>
                        <div class="col-md-3 col-lg-3 col-xl-3 d-flex">
                            <p class="descripcion">${producto.descripcion}</p>
                            <button class="btn btn-danger botonEliminar" data-index="${index}">x</button>
                            <div class="precioTotal hidden">${producto.precio * (producto.cantidad || 1)}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

//Evento eliminar
document.addEventListener('click', event => {
    if (event.target.classList.contains('botonEliminar')) {
    Swal.fire({
        title: 'Está seguro de eliminar el producto?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, borrar',
        cancelButtonText: 'No, volver'
    }).then((result) => {
        if (result.isConfirmed) {
            const itemIndex = parseInt(event.target.getAttribute('data-index'));
            carrito.splice(itemIndex, 1);
            actualizarCarrito();
            Swal.fire({
                title: 'Borrado!',
                icon: 'success',
                text: 'El archivo ha sido borrado'
            });
        } else { 
        }
    });
    }
});

//Evento de precio total y función
document.addEventListener('input', event => {
    if (event.target.classList.contains('cantidadProducto')) {
        const inputCantidad = event.target;
        const productoItem = inputCantidad.closest('.carrito-item');

        const productoId = parseInt(inputCantidad.getAttribute('id').replace('form', ''));
        const producto = carrito.find(item => item.id === productoId);

        if (producto) {
            producto.cantidad = parseInt(inputCantidad.value);

            const precioUnitario = producto.precio;
            const precioTotal = producto.cantidad * precioUnitario;

            const precioTotalElement = productoItem.querySelector('.precioTotal');
            precioTotalElement.textContent = precioTotal;
            recalcularPrecioTotal();
        }
    }
});

function recalcularPrecioTotal() {
    const carritoItems = document.querySelectorAll('.carrito-item');
    let total = 0;

    carritoItems.forEach(carritoItem => {
        const cantidad = parseInt(carritoItem.querySelector('.cantidadProducto').value);
        const precioUnitario = parseFloat(carritoItem.querySelector('.precio').textContent);
        const precioTotal = cantidad * precioUnitario;

        total += precioTotal;
    });

    const precioTotalContainer = document.querySelector('#precioTotalGeneral'); // Aquí cambia a '.precioTotalGeneral'
    precioTotalContainer.textContent = total; // Actualiza el contenido del precio total general
}

//Guardar y cargar Localstorage

function guardarCarritoEnLocalStorage() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

const botonGuardar = document.getElementById('botonGuardar');
botonGuardar.addEventListener('click', () => {
    guardarCarritoEnLocalStorage();
    console.log('Carrito guardado en el localStorage.');
    Toastify({
        text: "Carrito guardado!",
        duration: 3000,
        gravity: 'top',
        position: 'right',
        style: {
        background: 'linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(42,121,9,1) 35%, rgba(61,122,134,1) 100%)',
        border: '2px solid #3d3a3a',
        height: '80px',
        width: '220px',
        textAlign: 'center',
        }
    }).showToast();
});

function cargarCarritoDesdeLocalStorage() {
    const carritoGuardado = localStorage.getItem('carrito');
    
    if (carritoGuardado) {
        carrito.push(...JSON.parse(carritoGuardado));
        actualizarCarrito(); 
    }
}

//Boton pago
const realizarPago = document.getElementById('botonPago');
realizarPago.addEventListener('click', () => {
    Swal.fire({
        title: '¿Confirma la compra?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, confirmar',
        cancelButtonText: 'No, volver'
    }).then((result) => { 
        if (result.isConfirmed) {
            localStorage.removeItem('carrito');
            carrito.length = 0;
            actualizarCarrito();
            recalcularPrecioTotal();
            Swal.fire({
                title: 'Pagado!',
                icon: 'success',
                text: 'Gracias por su compra'
            });
        } else {
        }
    });
});

mostrarPagina(1);
cargarCarritoDesdeLocalStorage();