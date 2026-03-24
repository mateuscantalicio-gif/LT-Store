import './index.css';
import { createIcons, ShoppingBag, Search, X, Menu, ChevronLeft, ChevronRight, Instagram, Facebook, Twitter, Phone, CreditCard, Truck, CheckCircle2 } from 'lucide';
import { products } from './data/products';
import { Product, CartItem, Page } from './types';

// State
let currentPage: Page = 'home';
let cart: CartItem[] = JSON.parse(localStorage.getItem('lt_store_cart') || '[]');
let searchQuery = '';
let selectedCategory = 'Todos';
let currentSlide = 0;
let isCategoriesOpen = false;

// DOM Elements
const mainContent = document.getElementById('main-content')!;
const cartCount = document.getElementById('cart-count')!;
const cartItemsContainer = document.getElementById('cart-items')!;
const cartSubtotal = document.getElementById('cart-subtotal')!;
const cartFooter = document.getElementById('cart-footer')!;
const cartSidebar = document.getElementById('cart-sidebar')!;
const mobileMenu = document.getElementById('mobile-menu')!;
const productModal = document.getElementById('product-modal')!;
const modalBody = document.getElementById('modal-body')!;
const searchInput = document.getElementById('search-input') as HTMLInputElement;

// Initialize Icons
const initIcons = () => {
  createIcons({
    icons: { ShoppingBag, Search, X, Menu, ChevronLeft, ChevronRight, Instagram, Facebook, Twitter, Phone, CreditCard, Truck, CheckCircle2 }
  });
};

// Persistence
const saveCart = () => {
  localStorage.setItem('lt_store_cart', JSON.stringify(cart));
  updateCartUI();
};

// Navigation
const navigate = (page: Page) => {
  currentPage = page;
  window.scrollTo(0, 0);
  render();
  
  // Update active nav links
  document.querySelectorAll('.nav-btn').forEach(btn => {
    if (btn.getAttribute('data-nav') === page) {
      btn.classList.add('text-gold');
    } else {
      btn.classList.remove('text-gold');
    }
  });
};

// Cart Logic
const addToCart = (product: Product, size: 'P' | 'M' | 'G') => {
  const existing = cart.find(item => item.id === product.id && item.selectedSize === size);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1, selectedSize: size });
  }
  saveCart();
  closeModal();
  openCart();
};

const removeFromCart = (id: number, size: string) => {
  cart = cart.filter(item => !(item.id === id && item.selectedSize === size));
  saveCart();
};

const updateQuantity = (id: number, size: string, delta: number) => {
  const item = cart.find(i => i.id === id && i.selectedSize === size);
  if (item) {
    item.quantity = Math.max(1, item.quantity + delta);
    saveCart();
  }
};

