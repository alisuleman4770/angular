import { Component, computed, signal } from '@angular/core';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  icon: string;
}

interface CartItem extends Product {
  quantity: number;
}

@Component({
  selector: 'app-pos',
  standalone: true,
  templateUrl: './pos.html',
  styleUrl: './pos.css'
})
export class Pos {

  // ==========================================
  // CATEGORIES
  // ==========================================

  categories: string[] = [
    'All',
    'Burgers',
    'Pizza',
    'Drinks',
    'Desserts',
    'Sides'
  ];

  selectedCategory = signal<string>('All');

  // ==========================================
  // SEARCH
  // ==========================================

  searchTerm = signal<string>('');

  // ==========================================
  // PRODUCTS
  // Prices are in Pakistani Rupees (PKR)
  // ==========================================

  products: Product[] = [

    {
      id: 1,
      name: 'Classic Burger',
      description: 'Beef patty with cheese and fresh vegetables',
      price: 650,
      category: 'Burgers',
      icon: '🍔'
    },

    {
      id: 2,
      name: 'Chicken Burger',
      description: 'Crispy chicken with lettuce and special sauce',
      price: 550,
      category: 'Burgers',
      icon: '🍔'
    },

    {
      id: 3,
      name: 'Cheese Burger',
      description: 'Juicy beef burger with extra cheese',
      price: 750,
      category: 'Burgers',
      icon: '🍔'
    },

    {
      id: 4,
      name: 'Zinger Burger',
      description: 'Spicy crispy chicken with mayo and lettuce',
      price: 600,
      category: 'Burgers',
      icon: '🍔'
    },

    {
      id: 5,
      name: 'Chicken Pizza',
      description: 'Chicken, cheese, capsicum and olives',
      price: 1200,
      category: 'Pizza',
      icon: '🍕'
    },

    {
      id: 6,
      name: 'Pepperoni Pizza',
      description: 'Pepperoni, mozzarella cheese and tomato sauce',
      price: 1500,
      category: 'Pizza',
      icon: '🍕'
    },

    {
      id: 7,
      name: 'Margherita Pizza',
      description: 'Classic pizza with cheese and tomato',
      price: 1000,
      category: 'Pizza',
      icon: '🍕'
    },

    {
      id: 8,
      name: 'Vegetable Pizza',
      description: 'Fresh vegetables with mozzarella cheese',
      price: 1100,
      category: 'Pizza',
      icon: '🍕'
    },

    {
      id: 9,
      name: 'Coca Cola',
      description: 'Chilled soft drink',
      price: 150,
      category: 'Drinks',
      icon: '🥤'
    },

    {
      id: 10,
      name: 'Pepsi',
      description: 'Chilled Pepsi soft drink',
      price: 150,
      category: 'Drinks',
      icon: '🥤'
    },

    {
      id: 11,
      name: 'Fresh Lemonade',
      description: 'Fresh homemade lemonade',
      price: 250,
      category: 'Drinks',
      icon: '🍋'
    },

    {
      id: 12,
      name: 'Mineral Water',
      description: '500ml bottled water',
      price: 100,
      category: 'Drinks',
      icon: '💧'
    },

    {
      id: 13,
      name: 'Chocolate Cake',
      description: 'Soft chocolate cake with chocolate cream',
      price: 450,
      category: 'Desserts',
      icon: '🍰'
    },

    {
      id: 14,
      name: 'Ice Cream',
      description: 'Two scoops of premium ice cream',
      price: 350,
      category: 'Desserts',
      icon: '🍨'
    },

    {
      id: 15,
      name: 'Brownie',
      description: 'Warm chocolate brownie',
      price: 300,
      category: 'Desserts',
      icon: '🍫'
    },

    {
      id: 16,
      name: 'French Fries',
      description: 'Crispy golden french fries',
      price: 300,
      category: 'Sides',
      icon: '🍟'
    },

    {
      id: 17,
      name: 'Chicken Nuggets',
      description: 'Crispy chicken nuggets',
      price: 400,
      category: 'Sides',
      icon: '🍗'
    },

    {
      id: 18,
      name: 'Onion Rings',
      description: 'Crispy fried onion rings',
      price: 350,
      category: 'Sides',
      icon: '🧅'
    }

  ];

  // ==========================================
  // CART
  // ==========================================

  cart = signal<CartItem[]>([]);

  // ==========================================
  // PAYMENT METHODS
  // ==========================================

