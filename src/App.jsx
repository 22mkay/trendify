import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { supabase } from './lib/supabaseClient';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import CheckoutWizard from './components/CheckoutWizard';
import CustomerAuthModal from './components/CustomerAuthModal';
import Storefront from './pages/Storefront';
import StaffDashboard from './pages/StaffDashboard';

function TrendifyShell() {
  const { cart, subtotal, discount, settings, clearCart } = useStore();
  const [user, setUser] = useState(null);
  const [isStaffView, setIsStaffView] = useState(false);
  const [drawerMode, setDrawerMode] = useState(null); // null | 'cart' | 'wishlist'
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [customerAuthOpen, setCustomerAuthOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleStartCheckout = () => {
    if (!user) {
      setCustomerAuthOpen(true);
      return;
    }
    setCheckoutOpen(true);
  };

  const handleCustomerSignOut = async () => {
    await supabase.auth.signOut();
    setCheckoutOpen(false);
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar
        isStaffView={isStaffView}
        onToggleStaff={() => setIsStaffView((prev) => !prev)}
        onOpenCart={() => setDrawerMode('cart')}
        onOpenWishlist={() => setDrawerMode('wishlist')}
      />

      {!isStaffView && (
        <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-2 text-xs">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            {user ? (
              <>
                <span>
                  Signed in as <strong>{user.email}</strong>
                </span>
                <button
                  type="button"
                  onClick={handleCustomerSignOut}
                  className="font-bold uppercase underline"
                >
                  Customer Sign Out
                </button>
              </>
            ) : (
              <>
                <span className="text-neutral-600">
                  Browse freely — sign in required when placing an order.
                </span>
                <button
                  type="button"
                  onClick={() => setCustomerAuthOpen(true)}
                  className="font-bold uppercase underline"
                >
                  Customer Sign In / Register
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {isStaffView ? <StaffDashboard /> : <Storefront />}

      <CartDrawer
        mode={drawerMode}
        onClose={() => setDrawerMode(null)}
        onSwitchMode={(nextMode) => setDrawerMode(nextMode)}
        onStartCheckout={handleStartCheckout}
      />

      <CustomerAuthModal
        isOpen={customerAuthOpen}
        onClose={() => setCustomerAuthOpen(false)}
        onAuthenticated={() => setCheckoutOpen(true)}
      />

      {checkoutOpen && (
        <CheckoutWizard
          cart={cart}
          subtotal={subtotal}
          discount={discount}
          settings={settings}
          user={user}
          onRequireLogin={() => {
            setCheckoutOpen(false);
            setCustomerAuthOpen(true);
          }}
          onClose={() => setCheckoutOpen(false)}
          onClearCart={clearCart}
        />
      )}

      <footer className="mt-16 border-t-2 border-black bg-white px-4 py-6 text-xs">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <span className="font-black uppercase tracking-wider">TRENDIFY</span>
          <a
            href={settings.whatsapp_channel_url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold uppercase underline"
          >
            Official WhatsApp Channel
          </a>
          <button
            type="button"
            onClick={() => setIsStaffView((prev) => !prev)}
            className="font-bold uppercase underline"
          >
            {isStaffView ? 'View Storefront' : 'Staff Admin'}
          </button>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <TrendifyShell />
    </StoreProvider>
  );
}