const updateCartUI = () => {
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  if (totalItems > 0) {
    cartCount.textContent = totalItems.toString();
    cartCount.classList.remove('hidden');
  } else {
    cartCount.classList.add('hidden');
  }

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="h-full flex flex-col items-center justify-center text-center space-y-4">
        <i data-lucide="shopping-bag" class="w-12 h-12 text-gray-200"></i>
        <p class="text-gray-500 italic">Seu carrinho está vazio.</p>
        <button class="btn-square btn-primary" id="go-to-store">Ir para a Loja</button>
      </div>
    `;
    cartFooter.classList.add('hidden');
    document.getElementById('go-to-store')?.addEventListener('click', () => {
      closeCart();
      navigate('store');
    });
  } else {
    cartItemsContainer.innerHTML = cart.map(item => `
      <div class="flex gap-4">
        <img src="${item.imageUrl}" alt="${item.title}" class="w-20 h-24 object-cover rounded-sm" referrerPolicy="no-referrer" />
        <div class="flex-grow">
          <div class="flex justify-between items-start">
            <h4 class="text-sm font-bold uppercase">${item.title}</h4>
            <button class="remove-item" data-id="${item.id}" data-size="${item.selectedSize}">
              <i data-lucide="x" class="w-4 h-4 text-gray-400"></i>
            </button>
          </div>
          <p class="text-xs text-gray-500 mb-2">Tamanho: ${item.selectedSize}</p>
          <div class="flex justify-between items-center">
            <div class="flex items-center border border-gray-200">
              <button class="qty-btn px-2 py-1 text-xs" data-id="${item.id}" data-size="${item.selectedSize}" data-delta="-1">-</button>
              <span class="px-2 py-1 text-xs font-bold">${item.quantity}</span>
              <button class="qty-btn px-2 py-1 text-xs" data-id="${item.id}" data-size="${item.selectedSize}" data-delta="1">+</button>
            </div>
            <span class="text-sm font-bold">R$ ${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        </div>
      </div>
    `).join('');
    
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    cartSubtotal.textContent = `R$ ${subtotal.toFixed(2)}`;
    cartFooter.classList.remove('hidden');
  }
  initIcons();
  
  // Re-attach listeners
  document.querySelectorAll('.remove-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.getAttribute('data-id')!);
      const size = btn.getAttribute('data-size')!;
      removeFromCart(id, size);
    });
  });
  
  document.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.getAttribute('data-id')!);
      const size = btn.getAttribute('data-size')!;
      const delta = parseInt(btn.getAttribute('data-delta')!);
      updateQuantity(id, size, delta);
    });
  });
};

// Overlays Logic
const openCart = () => {
  cartSidebar.classList.remove('hidden');
  setTimeout(() => {
    cartSidebar.querySelector('.sidebar')?.classList.remove('translate-x-full');
  }, 10);
};

const closeCart = () => {
  cartSidebar.querySelector('.sidebar')?.classList.add('translate-x-full');
  setTimeout(() => {
    cartSidebar.classList.add('hidden');
  }, 300);
};

const openMenu = () => {
  mobileMenu.classList.remove('hidden');
  setTimeout(() => {
    mobileMenu.querySelector('.sidebar')?.classList.remove('-translate-x-full');
  }, 10);
};

const closeMenu = () => {
  mobileMenu.querySelector('.sidebar')?.classList.add('-translate-x-full');
  setTimeout(() => {
    mobileMenu.classList.add('hidden');
  }, 300);
};

const openModal = (product: Product) => {
  let selectedSize: 'P' | 'M' | 'G' | null = null;
  
  const updateModalBody = () => {
    modalBody.innerHTML = `
      <div class="w-full md:w-1/2 h-[50vh] md:h-auto shrink-0">
        <img src="${product.imageUrl}" alt="${product.title}" class="w-full h-full object-cover" referrerPolicy="no-referrer" />
      </div>
      <div class="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-cream">
        <span class="text-[10px] font-bold uppercase tracking-[0.3em] text-gold mb-2">${product.category}</span>
        <h2 class="text-3xl md:text-4xl font-serif mb-4">${product.title}</h2>
        <p class="text-2xl font-bold text-primary mb-6">R$ ${product.price.toFixed(2)}</p>
        <p class="text-gray-600 text-sm leading-relaxed mb-8">${product.description}</p>
        ${product.stock > 0 ? `
          <div class="space-y-8">
            <div>
              <h4 class="text-xs font-bold uppercase tracking-widest mb-4">Selecione o Tamanho</h4>
              <div class="flex gap-4">
                ${(['P', 'M', 'G'] as const).map(size => `
                  <button 
                    class="size-btn w-12 h-12 flex items-center justify-center border text-sm font-bold transition-all ${selectedSize === size ? 'border-primary bg-primary text-white' : 'border-gray-200 hover:border-gold'}"
                    data-size="${size}"
                  >
                    ${size}
                  </button>
                `).join('')}
              </div>
            </div>
            <div class="space-y-4">
              <button 
                id="add-to-cart-btn"
                class="w-full btn-square py-4 flex items-center justify-center gap-2 ${selectedSize ? 'btn-primary' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}"
                ${!selectedSize ? 'disabled' : ''}
              >
                <i data-lucide="shopping-bag" class="w-5 h-5"></i>
                Adicionar ao Carrinho
              </button>
              <button class="close-modal-btn md:hidden w-full py-4 text-[10px] font-bold uppercase tracking-widest border border-gray-200">
                Continuar Comprando
              </button>
            </div>
          </div>
        ` : `
          <div class="space-y-6">
            <div class="bg-red-50 text-red-600 p-4 text-center font-bold uppercase tracking-widest text-xs">
              Produto Esgotado
            </div>
            <button class="close-modal-btn md:hidden w-full py-4 text-[10px] font-bold uppercase tracking-widest border border-gray-200">
              Voltar
            </button>
          </div>
        `}
      </div>
    `;
    initIcons();
    
    document.querySelectorAll('.size-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedSize = btn.getAttribute('data-size') as any;
        updateModalBody();
      });
    });
    
    document.getElementById('add-to-cart-btn')?.addEventListener('click', () => {
      if (selectedSize) addToCart(product, selectedSize);
    });
    
    document.querySelectorAll('.close-modal-btn').forEach(btn => {
      btn.addEventListener('click', closeModal);
    });
  };

  updateModalBody();
  productModal.classList.remove('hidden');
  setTimeout(() => {
    productModal.querySelector('.modal-content')?.classList.remove('scale-90', 'opacity-0');
  }, 10);
};

const closeModal = () => {
  productModal.querySelector('.modal-content')?.classList.add('scale-90', 'opacity-0');
  setTimeout(() => {
    productModal.classList.add('hidden');
  }, 300);
};

// Rendering Pages
const renderHome = () => {
  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1920&auto=format&fit=crop',
      title: 'Coleção Minimalista',
      subtitle: 'A essência do luxo em cada detalhe.'
    },
    {
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1920&auto=format&fit=crop',
      title: 'Alfaiataria Moderna',
      subtitle: 'Cortes precisos para mulheres poderosas.'
    },
    {
      image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1920&auto=format&fit=crop',
      title: 'Acessórios Premium',
      subtitle: 'O toque final que define seu estilo.'
    }
  ];

  mainContent.innerHTML = `
    <section class="page-enter">
      <!-- Hero Slider -->
      <div class="relative h-[80vh] overflow-hidden">
        ${slides.map((slide, index) => `
          <div
            class="hero-slide absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${currentSlide === index ? 'opacity-100' : 'opacity-0'}"
            style="backgroundImage: url(${slide.image})"
          >
            <div class="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white text-center px-4">
              <h2 class="text-5xl md:text-7xl mb-4 font-serif transition-all duration-700 delay-500 ${currentSlide === index ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}">
                ${slide.title}
              </h2>
              <p class="text-lg md:text-xl mb-8 font-light tracking-widest uppercase transition-all duration-700 delay-700 ${currentSlide === index ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}">
                ${slide.subtitle}
              </p>
              <button class="btn-square btn-gold transition-all duration-700 delay-900 ${currentSlide === index ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}" id="hero-cta">
                Ver Coleção
              </button>
            </div>
          </div>
        `).join('')}
        <button id="prev-slide" class="absolute left-4 top-1/2 -translate-y-1/2 text-white p-2 hover:text-gold transition-colors">
          <i data-lucide="chevron-left" class="w-10 h-10"></i>
        </button>
        <button id="next-slide" class="absolute right-4 top-1/2 -translate-y-1/2 text-white p-2 hover:text-gold transition-colors">
          <i data-lucide="chevron-right" class="w-10 h-10"></i>
        </button>
      </div>

      <!-- Benefits Bar -->
      <div class="bg-gray-50 py-12 border-b border-gray-100">
        <div class="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div class="flex flex-col items-center gap-4">
            <i class="fa-solid fa-truck-fast text-3xl text-gold"></i>
            <div>
              <h4 class="font-bold uppercase tracking-widest text-sm mb-1">Frete Grátis</h4>
              <p class="text-xs text-gray-500">Em compras acima de R$ 400,00</p>
            </div>
          </div>
          <div class="flex flex-col items-center gap-4">
            <i class="fa-solid fa-credit-card text-3xl text-gold"></i>
            <div>
              <h4 class="font-bold uppercase tracking-widest text-sm mb-1">Parcelamento</h4>
              <p class="text-xs text-gray-500">Até 6x sem juros no cartão</p>
            </div>
          </div>
          <div class="flex flex-col items-center gap-4">
            <i class="fa-solid fa-arrows-rotate text-3xl text-gold"></i>
            <div>
              <h4 class="font-bold uppercase tracking-widest text-sm mb-1">Troca Fácil</h4>
              <p class="text-xs text-gray-500">Primeira troca por nossa conta</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Featured Categories -->
      <div class="py-20 max-w-7xl mx-auto px-4">
        <h3 class="section-title">Categorias em Destaque</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          ${['Vestidos', 'Alfaiataria', 'Acessórios'].map((cat) => `
            <div 
              class="featured-cat relative h-[500px] group overflow-hidden cursor-pointer"
              data-cat="${cat}"
            >
              <img 
                src="${products.find(p => p.category === cat)?.imageUrl}" 
                alt="${cat}"
                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div class="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <h4 class="text-white text-3xl font-serif uppercase tracking-widest border-b-2 border-white pb-2">${cat}</h4>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- New Arrivals -->
      <div class="py-20 bg-cream">
        <div class="max-w-7xl mx-auto px-4">
          <h3 class="section-title">Novidades</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            ${products.slice(0, 4).map(product => renderProductCard(product)).join('')}
          </div>
          <div class="text-center mt-12">
            <button class="btn-square btn-primary" id="view-all-btn">Ver Tudo</button>
          </div>
        </div>
      </div>
    </section>
  `;
  
  setTimeout(() => mainContent.querySelector('section')?.classList.add('page-enter-active'), 10);
  initIcons();
  
  // Listeners
  document.getElementById('hero-cta')?.addEventListener('click', () => navigate('store'));
  document.getElementById('view-all-btn')?.addEventListener('click', () => navigate('store'));
  document.getElementById('prev-slide')?.addEventListener('click', () => {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    render();
  });
  document.getElementById('next-slide')?.addEventListener('click', () => {
    currentSlide = (currentSlide + 1) % slides.length;
    render();
  });
  document.querySelectorAll('.featured-cat').forEach(el => {
    el.addEventListener('click', () => {
      selectedCategory = el.getAttribute('data-cat')!;
      navigate('store');
    });
  });
  attachProductCardListeners();
};

const renderStore = () => {
  const filtered = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  mainContent.innerHTML = `
    <section class="py-12 max-w-7xl mx-auto px-4 page-enter">
      <div class="flex flex-col md:flex-row gap-12">
        <aside class="w-full md:w-64 shrink-0">
          <div class="mb-8 order-1 md:order-2">
            <h4 class="font-bold uppercase tracking-widest text-sm mb-4 border-b pb-2">Busca</h4>
            <div class="relative">
              <input 
                id="store-search"
                type="text" 
                placeholder="Pesquisar..." 
                class="w-full bg-gray-50 border-none px-4 py-2 text-sm focus:ring-1 focus:ring-gold outline-none"
                value="${searchQuery}"
              />
              <i data-lucide="search" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"></i>
            </div>
          </div>

          <div class="mb-8 order-2 md:order-1">
            <button id="toggle-categories" class="w-full flex justify-between items-center md:pointer-events-none mb-4 border-b pb-2">
              <h4 class="font-bold uppercase tracking-widest text-sm">Categorias</h4>
              <div class="md:hidden">
                <i data-lucide="chevron-left" class="w-4 h-4 rotate-270 transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}"></i>
              </div>
            </button>
            
            <div id="categories-list" class="${isCategoriesOpen ? 'flex' : 'hidden'} md:flex flex-col gap-2">
              ${['Todos', 'Vestidos', 'Alfaiataria', 'Acessórios'].map(cat => `
                <button 
                  class="cat-filter text-left text-sm py-1 transition-colors ${selectedCategory === cat ? 'text-gold font-bold' : 'text-gray-500 hover:text-primary'}"
                  data-cat="${cat}"
                >
                  ${cat}
                </button>
              `).join('')}
            </div>
          </div>
        </aside>

        <div class="flex-grow order-3">
          <div class="flex justify-between items-center mb-8">
            <p class="text-sm text-gray-500">${filtered.length} produtos encontrados</p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            ${filtered.map(product => renderProductCard(product)).join('')}
          </div>
          ${filtered.length === 0 ? `
            <div class="text-center py-20">
              <p class="text-gray-500 italic">Nenhum produto encontrado para sua busca.</p>
            </div>
          ` : ''}
        </div>
      </div>
    </section>
  `;
  
  setTimeout(() => mainContent.querySelector('section')?.classList.add('page-enter-active'), 10);
  initIcons();
  
  // Listeners
  const storeSearch = document.getElementById('store-search') as HTMLInputElement;
  storeSearch?.addEventListener('input', (e) => {
    searchQuery = (e.target as HTMLInputElement).value;
    render();
  });
  
  document.getElementById('toggle-categories')?.addEventListener('click', () => {
    isCategoriesOpen = !isCategoriesOpen;
    render();
  });
  
  document.querySelectorAll('.cat-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedCategory = btn.getAttribute('data-cat')!;
      if (window.innerWidth < 768) isCategoriesOpen = false;
      render();
    });
  });
  attachProductCardListeners();
};

