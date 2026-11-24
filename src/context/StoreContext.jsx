import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const StoreContext = createContext();

export function StoreProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [promos, setPromos] = useState([]);
  const [settings, setSettings] = useState({
    whatsapp_number: '27000000000',
    whatsapp_channel_url: 'https://whatsapp.com/channel/0029VaTrendify',
    seo_title: 'TRENDIFY | Monochrome Footwear, Streetwear & Accessories',
    seo_description:
      'Shop black and white sneakers, slides, clothing, and accessories at Trendify.',
    seo_keywords: 'sneakers, slides, streetwear, caps, watches, Trendify',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [activeDepartment, setActiveDepartment] = useState('all'); // 'all' | 'footwear' | 'clothes' | 'accessories' | 'specials'
  const [activeSubcategory, setActiveSubcategory] = useState('all');
  const [activeBrand, setActiveBrand] = useState('all');
  const [appliedPromo, setAppliedPromo] = useState(null);

  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('trendify_cart')) || [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('trendify_wishlist')) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('trendify_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('trendify_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const fetchStoreData = async () => {
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      return;
    }

    const [
      { data: prodData },
      { data: catData },
      { data: brandData },
      { data: promoData },
      { data: settingsData },
    ] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name', { ascending: true }),
      supabase.from('brands').select('*').order('name', { ascending: true }),
      supabase.from('promos').select('*').eq('active', true),
      supabase.from('store_settings').select('*').eq('id', 1).single(),
    ]);

    if (prodData) setProducts(prodData);
    if (catData) setCategories(catData);
    if (brandData) setBrands(brandData);
    if (promoData) setPromos(promoData);
    if (settingsData) setSettings(settingsData);
  };

  useEffect(() => {
    fetchStoreData();
  }, []);

  // Reset subcategory when switching main departments
  const selectDepartment = (dept, sub = 'all') => {
    setActiveDepartment(dept);
    setActiveSubcategory(sub);
  };

  // Dynamic SEO Head Updater
  useEffect(() => {
    if (settings.seo_title) document.title = settings.seo_title;

    const upsertMeta = (name, content) => {
      if (!content) return;
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    upsertMeta('description', settings.seo_description);
    upsertMeta('keywords', settings.seo_keywords);
  }, [settings]);

  const addToCart = (product, selectedSize) => {
    if (!selectedSize) {
      alert('Please select a size first.');
      return;
    }
    setCart((prev) => {
      const idx = prev.findIndex(
        (item) => item.id === product.id && item.selectedSize === selectedSize
      );
      if (idx > -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
        return next;
      }
      return [...prev, { ...product, selectedSize, qty: 1 }];
    });
  };

  const updateCartQty = (id, selectedSize, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id && item.selectedSize === selectedSize
            ? { ...item, qty: item.qty + delta }
            : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const removeFromCart = (id, selectedSize) => {
    setCart((prev) =>
      prev.filter((item) => !(item.id === id && item.selectedSize === selectedSize))
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedPromo(null);
  };

  const toggleWishlist = (product) => {
    setWishlist((prev) =>
      prev.some((item) => item.id === product.id)
        ? prev.filter((item) => item.id !== product.id)
        : [...prev, product]
    );
  };

  const applyPromoCode = (codeInput) => {
    const cleaned = codeInput.trim().toLowerCase();
    const match = promos.find((p) => p.code.toLowerCase() === cleaned && p.active);
    if (!match) return { success: false, message: 'Invalid or inactive promo code.' };
    setAppliedPromo(match);
    return { success: true, message: `${match.discount_percent}% off applied (${match.code}).` };
  };

  // Multi-facet Search & Filter (Name, Brand, Department, Subcategory, Sizes)
  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      (p.brand || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q) ||
      (p.subcategory || '').toLowerCase().includes(q) ||
      (p.sizes || []).some((s) => s.toLowerCase().includes(q));

    const matchesDepartment =
      activeDepartment === 'all'
        ? true
        : activeDepartment === 'specials'
        ? Boolean(p.is_special)
        : p.category === activeDepartment;

    const matchesSubcategory =
      activeSubcategory === 'all' ? true : p.subcategory === activeSubcategory;

    const matchesBrand = activeBrand === 'all' ? true : p.brand === activeBrand;

    return matchesSearch && matchesDepartment && matchesSubcategory && matchesBrand;
  });

  const subtotal = cart.reduce((sum, item) => sum + Number(item.price) * item.qty, 0);
  const discount = appliedPromo ? (subtotal * Number(appliedPromo.discount_percent)) / 100 : 0;

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        brands,
        filteredProducts,
        settings,
        searchQuery,
        setSearchQuery,
        activeDepartment,
        selectDepartment,
        activeSubcategory,
        setActiveSubcategory,
        activeBrand,
        setActiveBrand,
        cart,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        wishlist,
        toggleWishlist,
        appliedPromo,
        applyPromoCode,
        subtotal,
        discount,
        refreshStore: fetchStoreData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);