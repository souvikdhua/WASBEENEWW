document.addEventListener('DOMContentLoaded', () => {

  // ============================================
  // 1. A/B Testing Logic for Offers
  // ============================================
  const offerElement = document.getElementById('dynamicOfferText');
  const marqueeOffers = document.querySelectorAll('.ab-marquee-offer');
  
  let experimentGroup = localStorage.getItem('wasabee_offer_test');
  
  // If user hasn't been assigned a group, coin flip!
  if (!experimentGroup) {
    experimentGroup = Math.random() < 0.5 ? 'A' : 'B';
    localStorage.setItem('wasabee_offer_test', experimentGroup);
  }
  
  const updateOfferTexts = (group) => {
    const text = group === 'A' 
      ? 'Enjoy <strong>15% OFF</strong> on all orders of <strong>₹799</strong> or more.' 
      : 'Enjoy <strong>₹200 OFF</strong> on all orders of <strong>₹999</strong> or more.';
    
    const marqueeText = group === 'A' ? 'ENJOY 15% OFF ON ₹799+' : 'ENJOY ₹200 OFF ON ₹999+';

    if (offerElement) offerElement.innerHTML = text;
    marqueeOffers.forEach(el => el.textContent = marqueeText);
  };

  updateOfferTexts(experimentGroup);

  // ============================================
  // 2. WhatsApp Cart Logic
  // ============================================
  let cart = [];
  const WABA_NUMBER = '919163764444'; // As found in the footer

  // Inject Add to Cart buttons into all menu items
  const menuItems = document.querySelectorAll('.popup-item');
  menuItems.forEach((item, index) => {
    // Extract info from DOM
    const nameEl = item.querySelector('.pi-name');
    const priceEl = item.querySelector('.pi-price');
    
    if (nameEl && priceEl) {
      const itemName = nameEl.textContent.trim();
      // Remove rupee symbol and parse int
      const itemPriceStr = priceEl.textContent.replace(/[^\d]/g, '');
      const itemPrice = parseInt(itemPriceStr, 10);
      
      // Create Add Button
      const addBtn = document.createElement('button');
      addBtn.className = 'btn-add-cart';
      addBtn.innerHTML = '+';
      addBtn.setAttribute('aria-label', `Add ${itemName} to cart`);
      addBtn.dataset.name = itemName;
      addBtn.dataset.price = itemPrice;
      
      // Listen for clicks
      addBtn.addEventListener('click', (e) => {
        addToCart(itemName, itemPrice);
        
        // Button animation feedback
        const btn = e.target;
        btn.classList.add('pop');
        setTimeout(() => btn.classList.remove('pop'), 200);
      });
      
      item.appendChild(addBtn);
    }
  });

  // Cart DOM Elements
  const cartToggleBtn = document.getElementById('waCartToggle');
  const cartWidget = document.getElementById('waCartWidget');
  const cartCloseBtn = document.querySelector('.cart-widget-close');
  const cartItemsContainer = document.getElementById('waCartItems');
  const cartTotalEl = document.getElementById('waCartTotal');
  const cartBadge = document.getElementById('waCartBadge');
  const checkoutBtn = document.getElementById('waCheckoutBtn');
  const cartBackdrop = document.getElementById('cartBackdrop');

  // Mini-cart toast elements
  const miniCartToast = document.getElementById('miniCartToast');
  const miniCartClose = document.getElementById('miniCartClose');
  const miniCartSummary = document.getElementById('miniCartSummary');
  const miniCartViewBtn = document.getElementById('miniCartViewBtn');
  
  // New UI Elements for Calculations & Offers
  const cartOfferBanner = document.getElementById('waCartOfferBanner');
  const cartCelebration = document.getElementById('waCartCelebration');
  const cartSubtotalEl = document.getElementById('waCartSubtotal');
  const cartDiscountRow = document.getElementById('waCartDiscountRow');
  const cartDiscountEl = document.getElementById('waCartDiscount');

  let lastDiscountState = 'none';

  // Open full cart panel (not auto — only on explicit user action)
  function openCart() {
    cartWidget.classList.add('open');
    if (cartBackdrop) cartBackdrop.style.display = 'block';
    miniCartToast.classList.remove('show'); // hide mini-toast when full panel opens
  }

  function closeCart() {
    cartWidget.classList.remove('open');
    if (cartBackdrop) cartBackdrop.style.display = '';
  }

  // Toggle Cart via floating WhatsApp button
  cartToggleBtn.addEventListener('click', () => {
    if (cartWidget.classList.contains('open')) {
      closeCart();
    } else {
      openCart();
    }
  });

  // Close full panel
  cartCloseBtn.addEventListener('click', closeCart);

  // Backdrop click closes full panel
  if (cartBackdrop) {
    cartBackdrop.addEventListener('click', closeCart);
  }

  // Mini-cart: View Cart opens full panel
  if (miniCartViewBtn) {
    miniCartViewBtn.addEventListener('click', () => {
      openCart();
    });
  }

  // Mini-cart: close just the toast (not the full panel)
  if (miniCartClose) {
    miniCartClose.addEventListener('click', () => {
      miniCartToast.classList.remove('show');
    });
  }

  // Core Cart Functions
  function addToCart(name, price) {
    const existingItem = cart.find(i => i.name === name);
    if (existingItem) {
      existingItem.qty += 1;
    } else {
      cart.push({ name, price, qty: 1 });
    }
    updateCartUI();

    // Show mini-cart toast on add — do NOT auto-open full panel
    if (!cartWidget.classList.contains('open') && miniCartToast) {
      miniCartToast.classList.add('show');
    }
  }

  window.addToCart = addToCart;

  window.removeFromCart = function(name) { // accessible from inline HTML string
    const existingItem = cart.find(i => i.name === name);
    if (existingItem) {
      if (existingItem.qty > 1) {
        existingItem.qty -= 1;
      } else {
        cart = cart.filter(i => i.name !== name);
      }
    }
    updateCartUI();
    // Auto-hide mini toast if cart is empty
    if (cart.length === 0 && miniCartToast) {
      miniCartToast.classList.remove('show');
    }
  }

  function updateMiniCartToast(itemCount, total) {
    if (!miniCartSummary) return;
    miniCartSummary.textContent = `${itemCount} item${itemCount !== 1 ? 's' : ''} · ₹${total}`;
  }

  function updateCartUI() {
    // 1. Calculate Subtotal
    let subtotal = 0;
    let itemCount = 0;
    cartItemsContainer.innerHTML = '';
    
    cart.forEach(item => {
      subtotal += (item.price * item.qty);
      itemCount += item.qty;
      
      const itemRow = document.createElement('div');
      itemRow.className = 'cart-item-row';
      itemRow.innerHTML = `
        <div class="ci-left">
          <span class="ci-name">${item.name}</span>
          <span class="ci-price">₹${item.price}</span>
        </div>
        <div class="ci-right">
          <div class="qty-control">
            <button class="qty-btn" onclick="removeFromCart('${item.name.replace(/'/g, "\\'")}')">-</button>
            <span class="qty-val">${item.qty}</span>
            <button class="qty-btn" onclick="addToCart('${item.name.replace(/'/g, "\\'")}', ${item.price})">+</button>
          </div>
        </div>
      `;
      cartItemsContainer.appendChild(itemRow);
    });
    
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Your cart is empty.</p>';
    }

    // 2. Update Headers/Badges
    cartBadge.textContent = itemCount;
    if (itemCount > 0) {
      cartToggleBtn.classList.add('has-items');
    } else {
      cartToggleBtn.classList.remove('has-items');
    }

    // Update mini-cart toast summary
    updateMiniCartToast(itemCount, subtotal);

    // 3. Calculate discount based on experiment group
    let currentDiscountState = 'none';
    let discount = 0;
    const grp = localStorage.getItem('wasabee_offer_test') || 'A';

    if (subtotal >= 1299) {
      currentDiscountState = 'dessert';
      discount = Math.round(subtotal * 0.15);
    } else if (grp === 'A' && subtotal >= 799) {
      currentDiscountState = 'discount';
      discount = Math.round(subtotal * 0.15);
    } else if (grp === 'B' && subtotal >= 999) {
      currentDiscountState = 'discount';
      discount = 200;
    }

    // 4. Update offer banner text
    if (subtotal === 0) {
      cartOfferBanner.innerHTML = "Add items to unlock special offers!";
    } else if (currentDiscountState === 'dessert') {
      cartOfferBanner.innerHTML = "<strong>15% OFF + Free Dessert</strong> applied!";
    } else if (currentDiscountState === 'discount') {
      const nextAmount = 1299 - subtotal;
      const discountName = grp === 'A' ? '15% OFF' : '₹200 OFF';
      cartOfferBanner.innerHTML = `<strong>${discountName}</strong> applied! Add <strong>₹${nextAmount}</strong> more for a <strong>Free Dessert</strong>!`;
    } else {
      // none state
      if (grp === 'A') {
        cartOfferBanner.innerHTML = `Add <strong>₹${799 - subtotal}</strong> more to unlock <strong>15% OFF</strong>!`;
      } else {
        cartOfferBanner.innerHTML = `Add <strong>₹${999 - subtotal}</strong> more to unlock <strong>₹200 OFF</strong>!`;
      }
    }

    // 5. Trigger celebration toast on state transition (e.g. none -> discount / discount -> dessert)
    const statePriority = { 'none': 0, 'discount': 1, 'dessert': 2 };
    if (statePriority[currentDiscountState] > statePriority[lastDiscountState]) {
      if (currentDiscountState === 'dessert') {
        cartCelebration.textContent = "Free Dessert & 15% Discount Unlocked!";
      } else {
        const discountText = grp === 'A' ? "15% OFF" : "₹200 OFF";
        cartCelebration.textContent = `${discountText} Discount Unlocked!`;
      }
      cartCelebration.classList.add('show');
      
      if (window.celebrationTimeout) clearTimeout(window.celebrationTimeout);
      window.celebrationTimeout = setTimeout(() => {
        cartCelebration.classList.remove('show');
      }, 3000);
    }
    lastDiscountState = currentDiscountState;

    // 6. Update Calculations UI
    cartSubtotalEl.textContent = `₹${subtotal}`;
    if (discount > 0) {
      cartDiscountEl.textContent = `-₹${discount}`;
      cartDiscountRow.style.display = 'flex';
    } else {
      cartDiscountRow.style.display = 'none';
    }
    cartTotalEl.textContent = `₹${subtotal - discount}`;
  }

  // Initial UI Render
  updateCartUI();

  // WhatsApp Checkout
  checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
      alert("Please add items to your cart first.");
      return;
    }
    
    let subtotal = 0;
    let message = "Hi Wasabee! I would like to order the following items from your menu:\n\n";
    
    cart.forEach(item => {
      const lineTotal = item.price * item.qty;
      subtotal += lineTotal;
      message += `${item.qty}x ${item.name} (₹${item.price} each - ₹${lineTotal})\n`;
    });
    
    message += `\n*Subtotal: ₹${subtotal}*\n`;
    
    let discount = 0;
    let claimedOffer = "";
    const grp = localStorage.getItem('wasabee_offer_test') || 'A';
    
    if (subtotal >= 1299) {
      discount = Math.round(subtotal * 0.15);
      claimedOffer = "15% Off + Free Dessert (Orders ₹1299+)";
    } else if (grp === 'A' && subtotal >= 799) {
      discount = Math.round(subtotal * 0.15);
      claimedOffer = "15% Off (Orders ₹799+)";
    } else if (grp === 'B' && subtotal >= 999) {
      discount = 200;
      claimedOffer = "₹200 Off (Orders ₹999+)";
    }
    
    if (discount > 0) {
      message += `*Discount:* -₹${discount} (${claimedOffer})\n`;
    }
    message += `*Delivery:* FREE\n`;
    message += `*Total Amount:* ₹${subtotal - discount}\n`;
    
    message += `\nPlease confirm my order.`;
    
    const encodedMsg = encodeURIComponent(message);
    const waURL = `https://wa.me/${WABA_NUMBER}?text=${encodedMsg}`;
    
    window.open(waURL, '_blank');
  });

});