const renderLookbook = () => {
  const images = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1539109132314-3477524c8595?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?q=80&w=800&auto=format&fit=crop'
  ];

  mainContent.innerHTML = `
    <section class="py-20 max-w-7xl mx-auto px-4 text-center page-enter">
      <h2 class="section-title">Lookbook</h2>
      <p class="text-gray-500 italic mb-12">Inspirando sua próxima versão.</p>
      <div class="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        ${images.map(url => `
          <img src="${url}" alt="Look" class="w-full rounded-sm" referrerPolicy="no-referrer" />
        `).join('')}
      </div>
    </section>
  `;
  setTimeout(() => mainContent.querySelector('section')?.classList.add('page-enter-active'), 10);
};

const renderAbout = () => {
  mainContent.innerHTML = `
    <section class="py-20 max-w-3xl mx-auto px-4 text-center page-enter">
      <h2 class="section-title">Nossa História</h2>
      <div class="space-y-6 text-gray-600 leading-relaxed">
        <p>Fundada em 2024, a LT Store nasceu do desejo de unir o minimalismo atemporal ao luxo contemporâneo.</p>
        <p>Acreditamos que a moda é uma forma de expressão silenciosa, onde a qualidade dos tecidos e a precisão dos cortes falam mais alto que qualquer tendência passageira.</p>
        <p>Cada peça em nossa curadoria é escolhida pensando na mulher que valoriza a elegância sem esforço e a durabilidade de um guarda-roupa inteligente.</p>
      </div>
      <img 
        src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop" 
        alt="Atelier" 
        class="w-full h-96 object-cover mt-12 rounded-sm"
        referrerPolicy="no-referrer"
      />
    </section>
  `;
  setTimeout(() => mainContent.querySelector('section')?.classList.add('page-enter-active'), 10);
};

