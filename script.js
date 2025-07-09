document.addEventListener('DOMContentLoaded', () => {
    // --- Referencias a Elementos del DOM ---
    const shopNowBtn = document.getElementById('shopNowBtn');
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    const cartIcon = document.getElementById('cart-icon');
    const cartCountSpan = document.getElementById('cart-count');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartSidebar = document.getElementById('cart-sidebar');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalSpan = document.getElementById('cart-total');
    const clearCartBtn = document.getElementById('clear-cart-btn');
    const emptyCartMessage = document.querySelector('.empty-cart-message');
    const navLinks = document.querySelectorAll('nav ul li a'); // Todos los enlaces de navegación
    const productCards = document.querySelectorAll('.product-card'); // Todas las tarjetas de producto
    const productsHeading = document.getElementById('products-heading'); // Título de la sección de productos
    const contactForm = document.querySelector('.contact-form'); // Formulario de contacto

    // --- Estado del Carrito ---
    let cart = [];

    // --- Funciones del Carrito (sin cambios mayores aquí) ---

    // Cargar el carrito desde localStorage al iniciar la página
    const loadCartFromLocalStorage = () => {
        const storedCart = localStorage.getItem('shoeStyleCart');
        if (storedCart) {
            cart = JSON.parse(storedCart);
            updateCartUI();
        }
    };

    // Guardar el carrito en localStorage para que persista
    const saveCartToLocalStorage = () => {
        localStorage.setItem('shoeStyleCart', JSON.stringify(cart));
    };

    // Actualizar la interfaz de usuario del carrito (contador, lista de ítems, total)
    const updateCartUI = () => {
        cartCountSpan.textContent = cart.reduce((total, item) => total + item.quantity, 0);
        renderCartItems();
        calculateCartTotal();
    };

    // Renderizar (dibujar) los ítems dentro del sidebar del carrito
    const renderCartItems = () => {
        cartItemsContainer.innerHTML = '';

        if (cart.length === 0) {
            emptyCartMessage.style.display = 'block';
            clearCartBtn.style.display = 'none';
            return;
        } else {
            emptyCartMessage.style.display = 'none';
            clearCartBtn.style.display = 'inline-block';
        }

        cart.forEach(item => {
            const cartItemDiv = document.createElement('div');
            cartItemDiv.classList.add('cart-item');
            cartItemDiv.dataset.productId = item.id;

            cartItemDiv.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="item-details">
                    <h5>${item.name}</h5>
                    <p>$${item.price.toFixed(2)}</p>
                </div>
                <div class="item-quantity-controls">
                    <button class="decrease-quantity-btn" data-id="${item.id}">-</button>
                    <span>${item.quantity}</span>
                    <button class="increase-quantity-btn" data-id="${item.id}">+</button>
                </div>
                <button class="remove-item-btn" data-id="${item.id}">Remover</button>
            `;
            cartItemsContainer.appendChild(cartItemDiv);
        });

        document.querySelectorAll('.decrease-quantity-btn').forEach(button => {
            button.addEventListener('click', decreaseQuantity);
        });
        document.querySelectorAll('.increase-quantity-btn').forEach(button => {
            button.addEventListener('click', increaseQuantity);
        });
        document.querySelectorAll('.remove-item-btn').forEach(button => {
            button.addEventListener('click', removeItemFromCart);
        });
    };

    // Calcular y mostrar el precio total del carrito
    const calculateCartTotal = () => {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotalSpan.textContent = total.toFixed(2);
    };

    // Añadir un producto al carrito
    const addProductToCart = (event) => {
        const productCard = event.target.closest('.product-card');
        const productId = event.target.dataset.productId;
        const productName = event.target.dataset.product;
        const productPrice = parseFloat(productCard.querySelector('.price').dataset.price);
        const productImage = productCard.querySelector('img').src;

        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage,
                quantity: 1
            });
        }
        saveCartToLocalStorage();
        updateCartUI();
        showNotification(`"${productName}" agregado al carrito!`);
        openCartSidebar();
    };

    // Aumentar la cantidad de un ítem en el carrito
    const increaseQuantity = (event) => {
        const productId = event.target.dataset.id;
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity++;
            saveCartToLocalStorage();
            updateCartUI();
        }
    };

    // Disminuir la cantidad de un ítem en el carrito
    const decreaseQuantity = (event) => {
        const productId = event.target.dataset.id;
        const item = cart.find(item => item.id === productId);
        if (item && item.quantity > 1) {
            item.quantity--;
            saveCartToLocalStorage();
            updateCartUI();
        } else if (item && item.quantity === 1) {
            removeItemFromCart(event);
        }
    };

    // Remover un ítem específico del carrito
    const removeItemFromCart = (event) => {
        const productId = event.target.dataset.id;
        cart = cart.filter(item => item.id !== productId);
        saveCartToLocalStorage();
        updateCartUI();
        showNotification('Producto removido del carrito.');
    };

    // Vaciar todo el contenido del carrito
    const clearCart = () => {
        if (confirm('¿Estás seguro de que quieres vaciar tu carrito?')) {
            cart = [];
            saveCartToLocalStorage();
            updateCartUI();
            showNotification('El carrito ha sido vaciado.');
            closeCartSidebar();
        }
    };

    // Abrir el sidebar del carrito
    const openCartSidebar = () => {
        cartOverlay.classList.add('active');
        cartSidebar.classList.add('active');
        document.body.style.overflow = 'hidden'; // Evita el scroll del fondo
    };

    // Cerrar el sidebar del carrito
    const closeCartSidebar = () => {
        cartOverlay.classList.remove('active');
        cartSidebar.classList.remove('active');
        document.body.style.overflow = ''; // Habilita el scroll de nuevo
    };

    // Función para mostrar una notificación temporal
    const showNotification = (message) => {
        const notificationDiv = document.createElement('div');
        notificationDiv.classList.add('notification');
        notificationDiv.textContent = message;
        document.body.appendChild(notificationDiv);

        setTimeout(() => {
            notificationDiv.classList.add('hide');
            notificationDiv.addEventListener('transitionend', () => {
                notificationDiv.remove();
            }, { once: true });
        }, 3000);
    };

    // --- Nuevas Funciones de Interacción General ---

    // Función para desplazamiento suave a una sección
    const scrollToSection = (targetId) => {
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
            // Eliminar la clase activa de todos los enlaces de navegación
            navLinks.forEach(link => link.classList.remove('active-nav'));
            // Añadir la clase activa al enlace que se ha clickeado si es un data-nav-target
            const clickedNavLink = document.querySelector(`[data-nav-target="${targetId}"]`);
            if (clickedNavLink) {
                clickedNavLink.classList.add('active-nav');
            }
        }
    };

    // Función para filtrar productos por categoría
    const filterProductsByCategory = (category) => {
        let headingText = 'Todos los Productos';
        if (category) {
            // Asegúrate de limpiar y normalizar la categoría para la comparación
            const lowerCaseCategory = category.toLowerCase();
            headingText = category.charAt(0).toUpperCase() + category.slice(1) + 's'; // Ej: "Hombres"
            if (category === 'deportivo') {
                 headingText = 'Deportivas';
            }


            productCards.forEach(card => {
                const cardCategories = card.dataset.category ? card.dataset.category.split(' ') : [];
                // Verificar si alguna de las categorías del producto coincide con la categoría de filtro
                if (cardCategories.includes(lowerCaseCategory)) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        } else {
            // Si no hay categoría (ej. "Colección" o "Inicio" en el contexto de todos los productos)
            productCards.forEach(card => {
                card.classList.remove('hidden');
            });
        }
        productsHeading.textContent = headingText; // Actualizar el título de la sección de productos

        // Desactivar todos los enlaces de navegación y activar el clicado
        navLinks.forEach(link => link.classList.remove('active-nav'));
        const activeLink = document.querySelector(`[data-category-filter="${category}"]`);
        if (activeLink) {
            activeLink.classList.add('active-nav');
        } else {
            // Si es "Colección" o "Inicio" (que muestra todo), activar el enlace correspondiente
            const allProductsLink = document.querySelector('[data-nav-target="featured-products"]');
            if (allProductsLink) allProductsLink.classList.add('active-nav');
        }

        // Desplazarse a la sección de productos después de filtrar
        document.getElementById('featured-products').scrollIntoView({ behavior: 'smooth' });
    };


    // --- Event Listeners (Escuchadores de Eventos) ---

    // Cargar carrito al cargar la página
    loadCartFromLocalStorage();

    // Evento para el botón "Ver Colección"
    if (shopNowBtn) {
        shopNowBtn.addEventListener('click', (event) => {
            event.preventDefault(); // Prevenir el comportamiento por defecto del botón (si fuera un enlace)
            scrollToSection('featured-products');
            filterProductsByCategory(null); // Mostrar todos los productos
        });
    }

    // Eventos para todos los botones "Agregar al Carrito"
    addToCartButtons.forEach(button => {
        button.addEventListener('click', addProductToCart);
    });

    // Evento para abrir carrito al hacer clic en el ícono
    cartIcon.addEventListener('click', openCartSidebar);

    // Evento para cerrar carrito al hacer clic en el botón de cerrar
    closeCartBtn.addEventListener('click', closeCartSidebar);

    // Evento para cerrar carrito al hacer clic fuera del sidebar (en el overlay)
    cartOverlay.addEventListener('click', (event) => {
        if (event.target === cartOverlay) {
            closeCartSidebar();
        }
    });

    // Evento para el botón "Vaciar Carrito"
    clearCartBtn.addEventListener('click', clearCart);

    // Evento para el botón "Finalizar Compra" (simulado)
    document.querySelector('.checkout-btn').addEventListener('click', () => {
        if (cart.length > 0) {
            alert('¡Gracias por tu compra en ShoeStyle! Hemos procesado tu pedido.');
            cart = [];
            saveCartToLocalStorage();
            updateCartUI();
            closeCartSidebar();
        } else {
            alert('Tu carrito está vacío. ¡Agrega algunos productos antes de finalizar la compra!');
        }
    });

    // Eventos para los enlaces de navegación principales (Inicio, Colección, Contacto)
    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault(); // Previene el salto instantáneo
            const targetId = event.target.dataset.navTarget;
            const categoryFilter = event.target.dataset.categoryFilter;

            if (targetId) {
                scrollToSection(targetId);
                // Si va a una sección como "Colección", muestra todos los productos
                if (targetId === 'featured-products') {
                    filterProductsByCategory(null); // Muestra todos los productos
                }
            } else if (categoryFilter) {
                // Si es un filtro de categoría
                filterProductsByCategory(categoryFilter);
            }
        });
    });

    // Evento para el envío del formulario de contacto (simulado)
    if (contactForm) {
        contactForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Previene el envío real del formulario
            alert('¡Mensaje enviado! Nos pondremos en contacto contigo pronto.');
            contactForm.reset(); // Limpia el formulario
        });
    }

    // Inicializar la vista mostrando todos los productos y activando el enlace "Colección"
    filterProductsByCategory(null); // Asegura que todos los productos estén visibles al cargar
    const initialNavLink = document.querySelector('[data-nav-target="featured-products"]');
    if (initialNavLink) {
        initialNavLink.classList.add('active-nav');
    }


    console.log('ShoeStyle: ¡Página de calzado urbano completamente interactiva cargada!');
});