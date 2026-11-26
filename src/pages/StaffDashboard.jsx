import React, { useState, useEffect } from 'react';
import {
  LogOut,
  Plus,
  Trash2,
  Tag,
  Globe,
  Package,
  ClipboardList,
  Upload,
  Layers,
  Mail,
  Eye,
  EyeOff,
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useStore } from '../context/StoreContext';

export default function StaffDashboard() {
  const { products, categories, brands, settings, refreshStore } = useStore();
  const [session, setSession] = useState(null);
  const [isAuthorizedStaff, setIsAuthorizedStaff] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'taxonomy' | 'orders' | 'seo'

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // New product form + file upload
  const [newProduct, setNewProduct] = useState({
    name: '',
    brand: '',
    category: 'footwear',
    subcategory: 'Sneakers',
    price: '',
    compare_at_price: '',
    sizesText: 'UK 7, UK 8, UK 9, UK 10',
    image_url: '',
    is_special: false,
    in_stock: true,
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  // Taxonomy forms
  const [newCategory, setNewCategory] = useState({ department: 'clothes', name: '' });
  const [newBrandName, setNewBrandName] = useState('');

  // Orders & Tracking
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Promos & Email Blast
  const [promos, setPromos] = useState([]);
  const [newPromo, setNewPromo] = useState({ code: '', discount_percent: 10, active: true });
  const [customerEmails, setCustomerEmails] = useState([]);
  const [emailBlast, setEmailBlast] = useState({
    promoCode: '',
    subject: 'TRENDIFY Exclusive Promo Drop',
    message: 'Use our exclusive promo code at checkout on Trendify before stock runs out!',
  });

  // SEO & WhatsApp settings
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

  const verifyStaffRole = async (currentSession) => {
    if (!currentSession?.user?.email) {
      setIsAuthorizedStaff(false);
      setAuthLoading(false);
      return;
    }
    const { data } = await supabase
      .from('staff_users')
      .select('email')
      .ilike('email', currentSession.user.email)
      .maybeSingle();

    setIsAuthorizedStaff(Boolean(data));
    setAuthLoading(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      verifyStaffRole(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      verifyStaffRole(nextSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchStaffData = async () => {
    const [{ data: promoData }, { data: profilesData }] = await Promise.all([
      supabase.from('promos').select('*').order('code'),
      supabase.from('customer_profiles').select('email').order('created_at', { ascending: false }),
    ]);

    if (promoData) {
      setPromos(promoData);
      if (promoData[0] && !emailBlast.promoCode) {
        setEmailBlast((prev) => ({ ...prev, promoCode: promoData[0].code }));
      }
    }
    if (profilesData) {
      setCustomerEmails(profilesData.map((p) => p.email).filter(Boolean));
    }
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setOrders(data);
    setLoadingOrders(false);
  };

  useEffect(() => {
    if (session && isAuthorizedStaff) {
      fetchStaffData();
      fetchOrders();
    }
  }, [session, isAuthorizedStaff]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoginError(error.message);
      return;
    }
    const { data: staffRow } = await supabase
      .from('staff_users')
      .select('email')
      .ilike('email', data.user.email)
      .maybeSingle();

    if (!staffRow) {
      await supabase.auth.signOut();
      setLoginError('Access denied: this account is not listed in staff_users.');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleDepartmentChange = (dept) => {
    const firstSub = categories.find((c) => c.department === dept)?.name || '';
    const defaultSizes =
      dept === 'footwear'
        ? 'UK 7, UK 8, UK 9, UK 10'
        : dept === 'clothes'
        ? 'S, M, L, XL'
        : 'One Size';

    setNewProduct((prev) => ({
      ...prev,
      category: dept,
      subcategory: firstSub,
      sizesText: defaultSizes,
    }));
  };

  const handleImageFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const ext = file.name.split('.').pop();
      const filePath = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
      setNewProduct((prev) => ({ ...prev, image_url: data.publicUrl }));
    } catch (err) {
      alert(`Image upload failed: ${err.message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.image_url) {
      alert('Please upload an image file or paste an image URL.');
      return;
    }

    const sizes = newProduct.sizesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const { error } = await supabase.from('products').insert([
      {
        name: newProduct.name,
        brand: newProduct.brand || brands[0]?.name || 'Trendify Originals',
        category: newProduct.category,
        subcategory: newProduct.subcategory,
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

    setNewProduct((prev) => ({
      ...prev,
      name: '',
      price: '',
      compare_at_price: '',
      image_url: '',
      is_special: false,
    }));
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

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.name.trim()) return;
    const { error } = await supabase.from('categories').insert([
      { department: newCategory.department, name: newCategory.name.trim() },
    ]);
    if (error) alert(error.message);
    else {
      setNewCategory((prev) => ({ ...prev, name: '' }));
      refreshStore();
    }
  };

  const handleDeleteCategory = async (id) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) alert(error.message);
    else refreshStore();
  };

  const handleAddBrand = async (e) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;
    const { error } = await supabase.from('brands').insert([{ name: newBrandName.trim() }]);
    if (error) alert(error.message);
    else {
      setNewBrandName('');
      refreshStore();
    }
  };

  const handleDeleteBrand = async (id) => {
    const { error } = await supabase.from('brands').delete().eq('id', id);
    if (error) alert(error.message);
    else refreshStore();
  };

  const handleCreatePromo = async (e) => {
    e.preventDefault();
    const createdCode = newPromo.code.trim().toUpperCase();
    const { error } = await supabase.from('promos').insert([
      {
        code: createdCode,
        discount_percent: Number(newPromo.discount_percent),
        active: newPromo.active,
      },
    ]);
    if (error) {
      alert(error.message);
      return;
    }
    setNewPromo({ code: '', discount_percent: 10, active: true });
    setEmailBlast((prev) => ({ ...prev, promoCode: createdCode }));
    fetchStaffData();
    refreshStore();
  };

  const handleSendPromoEmailBlast = (e) => {
    e.preventDefault();
    if (customerEmails.length === 0) {
      alert('No registered customer account emails found yet.');
      return;
    }

    const selectedPromo = promos.find((p) => p.code === emailBlast.promoCode);
    const promoLine = selectedPromo
      ? `Promo Code: ${selectedPromo.code} (${selectedPromo.discount_percent}% OFF)`
      : emailBlast.promoCode
      ? `Promo Code: ${emailBlast.promoCode}`
      : '';

    const fullBody = [
      emailBlast.message,
      '',
      promoLine,
      `Shop now at: ${window.location.origin}`,
    ]
      .filter(Boolean)
      .join('\n');

    // Opens staff's default email client with all customer emails in BCC so addresses stay private
    const mailtoUrl = `mailto:?bcc=${encodeURIComponent(
      customerEmails.join(',')
    )}&subject=${encodeURIComponent(emailBlast.subject)}&body=${encodeURIComponent(fullBody)}`;

    window.location.href = mailtoUrl;
  };

  const handleUpdateOrder = async (orderId, patch) => {
    const { error } = await supabase.from('orders').update(patch).eq('id', orderId);
    if (error) alert(error.message);
    else fetchOrders();
  };

  const handleSaveSeo = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('store_settings').update(seoForm).eq('id', 1);
    if (error) alert(error.message);
    else {
      alert('SEO & WhatsApp settings saved.');
      refreshStore();
    }
  };

  if (authLoading) {
    return (
      <div className="mx-auto max-w-md py-16 text-center text-sm font-bold uppercase">
        Verifying staff access...
      </div>
    );
  }

  if (!session || !isAuthorizedStaff) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="border-2 border-black bg-white p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">
            Restricted Access
          </p>
          <h1 className="mt-1 text-2xl font-black uppercase">Staff Portal Login</h1>
          <p className="mt-1 text-xs text-neutral-600">
            Authorized staff only. Sign in with your registered staff email and password.
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
            <div className="relative">
    <input
    type={showLoginPassword ? 'text' : 'password'}
    required
    placeholder="Password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    className="w-full border border-black p-2.5 pr-10 text-sm outline-none"
  />
  <button
    type="button"
    onClick={() => setShowLoginPassword((prev) => !prev)}
    className="absolute top-1/2 right-2.5 -translate-y-1/2 text-black hover:opacity-70"
    aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
  >
    {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
  </button>
</div>
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

  const availableSubcategories = categories.filter((c) => c.department === newProduct.category);

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-black pb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">
            Staff Session: {session.user.email}
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

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('inventory')}
          className={`inline-flex items-center gap-1.5 border border-black px-4 py-2 text-xs font-bold uppercase ${
            activeTab === 'inventory' ? 'bg-black text-white' : 'bg-white text-black'
          }`}
        >
          <Package className="h-3.5 w-3.5" /> Inventory &amp; Promos
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('taxonomy')}
          className={`inline-flex items-center gap-1.5 border border-black px-4 py-2 text-xs font-bold uppercase ${
            activeTab === 'taxonomy' ? 'bg-black text-white' : 'bg-white text-black'
          }`}
        >
          <Layers className="h-3.5 w-3.5" /> Categories &amp; Brands
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('orders');
            fetchOrders();
          }}
          className={`inline-flex items-center gap-1.5 border border-black px-4 py-2 text-xs font-bold uppercase ${
            activeTab === 'orders' ? 'bg-black text-white' : 'bg-white text-black'
          }`}
        >
          <ClipboardList className="h-3.5 w-3.5" /> Orders ({orders.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('seo')}
          className={`inline-flex items-center gap-1.5 border border-black px-4 py-2 text-xs font-bold uppercase ${
            activeTab === 'seo' ? 'bg-black text-white' : 'bg-white text-black'
          }`}
        >
          <Globe className="h-3.5 w-3.5" /> SEO &amp; WhatsApp
        </button>
      </div>

      {/* TAB 1: INVENTORY, PROMOS & PROMO EMAIL BLAST */}
      {activeTab === 'inventory' && (
        <div className="space-y-8">
          <section className="border border-black p-6">
            <h2 className="flex items-center gap-2 text-lg font-black uppercase">
              <Plus className="h-5 w-5" /> Add Product (Footwear, Clothes, or Accessories)
            </h2>

            <form
              onSubmit={handleAddProduct}
              className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
            >
              <input
                required
                placeholder="Item Name (e.g. Air Force 1 Triple Black)"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                className="border border-black p-2 text-sm outline-none"
              />

              <select
                value={newProduct.brand}
                onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                className="border border-black bg-white p-2 text-sm outline-none"
              >
                <option value="">Select Brand...</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>

              <select
                value={newProduct.category}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                className="border border-black bg-white p-2 text-sm outline-none"
              >
                <option value="footwear">Footwear</option>
                <option value="clothes">Clothes</option>
                <option value="accessories">Accessories</option>
              </select>

              <select
                value={newProduct.subcategory}
                onChange={(e) => setNewProduct({ ...newProduct, subcategory: e.target.value })}
                className="border border-black bg-white p-2 text-sm outline-none"
              >
                <option value="">Select Subcategory...</option>
                {availableSubcategories.map((sub) => (
                  <option key={sub.id} value={sub.name}>
                    {sub.name}
                  </option>
                ))}
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
                placeholder="Sizes (e.g. UK 7, UK 8 or S, M, L or One Size)"
                value={newProduct.sizesText}
                onChange={(e) => setNewProduct({ ...newProduct, sizesText: e.target.value })}
                className="border border-black p-2 text-sm outline-none sm:col-span-2"
              />

              <label className="flex cursor-pointer items-center justify-center gap-2 border border-black bg-neutral-50 px-3 py-2 text-xs font-bold uppercase hover:bg-neutral-100">
                <Upload className="h-4 w-4" />
                <span>{uploadingImage ? 'Uploading...' : 'Upload Photo File'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileUpload}
                  className="hidden"
                />
              </label>

              <input
                placeholder="Or paste Image URL (auto-filled on upload)"
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
                disabled={uploadingImage}
                className="inline-flex items-center justify-center gap-1.5 bg-black py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-800 disabled:opacity-50 lg:col-span-4"
              >
                <Plus className="h-4 w-4" /> Save Product to Store
              </button>
            </form>

            {/* Existing Products */}
            <div className="mt-6 divide-y divide-neutral-200 border-t border-black">
              {products.map((item) => (
                <div key={item.id} className="flex flex-wrap items-center justify-between gap-4 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="h-12 w-12 border border-black object-cover grayscale"
                    />
                    <div>
                      <p className="text-sm font-black uppercase">{item.name}</p>
                      <p className="text-xs text-neutral-500">
                        {item.brand || 'No Brand'} &bull; {item.category} /{' '}
                        {item.subcategory || 'General'} &bull; Sizes: {(item.sizes || []).join(', ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold">R</span>
                    <input
                      type="number"
                      step="0.01"
                      defaultValue={item.price}
                      onBlur={(e) => handleUpdatePrice(item.id, e.target.value)}
                      className="w-24 border border-black px-2 py-1 text-xs font-bold"
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

          {/* Promo Codes & Send Promo Email to Account Holders */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <section className="border border-black p-6">
              <h2 className="flex items-center gap-2 text-lg font-black uppercase">
                <Tag className="h-5 w-5" /> Create Promo / Special Code
              </h2>
              <form onSubmit={handleCreatePromo} className="mt-4 flex flex-wrap gap-3">
                <input
                  required
                  placeholder="Code (e.g. TREND20)"
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
                  <span key={p.id} className="border border-black px-3 py-1 text-xs font-bold uppercase">
                    {p.code} — {p.discount_percent}% OFF
                  </span>
                ))}
              </div>
            </section>

            <section className="border border-black p-6">
              <h2 className="flex items-center gap-2 text-lg font-black uppercase">
                <Mail className="h-5 w-5" /> Email Promo to Account Holders
              </h2>
              <p className="mt-1 text-xs text-neutral-600">
                Registered customer accounts: <strong>{customerEmails.length}</strong>
              </p>

              <form onSubmit={handleSendPromoEmailBlast} className="mt-4 space-y-3">
                <select
                  value={emailBlast.promoCode}
                  onChange={(e) => setEmailBlast({ ...emailBlast, promoCode: e.target.value })}
                  className="w-full border border-black bg-white p-2 text-xs font-bold uppercase outline-none"
                >
                  <option value="">Select Promo Code to Feature...</option>
                  {promos.map((p) => (
                    <option key={p.id} value={p.code}>
                      {p.code} ({p.discount_percent}% OFF)
                    </option>
                  ))}
                </select>

                <input
                  required
                  placeholder="Email Subject"
                  value={emailBlast.subject}
                  onChange={(e) => setEmailBlast({ ...emailBlast, subject: e.target.value })}
                  className="w-full border border-black p-2 text-sm outline-none"
                />

                <textarea
                  required
                  rows={3}
                  placeholder="Promo message for customers..."
                  value={emailBlast.message}
                  onChange={(e) => setEmailBlast({ ...emailBlast, message: e.target.value })}
                  className="w-full border border-black p-2 text-sm outline-none"
                />

                <button
                  type="submit"
                  className="w-full bg-black py-2.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-neutral-800"
                >
                  Send Promo Email to All Account Holders (BCC)
                </button>
              </form>
            </section>
          </div>
        </div>
      )}

      {/* TAB 2: CATEGORIES & BRANDS MANAGER */}
      {activeTab === 'taxonomy' && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <section className="border border-black p-6">
            <h2 className="text-lg font-black uppercase">Manage Subcategories</h2>
            <form onSubmit={handleAddCategory} className="mt-4 flex flex-wrap gap-2">
              <select
                value={newCategory.department}
                onChange={(e) => setNewCategory({ ...newCategory, department: e.target.value })}
                className="border border-black bg-white p-2 text-xs font-bold uppercase outline-none"
              >
                <option value="footwear">Footwear</option>
                <option value="clothes">Clothes</option>
                <option value="accessories">Accessories</option>
              </select>
              <input
                required
                placeholder="Subcategory Name"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                className="flex-1 border border-black p-2 text-sm outline-none"
              />
              <button
                type="submit"
                className="bg-black px-4 py-2 text-xs font-bold uppercase text-white hover:bg-neutral-800"
              >
                Add
              </button>
            </form>

            <div className="mt-6 space-y-4">
              {['footwear', 'clothes', 'accessories'].map((dept) => (
                <div key={dept} className="border-t border-neutral-200 pt-3">
                  <p className="mb-2 text-xs font-black uppercase tracking-wider">{dept}</p>
                  <div className="flex flex-wrap gap-2">
                    {categories
                      .filter((c) => c.department === dept)
                      .map((cat) => (
                        <span
                          key={cat.id}
                          className="inline-flex items-center gap-2 border border-black px-2.5 py-1 text-xs font-bold"
                        >
                          {cat.name}
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="text-neutral-500 hover:text-black"
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="border border-black p-6">
            <h2 className="text-lg font-black uppercase">Manage Brands</h2>
            <form onSubmit={handleAddBrand} className="mt-4 flex gap-2">
              <input
                required
                placeholder="Brand Name"
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
                className="flex-1 border border-black p-2 text-sm outline-none"
              />
              <button
                type="submit"
                className="bg-black px-4 py-2 text-xs font-bold uppercase text-white hover:bg-neutral-800"
              >
                Add Brand
              </button>
            </form>

            <div className="mt-6 flex flex-wrap gap-2 border-t border-neutral-200 pt-4">
              {brands.map((b) => (
                <span
                  key={b.id}
                  className="inline-flex items-center gap-2 border border-black px-3 py-1.5 text-xs font-bold uppercase"
                >
                  {b.name}
                  <button
                    type="button"
                    onClick={() => handleDeleteBrand(b.id)}
                    className="text-neutral-500 hover:text-black"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* TAB 3: ORDERS + WAYBILL TRACKING */}
      {activeTab === 'orders' && (
        <section className="border border-black p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black uppercase">Customer Orders &amp; Tracking</h2>
            <button
              type="button"
              onClick={fetchOrders}
              className="border border-black px-3 py-1.5 text-xs font-bold uppercase hover:bg-black hover:text-white"
            >
              Refresh Orders
            </button>
          </div>

          {loadingOrders ? (
            <p className="mt-4 text-xs font-bold uppercase">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="mt-4 text-xs text-neutral-500">No orders recorded yet.</p>
          ) : (
            <div className="mt-6 space-y-4">
              {orders.map((ord) => {
                const addr = ord.delivery_address || {};
                return (
                  <div key={ord.id} className="border border-black p-4 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 pb-2">
                      <div>
                        <span className="font-black uppercase">
                          Order #{ord.id.slice(0, 8).toUpperCase()}
                        </span>{' '}
                        <span className="text-neutral-500">
                          &bull; {new Date(ord.created_at).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-black">Total: R{Number(ord.total_amount).toFixed(2)}</span>
                        <select
                          value={ord.status || 'transferred_to_whatsapp'}
                          onChange={(e) =>
                            handleUpdateOrder(ord.id, { status: e.target.value })
                          }
                          className="border border-black bg-white px-2 py-1 text-xs font-bold uppercase"
                        >
                          <option value="transferred_to_whatsapp">Transferred to WhatsApp</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="dispatched">Dispatched</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <p className="font-bold uppercase">Customer &amp; Address</p>
                        <p className="mt-0.5 text-neutral-700">
                          {ord.customer_name} ({ord.customer_phone})
                        </p>
                        <p className="text-neutral-700">
                          {addr.street}, {addr.suburb}, {addr.city}, {addr.province} {addr.postalCode}
                        </p>
                        <p className="mt-1 font-bold text-neutral-800">
                          Delivery: {ord.delivery_method}
                        </p>

                        {/* Courier & Waybill Tracking Inputs */}
                        <div className="mt-2 flex flex-wrap gap-2">
                          <input
                            placeholder="Courier (e.g. Pargo / Courier Guy)"
                            defaultValue={ord.courier_name || ''}
                            onBlur={(e) =>
                              handleUpdateOrder(ord.id, { courier_name: e.target.value })
                            }
                            className="border border-black px-2 py-1 text-xs outline-none"
                          />
                          <input
                            placeholder="Waybill / Tracking #"
                            defaultValue={ord.tracking_number || ''}
                            onBlur={(e) =>
                              handleUpdateOrder(ord.id, { tracking_number: e.target.value })
                            }
                            className="border border-black px-2 py-1 text-xs outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <p className="font-bold uppercase">Items</p>
                        <ul className="mt-0.5 space-y-1 text-neutral-700">
                          {(ord.items || []).map((it, i) => (
                            <li key={i}>
                              {it.brand ? `[${it.brand}] ` : ''}
                              {it.name} — Size: <strong>{it.selectedSize}</strong> &times; {it.qty}{' '}
                              (R{(Number(it.price) * it.qty).toFixed(2)})
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* TAB 4: SEO & WHATSAPP */}
      {activeTab === 'seo' && (
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
      )}
    </main>
  );
}