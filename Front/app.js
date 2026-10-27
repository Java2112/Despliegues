// URL base de la API del Backend (definida en config.js o fallback a localhost)
const API_URL = (typeof CONFIG !== 'undefined' && CONFIG.API_URL) ? CONFIG.API_URL : 'http://localhost:3000/api/productos';

// Elementos del DOM
const productForm = document.getElementById('product-form');
const productIdInput = document.getElementById('product-id');
const nombreInput = document.getElementById('nombre');
const precioInput = document.getElementById('precio');
const descripcionInput = document.getElementById('descripcion');
const formTitle = document.getElementById('form-title');
const btnSubmit = document.getElementById('btn-submit');
const btnCancel = document.getElementById('btn-cancel');
const btnRefresh = document.getElementById('btn-refresh');
const productsTbody = document.getElementById('products-tbody');
const alertBox = document.getElementById('alert-box');

let alertTimeout = null;

// ==========================================
// FUNCIONES DE UTILIDAD
// ==========================================

function showAlert(message, type = 'success') {
    clearTimeout(alertTimeout);
    alertBox.textContent = message;
    alertBox.className = `alert-box ${type}`;
    alertBox.classList.remove('hidden');

    alertTimeout = setTimeout(() => {
        alertBox.classList.add('hidden');
    }, 4000);
}

function resetForm() {
    productForm.reset();
    productIdInput.value = '';
    formTitle.textContent = 'Agregar Producto';
    btnSubmit.textContent = 'Guardar Producto';
    btnCancel.classList.add('hidden');
}

// ==========================================
// OPERACIONES CRUD
// ==========================================

// 1. LEER PRODUCTOS (READ)
async function getProducts() {
    productsTbody.innerHTML = `
        <tr>
            <td colspan="5" class="text-center text-muted">Cargando productos...</td>
        </tr>
    `;

    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`Error en el servidor: ${response.status}`);
        }

        const products = await response.json();
        renderProducts(products);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        productsTbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted" style="color: #dc2626;">
                    No se pudo conectar con el backend (http://localhost:3000).<br>
                    Asegúrate de que el servidor Node.js y MySQL estén activos.
                </td>
            </tr>
        `;
    }
}

// Renderizar tabla
function renderProducts(products) {
    if (!products || products.length === 0) {
        productsTbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted">No hay productos registrados.</td>
            </tr>
        `;
        return;
    }

    productsTbody.innerHTML = products.map(p => `
        <tr>
            <td><strong>#${p.id}</strong></td>
            <td>${escapeHtml(p.nombre)}</td>
            <td class="price-tag">$${parseFloat(p.precio).toFixed(2)}</td>
            <td>${p.descripcion ? escapeHtml(p.descripcion) : '<span class="text-muted">Sin descripción</span>'}</td>
            <td>
                <div class="actions-cell">
                    <button class="btn btn-sm btn-edit" onclick="setupEdit(${p.id}, '${escapeQuote(p.nombre)}', ${p.precio}, '${escapeQuote(p.descripcion || '')}')">
                        Editar
                    </button>
                    <button class="btn btn-sm btn-delete" onclick="deleteProduct(${p.id}, '${escapeQuote(p.nombre)}')">
                        Eliminar
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Escapar texto para HTML seguro
function escapeHtml(text) {
    if (!text) return '';
    return text.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function escapeQuote(text) {
    if (!text) return '';
    return text.toString().replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

// 2. CREAR Y ACTUALIZAR PRODUCTO (CREATE / UPDATE)
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = productIdInput.value;
    const productData = {
        nombre: nombreInput.value.trim(),
        precio: parseFloat(precioInput.value),
        descripcion: descripcionInput.value.trim()
    };

    const isEditing = Boolean(id);
    const url = isEditing ? `${API_URL}/${id}` : API_URL;
    const method = isEditing ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error al procesar la solicitud');
        }

        showAlert(isEditing ? '¡Producto actualizado con éxito!' : '¡Producto agregado con éxito!', 'success');
        resetForm();
        getProducts();
    } catch (error) {
        console.error('Error:', error);
        showAlert(error.message, 'error');
    }
});

// Preparar formulario para edición
window.setupEdit = function (id, nombre, precio, descripcion) {
    productIdInput.value = id;
    nombreInput.value = nombre;
    precioInput.value = precio;
    descripcionInput.value = descripcion;

    formTitle.textContent = `Editar Producto #${id}`;
    btnSubmit.textContent = 'Actualizar Producto';
    btnCancel.classList.remove('hidden');

    // Scroll suave hacia el formulario en pantallas pequeñas
    productForm.scrollIntoView({ behavior: 'smooth' });
};

// Cancelar edición
btnCancel.addEventListener('click', () => {
    resetForm();
});

// 3. ELIMINAR PRODUCTO (DELETE)
window.deleteProduct = async function (id, nombre) {
    const confirmDelete = confirm(`¿Estás seguro de que deseas eliminar el producto "${nombre}" (ID: ${id})?`);
    if (!confirmDelete) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error al eliminar el producto');
        }

        showAlert('¡Producto eliminado exitosamente!', 'success');

        // Si se estaba editando ese mismo producto, limpiar el formulario
        if (productIdInput.value == id) {
            resetForm();
        }

        getProducts();
    } catch (error) {
        console.error('Error al eliminar:', error);
        showAlert(error.message, 'error');
    }
};

// Botón de recarga manual
btnRefresh.addEventListener('click', () => {
    getProducts();
});

// Cargar productos al inicio
document.addEventListener('DOMContentLoaded', () => {
    getProducts();
});
