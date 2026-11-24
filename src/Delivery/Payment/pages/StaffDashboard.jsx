import React, { useState, useEffect } from 'react';
import { LogOut, Plus, Trash2, Tag, Globe, Package } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useStore } from '../context/StoreContext';

export default function StaffDashboard() {
  const { products, settings, refreshStore } = useStore();
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // New product form
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'sneakers',
    price: '',
    compare_at_price: '',
    sizesText: 'UK 7, UK 8, UK 9, UK 10',
    image_url: '',
    is_special: false,
    in_stock: true,
  });

  // Promo form & list
  const [promos, setPromos] = useState([]);
  const [newPromo, setNewPromo] = useState({ code: '', discount_percent: 10, active: true });

  // SEO & WhatsApp settings form
  const [seoForm, setSeoForm] = useState({
    whatsapp_number: settings.whatsapp_number || '',
    whatsapp_channel_url: settings.whatsapp_channel_url || '',
    seo_title: settings.seo_title || '',
    seo_description: settings.seo_description || '',
    seo_keywords: settings.seo_keywords || '',
  });

  useEffect(() => {
    setSeoForm({
      whatsapp_number: settings.whatsapp_number || '',
      whatsapp_channel_url: settings.whatsapp_channel_url || '',
      seo_title: settings.seo_title || '',
      seo_description: settings.seo_description || '',
      seo_keywords: settings.seo_keywords || '',
    });
  }, [settings]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchAllPromos = async () => {
    const { data } = await supabase.from('promos').select('*').order('code');
    if (data) setPromos(data);
  };

  useEffect(() => {
    if (session) fetchAllPromos();
  }, [session]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setLoginError(error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const sizes = newProduct.sizesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const { error } = await supabase.from('products').insert([
      {
        name: newProduct.name,
        category: newProduct.category,
        price: Number(newProduct.price),
        compare_at_price: newProduct.compare_at_price ? Number(newProduct.compare_at_price) : null,
        sizes,
        image_url: newProduct.image_url,
        is_special: newProduct.is_special,
        in_stock: newProduct.in_stock,
      },
    ]);

    if (error) {
      alert(error.message);
      return;
    }

    setNewProduct({
      name: '',
      category: 'sneakers',
      price: '',
      compare_at_price: '',
      sizesText: newProduct.category === 'sneakers' ? 'UK 7, UK 8, UK 9, UK 10' : 'S, M, L, XL',
      image_url: '',
      is_special: false,
      in_stock: true,
    });
    refreshStore();
  };

  const handleUpdatePrice = async (id, nextPrice) => {
    const { error } = await supabase
      .from('products')
      .update({ price: Number(nextPrice) })
      .eq('id', id);
    if (error) alert(error.message);
    else refreshStore();
  };

  const handleToggleSpecial = async (product) => {
    const { error } = await supabase
      .from('products')
      .update({ is_special: !product.is_special })
      .eq('id', product.id);
    if (error) alert(error.message);
    else refreshStore();
  };

  const handleDeleteProduct = async (id) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) alert(error.message);
    else refreshStore();
  };

  const handleCreatePromo = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('promos').insert([
      {
        code: newPromo.code.trim().toUpperCase(),
        discount_percent: Number(newPromo.discount_percent),
        active: newPromo.active,
      },
    ]);
    if (error) {
      alert(error.message);
      return;
    }
    setNewPromo({ code: '', discount_percent: 10, active: true });
    fetchAllPromos();
    refreshStore();
  };

  const handleSaveSeo = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from('store_settings')
      .update(seoForm)
      .eq('id', 1);
    if (error) alert(error.message);
    else {
      alert('SEO & WhatsApp settings saved.');
      refreshStore();
    }
  };

  if (authLoading) {
    return <div className="mx-auto max-w-md py-16 text-center text-sm font-bold uppercase">Checking session...</div>;
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="border-2 border-black bg-white p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">
            Supabase Staff Auth
          </p>
          <h1 className="mt-1 text-2xl font-black uppercase">Staff Portal Login</h1>
          <p className="mt-1 text-xs text-neutral-600">
            Sign in with your Supabase staff credentials to manage inventory, prices, specials, and SEO.
          </p>

          <form onSubmit={handleLogin} className="mt-5 space-y-3">
            <input
              type="email"
              required
              placeholder="Staff Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-black p-2.5 text-sm outline-none"
            />
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-black p-2.5 text-sm outline-none"
            />
            {loginError && <p className="text-xs font-bold text-black">{loginError}</p>}
            <button
              type="submit"
              className="w-full bg-black py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-neutral-800"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-7xl space-y-10 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-black pb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">
            Signed in as {session.user.email}
          </p>
          <h1 className="text-2xl font-black uppercase">Trendify Staff Dashboard</h1>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 border border-black px-4 py-2 text-xs font-bold uppercase hover:bg-black hover:text-white"
        >
          <LogOut className="h-3.5 w-3.5" /> Sign Out
        </button>
      </div>

      {/* 1. Inventory & Pricing */}
      <section className="border border-black p-6">
        <h2 className="flex items-center gap-2 text-lg font-black uppercase">
          <Package className="h-5 w-5" /> Add Inventory &amp; Update Prices
        </h2>

        <form onSubmit={handleAddProduct} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input
            required
            placeholder="Item Name (e.g. Noir Runner)"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            className="border border-black p-2 text-sm outline-none"
          />
          <select
            value={newProduct.category}
            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
            className="border border-black bg-white p-2 text-sm outline-none"
          >
            <option value="sneakers">Sneakers</option>
            <option value="clothes">Clothes</option>
          </select>
          <input
            required
            type="number"
            step="0.01"
            placeholder="Price (ZAR)"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
            className="border border-black p-2 text-sm outline-none"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Old Price / Compare At (Optional)"
            value={newProduct.compare_at_price}
            onChange={(e) => setNewProduct({ ...newProduct, compare_at_price: e.target.value })}
            className="border border-black p-2 text-sm outline-none"
          />
          <input
            required
            placeholder="Sizes (e.g. UK 7, UK 8 or S, M, L)"
            value={newProduct.sizesText}
            onChange={(e) => setNewProduct({ ...newProduct, sizesText: e.target.value })}
            className="border border-black p-2 text-sm outline-none"
          />
          <input
            required
            placeholder="Image URL (https://...)"
            value={newProduct.image_url}
            onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
            className="border border-black p-2 text-sm outline-none sm:col-span-2"
          />
          <label className="flex items-center gap-2 border border-black px-3 py-2 text-xs font-bold uppercase">
            <input
              type="checkbox"
              checked={newProduct.is_special}
              onChange={(e) => setNewProduct({ ...newProduct, is_special: e.target.checked })}
              className="accent-black"
            />
            Mark as Special
          </label>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1.5 bg-black py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-800 lg:col-span-4"
          >
            <Plus className="h-4 w-4" /> Add Product to Store
          </button>
        </form>

        {/* Existing Products List */}
        <div className="mt-6 divide-y divide-neutral-200 border-t border-black">
          {products.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-4 py-3">
              <div>
                <p className="text-sm font-black uppercase">{item.name}</p>
                <p className="text-xs text-neutral-500">
                  {item.category} &bull; Sizes: {(item.sizes || []).join(', ')}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold">R</span>
                <input
                  type="number"
                  step="0.01"
                  defaultValue={item.price}
                  onBlur={(e) => handleUpdatePrice(item.id, e.target.value)}
                  className="w-24 border border-black px-2 py-1 text-xs font-bold"
                  aria-label={`Price for ${item.name}`}
                />
                <button
                  type="button"
                  onClick={() => handleToggleSpecial(item)}
                  className={`border border-black px-2.5 py-1 text-xs font-bold uppercase ${
                    item.is_special ? 'bg-black text-white' : 'bg-white text-black'
                  }`}
                >
                  {item.is_special ? 'Special: ON' : 'Special: OFF'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteProduct(item.id)}
                  className="border border-black p-1.5 hover:bg-black hover:text-white"
                  aria-label={`Delete ${item.name}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Specials & Promo Codes */}
      <section className="border border-black p-6">
        <h2 className="flex items-center gap-2 text-lg font-black uppercase">
          <Tag className="h-5 w-5" /> Create Promo / Special Code
        </h2>
        <form onSubmit={handleCreatePromo} className="mt-4 flex flex-wrap gap-3">
          <input
            required
            placeholder="Code (e.g. SAVE20)"
            value={newPromo.code}
            onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value })}
            className="border border-black p-2 text-sm uppercase outline-none"
          />
          <input
            required
            type="number"
            min="1"
            max="90"
            placeholder="Discount %"
            value={newPromo.discount_percent}
            onChange={(e) => setNewPromo({ ...newPromo, discount_percent: e.target.value })}
            className="w-32 border border-black p-2 text-sm outline-none"
          />
          <button
            type="submit"
            className="bg-black px-5 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-800"
          >
            Create Promo
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          {promos.map((p) => (
            <span
              key={p.id}
              className="border border-black px-3 py-1 text-xs font-bold uppercase"
            >
              {p.code} — {p.discount_percent}% OFF
            </span>
          ))}
        </div>
      </section>

      {/* 3. SEO & WhatsApp Channel Settings */}
      <section className="border border-black p-6">
        <h2 className="flex items-center gap-2 text-lg font-black uppercase">
          <Globe className="h-5 w-5" /> SEO &amp; WhatsApp Settings
        </h2>
        <form onSubmit={handleSaveSeo} className="mt-4 space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              placeholder="WhatsApp Order Number (e.g. 27820000000)"
              value={seoForm.whatsapp_number}
              onChange={(e) => setSeoForm({ ...seoForm, whatsapp_number: e.target.value })}
              className="border border-black p-2 text-sm outline-none"
            />
            <input
              placeholder="WhatsApp Channel URL"
              value={seoForm.whatsapp_channel_url}
              onChange={(e) => setSeoForm({ ...seoForm, whatsapp_channel_url: e.target.value })}
              className="border border-black p-2 text-sm outline-none"
            />
          </div>
          <input
            placeholder="SEO Meta Title"
            value={seoForm.seo_title}
            onChange={(e) => setSeoForm({ ...seoForm, seo_title: e.target.value })}
            className="w-full border border-black p-2 text-sm outline-none"
          />
          <textarea
            rows={2}
            placeholder="SEO Meta Description"
            value={seoForm.seo_description}
            onChange={(e) => setSeoForm({ ...seoForm, seo_description: e.target.value })}
            className="w-full border border-black p-2 text-sm outline-none"
          />
          <input
            placeholder="SEO Keywords (comma separated)"
            value={seoForm.seo_keywords}
            onChange={(e) => setSeoForm({ ...seoForm, seo_keywords: e.target.value })}
            className="w-full border border-black p-2 text-sm outline-none"
          />
          <button
            type="submit"
            className="bg-black px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-800"
          >
            Save SEO &amp; WhatsApp Settings
          </button>
        </form>
      </section>
    </main>
  );
}