const renderCheckout = () => {
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = subtotal > 400 ? 0 : 25;
  const total = subtotal + shipping;
  const remainingForFreeShipping = Math.max(0, 400 - subtotal);

  mainContent.innerHTML = `
    <section class="py-12 max-w-4xl mx-auto px-4 page-enter">
      <h2 class="section-title">Finalizar Compra</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
        <form id="checkout-form" class="space-y-6">
          <div class="space-y-4">
            <h3 class="font-bold uppercase tracking-widest text-sm border-b pb-2">Dados de Entrega</h3>
            <input type="text" id="nome" placeholder="Nome Completo" required class="w-full border border-gray-200 p-3 outline-none focus:border-gold" />
            <input type="email" id="email" placeholder="E-mail" required class="w-full border border-gray-200 p-3 outline-none focus:border-gold" />
            <input type="text" id="endereco" placeholder="Endereço Completo" required class="w-full border border-gray-200 p-3 outline-none focus:border-gold" />
            <input type="text" id="cidade" placeholder="Cidade / Estado" required class="w-full border border-gray-200 p-3 outline-none focus:border-gold" />
          </div>
          <div class="space-y-4">
            <h3 class="font-bold uppercase tracking-widest text-sm border-b pb-2">Pagamento</h3>
            <div class="grid grid-cols-2 gap-4">
              <button type="button" class="payment-method p-4 border flex flex-col items-center gap-2 transition-all border-gold bg-gold/5" data-method="whatsapp">
                <i data-lucide="phone" class="w-6 h-6 text-green-600"></i>
                <span class="text-[10px] font-bold uppercase">WhatsApp</span>
              </button>
              <button type="button" class="payment-method p-4 border flex flex-col items-center gap-2 transition-all border-gray-200" data-method="mercadopago">
                <i data-lucide="credit-card" class="w-6 h-6 text-mp-blue"></i>
                <span class="text-[10px] font-bold uppercase">Mercado Pago</span>
              </button>
            </div>
          </div>
          <button type="submit" class="w-full btn-square btn-primary py-4">Finalizar Pedido</button>
        </form>
        <div class="bg-gray-50 p-8 h-fit">
          <h3 class="font-bold uppercase tracking-widest text-sm border-b pb-4 mb-4">Resumo do Pedido</h3>
          <div class="space-y-4 mb-6">
            ${cart.map(item => `
              <div class="flex justify-between text-sm">
                <span>${item.quantity}x ${item.title} (${item.selectedSize})</span>
                <span class="font-bold">R$ ${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            `).join('')}
          </div>
          <div class="border-t pt-4 space-y-2">
            <div class="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>R$ ${subtotal.toFixed(2)}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span>Frete</span>
              <span class="${shipping === 0 ? 'text-success font-bold' : ''}">
                ${shipping === 0 ? 'GRÁTIS' : `R$ ${shipping.toFixed(2)}`}
              </span>
            </div>
            ${shipping > 0 ? `<p class="text-[10px] text-gold font-bold uppercase mt-2">Faltam R$ ${remainingForFreeShipping.toFixed(2)} para Frete Grátis!</p>` : ''}
            <div class="flex justify-between text-lg font-bold pt-4 border-t mt-4">
              <span>Total</span>
              <span>R$ ${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
  
  setTimeout(() => mainContent.querySelector('section')?.classList.add('page-enter-active'), 10);
  initIcons();
  
  let selectedPayment = 'whatsapp';
  document.querySelectorAll('.payment-method').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedPayment = btn.getAttribute('data-method')!;
      document.querySelectorAll('.payment-method').forEach(b => b.classList.remove('border-gold', 'bg-gold/5'));
      btn.classList.add('border-gold', 'bg-gold/5');
    });
  });
  
  document.getElementById('checkout-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const nome = (document.getElementById('nome') as HTMLInputElement).value;
    const email = (document.getElementById('email') as HTMLInputElement).value;
    const endereco = (document.getElementById('endereco') as HTMLInputElement).value;
    const cidade = (document.getElementById('cidade') as HTMLInputElement).value;
    
    const orderDetails = cart.map(item => `${item.quantity}x ${item.title} (${item.selectedSize})`).join('%0A');
    const message = `Olá! Gostaria de finalizar meu pedido na LT Store.%0A%0A*Pedido:*%0A${orderDetails}%0A%0A*Total:* R$ ${total.toFixed(2)}%0A*Cliente:* ${nome}%0A*Endereço:* ${endereco}, ${cidade}`;

    if (selectedPayment === 'mercadopago') {
      navigator.clipboard.writeText(`R$ ${total.toFixed(2)}`).then(() => {
        alert('Valor total copiado para a área de transferência. Redirecionando para o Mercado Pago...');
        window.open('https://link.mercadopago.com.br/suaempresa', '_blank');
      });
    } else {
      window.open(`https://wa.me/5511999999999?text=${message}`, '_blank');
    }
  });
};

