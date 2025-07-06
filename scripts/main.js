// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
const booksGrid = document.getElementById('books-grid');
const featuredBooks = document.getElementById('featured-books');
const cartIcon = document.getElementById('cart-icon');
const cartDropdown = document.getElementById('cart-dropdown');
const cartItems = document.getElementById('cart-items');
const cartCount = document.querySelector('.cart-count');
const cartTotal = document.getElementById('cart-total');
const clearCartBtn = document.getElementById('clear-cart');
const searchInput = document.getElementById('search-input');
const contactForm = document.getElementById('contact-form');
const subscribeBtn = document.getElementById('subscribe-btn');
const newsletterEmail = document.getElementById('newsletter-email');
const modal = document.getElementById('thankyou-modal');
const orderModal = document.getElementById('order-confirmation');
const closeModals = document.querySelectorAll('.close-modal');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const navLinks = document.querySelectorAll('.nav-link');
const pageContainers = document.querySelectorAll('.page-container');
const checkoutBtn = document.getElementById('checkout');

// Initialize cart and theme
let cart = JSON.parse(sessionStorage.getItem('cart')) || [];
let darkMode = localStorage.getItem('darkMode') === 'true';

// Initialize the page
function init() {
    initTheme();
    renderBooks(featuredBooks, books.slice(0, 6)); // Featured books
    renderBooks(booksGrid, books); // All books in gallery
    updateCartUI();
    
    // Event listeners
    themeToggle.addEventListener('click', toggleTheme);
    cartIcon.addEventListener('click', toggleCartDropdown);
    searchInput.addEventListener('input', searchBooks);
    clearCartBtn.addEventListener('click', clearCart);
    contactForm.addEventListener('submit', handleContactSubmit);
    subscribeBtn.addEventListener('click', handleSubscribe);
    checkoutBtn.addEventListener('click', handleCheckout);
    
    // Close modals
    closeModals.forEach(closeBtn => {
        closeBtn.addEventListener('click', closeModalFunc);
    });
    
    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navigateToPage(link.dataset.page);
        });
    });
}

// Initialize theme
function initTheme() {
    if (darkMode) {
        body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        body.classList.remove('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
}

// Toggle dark/light mode
function toggleTheme() {
    darkMode = !darkMode;
    localStorage.setItem('darkMode', darkMode);
    initTheme();
}

// Render books with cover images
function renderBooks(container, booksToRender) {
    container.innerHTML = '';
    booksToRender.forEach(book => {
        const bookElement = document.createElement('div');
        bookElement.className = 'book-card';
        bookElement.innerHTML = `
            <div class="book-img">
                <img src="${book.image}" alt="Cover of ${book.title}">
            </div>
            <div class="book-info">
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author"> ${book.author}</p>
                <p class="book-price">$${book.price.toFixed(2)}</p>
                <div class="book-actions">
                    <button class="add-to-cart" data-id="${book.id}">Add to Cart</button>
                </div>
            </div>
        `;
        container.appendChild(bookElement);
    });
    
    // Add event listeners to Add to Cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', addToCart);
    });
}

// Add to cart
function addToCart(event) {
    const bookId = parseInt(event.target.getAttribute('data-id'));
    const book = books.find(b => b.id === bookId);
    
    // Check if book is already in cart
    const existingItem = cart.find(item => item.id === bookId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: book.id,
            title: book.title,
            price: book.price,
            image: book.image, // Store image in cart
            quantity: 1
        });
    }
    
    // Update cart in session storage
    sessionStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart UI
    updateCartUI();
    
    // Show confirmation
    modalTitle.textContent = 'Added to Cart!';
    modalMessage.textContent = `${book.title} has been added to your shopping cart.`;
    modal.style.display = 'flex';
}

// Update cart UI
function updateCartUI() {
    // Update cart count
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = count;
    
    // Update cart items
    cartItems.innerHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        total += item.price * item.quantity;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-img">
                <img src="${item.image}" alt="${item.title}">
            </div>
            <div class="cart-item-info">
                <div class="cart-item-title">${item.title}</div>
                <div class="cart-item-price">$${item.price.toFixed(2)} × ${item.quantity}</div>
                <div class="cart-item-controls">
                    <button class="quantity-btn minus" data-id="${item.id}">-</button>
                    <span class="cart-item-quantity">${item.quantity}</span>
                    <button class="quantity-btn plus" data-id="${item.id}">+</button>
                    <button class="remove-item" data-id="${item.id}" style="margin-left: auto; background: none; border: none; color: var(--accent); cursor: pointer;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        cartItems.appendChild(cartItem);
    });
    
    // Update total
    cartTotal.textContent = `$${total.toFixed(2)}`;
    
    // Reattach event listeners to cart controls
    attachCartEventListeners();
}

