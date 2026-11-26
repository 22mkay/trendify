import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { supabase } from './lib/supabaseClient';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import CheckoutWizard from './components/CheckoutWizard';
import CustomerAuthModal from './components/CustomerAuthModal';
import CustomerOrdersModal from './components/CustomerOrdersModal';
import Storefront from './pages/Storefront';
import StaffDashboard from './pages/StaffDashboard';

function TrendifyShell() {
  const { cart, subtotal, discount, settings, clearCart } = useStore();
  const [user, setUser] = useState(null);
  const [isStaffView, setIsStaffView] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('staff') === 'true';
  });
  const [drawerMode, setDrawerMode] = useState(null); // null | 'cart' | 'wishlist'
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [customerAuthOpen, setCustomerAuthOpen] = useState(false);
  const [customerOrdersOpen, setCustomerOrdersOpen] = useState(false);

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
    setCustomerOrdersOpen(false);
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar
        user={user}
        isStaffView={isStaffView}
        onExitStaff={() => setIsStaffView(false)}
        onOpenCart={() => setDrawerMode('cart')}
        onOpenWishlist={() => setDrawerMode('wishlist')}
        onOpenCustomerAuth={() => setCustomerAuthOpen(true)}
        onOpenCustomerOrders={() => setCustomerOrdersOpen(true)}
      />

      {!isStaffView && (
        <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-2 text-xs">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
            {user ? (
              <>
                <span>
                  Signed in as <strong>{user.email}</strong>
                </span>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setCustomerOrdersOpen(true)}
                    className="font-bold uppercase underline"
                  >
                    Track My Orders
                  </button>
                  <button
                    type="button"
                    onClick={handleCustomerSignOut}
                    className="font-bold uppercase underline text-neutral-600 hover:text-black"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <>
                <span className="text-neutral-600">
                  Create an account or sign in to place &amp; track your orders.
                </span>
                <button
                  type="button"
                  onClick={() => setCustomerAuthOpen(true)}
                  className="font-bold uppercase underline"
                >
                  Create Account / Sign In
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
        onAuthenticated={() => {
          if (cart.length > 0) setCheckoutOpen(true);
        }}
      />

      <CustomerOrdersModal
        isOpen={customerOrdersOpen}
        onClose={() => setCustomerOrdersOpen(false)}
        user={user}
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
          {/* Hidden Staff Access Trigger on the copyright symbol */}
          <button
            type="button"
            onClick={() => setIsStaffView((prev) => !prev)}
            className="cursor-default text-neutral-400 hover:text-black"
            aria-label="Portal"
          >
            &copy; {new Date().getFullYear()} Trendify
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