const renderProductCard = (product: Product) => {
  return `
    <div class="product-card group cursor-pointer" data-id="${product.id}">
      <div class="relative aspect-[3/4] overflow-hidden mb-4 bg-gray-100">
        <img 
          src="${product.imageUrl}" 
          alt="${product.title}" 
          class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        ${product.stock === 0 ? `
          <div class="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span class="bg-white text-primary text-[10px] font-bold uppercase tracking-widest px-4 py-2">Esgotado</span>
          </div>
        ` : ''}
        <div class="absolute bottom-0 left-0 w-full p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-white/90 backdrop-blur-sm">
          <button class="w-full text-[10px] font-bold uppercase tracking-widest py-2 border border-primary hover:bg-primary hover:text-white transition-all">
            Ver Detalhes
          </button>
        </div>
      </div>
      <div class="text-center">
        <span class="text-[10px] text-gray-400 uppercase tracking-widest mb-1 block">${product.category}</span>
        <h4 class="text-sm font-bold uppercase tracking-tight mb-1">${product.title}</h4>
        <p class="text-sm font-light">R$ ${product.price.toFixed(2)}</p>
      </div>
    </div>
  `;
};

const attachProductCardListeners = () => {
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = parseInt(card.getAttribute('data-id')!);
      const product = products.find(p => p.id === id);
      if (product) openModal(product);
    });
  });
};

