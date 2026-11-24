import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import CheckoutWizard from './components/CheckoutWizard';
import Storefront from './pages/Storefront';
import StaffDashboard from './pages/StaffDashboard';

function TrendifyShell() {
  const { cart, subtotal, discount, settings, clearCart } = useStore();
  const [isStaffView, setIsStaffView] = useState(false);
  const [drawerMode, setDrawerMode] = useState(null); // null | 'cart' | 'wishlist'
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar
        isStaffView={isStaffView}
        onToggleStaff={() => setIsStaffView((prev) => !prev)}
        onOpenCart={() => setDrawerMode('cart')}
        onOpenWishlist={() => setDrawerMode('wishlist')}
      />

      {isStaffView ? <StaffDashboard /> : <Storefront />}

      <CartDrawer
        mode={drawerMode}
        onClose={() => setDrawerMode(null)}
        onSwitchMode={(nextMode) => setDrawerMode(nextMode)}
        onStartCheckout={() => setCheckoutOpen(true)}
      />

      {checkoutOpen && (
        <CheckoutWizard
          cart={cart}
          subtotal={subtotal}
          discount={discount}
          settings={settings}
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