import React from 'react';
import { Search, Heart, ShoppingBag, Lock, ExternalLink } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function Navbar({ onOpenCart, onOpenWishlist, onToggleStaff, isStaffView }) {
  const { searchQuery, setSearchQuery, cart, wishlist, settings } = useStore();
  const totalCartItems = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <header className="sticky top-0 z-40 border-b-2 border-black bg-white">
      {/* Top Bar with WhatsApp Channel Link */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-black px-4 py-2 text-xs font-bold uppercase tracking-widest text-white">
        <span>TRENDIFY — BLACK &amp; WHITE SNEAKERS &amp; CLOTHES</span>
        <a
          href={settings.whatsapp_channel_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 underline underline-offset-4 hover:text-neutral-300"
        >
          WhatsApp Channel <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* Main Header */}
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <button
          type="button"
          onClick={() => isStaffView && onToggleStaff()}
          className="text-left text-2xl font-black tracking-tighter uppercase"
        >
          TRENDIFY<span className="text-neutral-400">.</span>
        </button>

        {!isStaffView && (
          <div className="order-3 w-full md:order-2 md:max-w-md">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sneakers, clothes, sizes..."
                className="w-full border border-black bg-white py-2 pr-4 pl-9 text-sm outline-none focus:bg-neutral-100"
              />
            </div>
          </div>
        )}

        <div className="order-2 flex items-center gap-2.5 md:order-3">
          {!isStaffView && (
            <>
              <button
                type="button"
                onClick={onOpenWishlist}
                className="relative border border-black p-2 transition hover:bg-black hover:text-white"
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center bg-black text-[10px] font-bold text-white">
                    {wishlist.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={onOpenCart}
                className="flex items-center gap-2 border border-black bg-black px-3 py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-neutral-800"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Cart ({totalCartItems})</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={onToggleStaff}
            className={`flex items-center gap-1.5 border border-black px-3 py-2 text-xs font-bold uppercase ${
              isStaffView
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-neutral-100'
            }`}
          >
            <Lock className="h-3.5 w-3.5" />
            <span>{isStaffView ? 'Back to Store' : 'Staff Login'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}