// Attach event listeners to cart controls
function attachCartEventListeners() {
    // Minus buttons
    document.querySelectorAll('.minus').forEach(button => {
        button.addEventListener('click', decreaseQuantity);
    });
    
    // Plus buttons
    document.querySelectorAll('.plus').forEach(button => {
        button.addEventListener('click', increaseQuantity);
    });
    
    // Remove buttons
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', removeItem);
    });
}

// Decrease quantity
function decreaseQuantity(event) {
    // Prevent cart from closing
    event.stopPropagation();
    
    const id = parseInt(event.target.getAttribute('data-id'));
    const item = cart.find(item => item.id === id);
    
    if (item.quantity > 1) {
        item.quantity--;
    } else {
        cart = cart.filter(item => item.id !== id);
    }
    
    sessionStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
}

// Increase quantity
function increaseQuantity(event) {
    // Prevent cart from closing
    event.stopPropagation();
    
    const id = parseInt(event.target.getAttribute('data-id'));
    const item = cart.find(item => item.id === id);
    
    item.quantity++;
    sessionStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
}

// Remove item
function removeItem(event) {
    // Prevent cart from closing
    event.stopPropagation();
    
    const id = parseInt(event.target.closest('.remove-item').getAttribute('data-id'));
    cart = cart.filter(item => item.id !== id);
    sessionStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
}

// Clear cart
function clearCart() {
    cart = [];
    sessionStorage.removeItem('cart');
    updateCartUI();
    cartDropdown.style.display = 'none';
}

// Toggle cart dropdown
function toggleCartDropdown() {
    if (cartDropdown.style.display === 'block') {
        cartDropdown.style.display = 'none';
    } else {
        cartDropdown.style.display = 'block';
        updateCartUI();
    }
}

// Close cart dropdown when clicking outside
document.addEventListener('click', (event) => {
    const isCartElement = event.target.closest('.cart-icon') || 
                         event.target.closest('.cart-dropdown');
    
    if (!isCartElement) {
        cartDropdown.style.display = 'none';
    }
});

// Search books
function searchBooks() {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredBooks = books.filter(book => 
        book.title.toLowerCase().includes(searchTerm) || 
        book.author.toLowerCase().includes(searchTerm)
    );
    renderBooks(booksGrid, filteredBooks);
}

// Handle checkout
function handleCheckout() {
    if (cart.length === 0) {
        modalTitle.textContent = 'Your Cart is Empty';
        modalMessage.textContent = 'Please add some books to your cart before checking out.';
        modal.style.display = 'flex';
        return;
    }
    
    // Show order confirmation
    orderModal.style.display = 'flex';
    
    // Clear the cart
    clearCart();
}

// Handle contact form submission
function handleContactSubmit(event) {
    event.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    
    // Save to localStorage
    const formData = {
        name,
        email,
        phone,
        subject,
        message,
        timestamp: new Date().toISOString()
    };
    
    let submissions = JSON.parse(localStorage.getItem('contactSubmissions')) || [];
    submissions.push(formData);
    localStorage.setItem('contactSubmissions', JSON.stringify(submissions));
    
    // Show thank you message
    modalTitle.textContent = 'Thank You!';
    modalMessage.textContent = `Thank you for your message, ${name}!`;
    modal.style.display = 'flex';
    
    // Reset form
    contactForm.reset();
}

// Handle newsletter subscription
function handleSubscribe() {
    const email = newsletterEmail.value.trim();
    
    if (!email) {
        alert('Please enter your email address.');
        return;
    }
    
    if (!validateEmail(email)) {
        alert('Please enter a valid email address.');
        return;
    }
    
    // Show thank you message
    modalTitle.textContent = 'Thank You!';
    modalMessage.textContent = 'Thank you for subscribing to our newsletter!';
    modal.style.display = 'flex';
    
    // Reset input
    newsletterEmail.value = '';
}

// Email validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Close modal
function closeModalFunc() {
    modal.style.display = 'none';
    orderModal.style.display = 'none';
}

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    if (event.target === modal || event.target === orderModal) {
        closeModalFunc();
    }
});

// Navigate to page
function navigateToPage(pageId) {
    pageContainers.forEach(page => {
        page.classList.remove('active-page');
    });
    document.getElementById(pageId).classList.add('active-page');
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);