  paymentMethods: string[] = [
    'Cash',
    'Card',
    'Other'
  ];

  paymentMethod = signal<string>('Cash');

  // ==========================================
  // FILTERED PRODUCTS
  // ==========================================

  filteredProducts = computed(() => {

    const search = this.searchTerm()
      .trim()
      .toLowerCase();

    const category = this.selectedCategory();

    return this.products.filter(product => {

      const matchesCategory =
        category === 'All' ||
        product.category === category;

      const matchesSearch =
        product.name.toLowerCase().includes(search) ||
        product.description.toLowerCase().includes(search);

      return matchesCategory && matchesSearch;

    });

  });

  // ==========================================
  // CART ITEM COUNT
  // ==========================================

  cartItemCount = computed(() => {

    return this.cart().reduce(
      (total, item) => total + item.quantity,
      0
    );

  });

  // ==========================================
  // SUBTOTAL
  // ==========================================

  subtotal = computed(() => {

    return this.cart().reduce(
      (total, item) =>
        total + (item.price * item.quantity),
      0
    );

  });

  // ==========================================
  // TAX
  // 10%
  // ==========================================

  tax = computed(() => {

    return this.subtotal() * 0.10;

  });

  // ==========================================
  // TOTAL
  // ==========================================

  total = computed(() => {

    return this.subtotal() + this.tax();

  });

  // ==========================================
  // SEARCH PRODUCTS
  // ==========================================

  onSearch(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    this.searchTerm.set(input.value);

  }

  // ==========================================
  // SELECT CATEGORY
  // ==========================================

  selectCategory(category: string): void {

    this.selectedCategory.set(category);

  }

  // ==========================================
  // ADD PRODUCT TO CART
  // ==========================================

  addToCart(product: Product): void {

    const currentCart = this.cart();

    const existingItem =
      currentCart.find(
        item => item.id === product.id
      );

    if (existingItem) {

      this.cart.update(items =>
        items.map(item =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1
              }
            : item
        )
      );

    } else {

      const newItem: CartItem = {
        ...product,
        quantity: 1
      };

      this.cart.update(items => [
        ...items,
        newItem
      ]);

    }

  }

  // ==========================================
  // INCREASE QUANTITY
  // ==========================================

  increaseQuantity(id: number): void {

    this.cart.update(items =>
      items.map(item =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity + 1
            }
          : item
      )
    );

  }

  // ==========================================
  // DECREASE QUANTITY
  // ==========================================

  decreaseQuantity(id: number): void {

    this.cart.update(items =>
      items
        .map(item =>
          item.id === id
            ? {
                ...item,
                quantity: item.quantity - 1
              }
            : item
        )
        .filter(item => item.quantity > 0)
    );

  }

  // ==========================================
  // REMOVE ITEM
  // ==========================================

  removeFromCart(id: number): void {

    this.cart.update(items =>
      items.filter(item => item.id !== id)
    );

  }

  // ==========================================
  // CLEAR CART
  // ==========================================

  clearCart(): void {

    this.cart.set([]);

  }

  // ==========================================
  // SELECT PAYMENT METHOD
  // ==========================================

  selectPaymentMethod(method: string): void {

    this.paymentMethod.set(method);

  }

  // ==========================================
  // FORMAT CURRENCY
  // ==========================================

  formatCurrency(amount: number): string {

    return new Intl.NumberFormat(
      'en-PK',
      {
        style: 'currency',
        currency: 'PKR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }
    ).format(amount);

  }

  // ==========================================
  // PROCESS ORDER
  // ==========================================

  processOrder(): void {

    if (this.cart().length === 0) {

      alert('Please add at least one product.');

      return;

    }

    const order = {

      orderNumber: '#NEW',

      items: this.cart().map(item => ({

        productId: item.id,

        name: item.name,

        price: item.price,

        quantity: item.quantity,

        total: item.price * item.quantity

      })),

      subtotal: this.subtotal(),

      tax: this.tax(),

      total: this.total(),

      paymentMethod: this.paymentMethod(),

      currency: 'PKR',

      createdAt: new Date()

    };

    console.log('Order processed:', order);

    alert(
      `Order processed successfully!\n\n` +
      `Total: ${this.formatCurrency(this.total())}\n` +
      `Payment: ${this.paymentMethod()}`
    );

    // Clear cart after processing
    this.cart.set([]);

  }

}
