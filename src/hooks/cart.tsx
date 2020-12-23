import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const itemsCart = await AsyncStorage.getItem('@GoMarketplace:Cart');
      if (itemsCart) {
        const itemsParsed = JSON.parse(itemsCart);
        setProducts(itemsParsed);
      }
      // await AsyncStorage.clear();
    }
    loadProducts();
  }, []);

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const productExists = products.findIndex(item => item.id === id);

      if (productExists > -1) {
        const temp = [...products];
        temp[productExists].quantity += 1;
        setProducts(temp);
        await AsyncStorage.setItem('@GoMarketplace:Cart', JSON.stringify(temp));
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const productExists = products.findIndex(item => item.id === id);

      if (productExists > -1) {
        if (products[productExists].quantity <= 1) {
          return;
        }
        const temp = [...products];
        temp[productExists].quantity -= 1;
        setProducts(temp);
        await AsyncStorage.setItem('@GoMarketplace:Cart', JSON.stringify(temp));
      }
    },
    [products],
  );

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART
      const productExists = products.findIndex(item => item.id === product.id);

      if (productExists > -1) {
        const temp = [...products];
        temp[productExists].quantity += 1;
        setProducts(temp);
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
      }
      await AsyncStorage.setItem(
        '@GoMarketplace:Cart',
        JSON.stringify(products),
      );
    },
    [setProducts, products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