const render = () => {
  switch (currentPage) {
    case 'home': renderHome(); break;
    case 'store': renderStore(); break;
    case 'lookbook': renderLookbook(); break;
    case 'about': renderAbout(); break;
    case 'checkout': renderCheckout(); break;
  }
};

// Global Listeners
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const page = btn.getAttribute('data-nav') as Page;
    navigate(page);
    closeMenu();
  });
});

document.getElementById('logo')?.addEventListener('click', () => navigate('home'));
document.getElementById('cart-btn')?.addEventListener('click', openCart);
document.getElementById('menu-btn')?.addEventListener('click', openMenu);
document.querySelector('.close-cart')?.addEventListener('click', closeCart);
document.querySelector('.close-menu')?.addEventListener('click', closeMenu);
document.querySelector('.close-modal')?.addEventListener('click', closeModal);
document.querySelector('#cart-sidebar .overlay-bg')?.addEventListener('click', closeCart);
document.querySelector('#mobile-menu .overlay-bg')?.addEventListener('click', closeMenu);
document.querySelector('#product-modal .overlay-bg')?.addEventListener('click', closeModal);

searchInput.addEventListener('input', (e) => {
  searchQuery = (e.target as HTMLInputElement).value;
  if (currentPage !== 'store') navigate('store');
  else render();
});

document.getElementById('checkout-btn')?.addEventListener('click', () => {
  closeCart();
  navigate('checkout');
});

// Initial Render
updateCartUI();
render();
initIcons();
