import React, { useState } from 'react';
import {
  Search,
  Heart,
  ShoppingBag,
  UserPlus,
  User,
  Package,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function Navbar({
  user,
  onOpenCart,
  onOpenWishlist,
  onOpenCustomerAuth,
  onOpenCustomerOrders,
  onExitStaff,
  isStaffView,
}) {
  const {
    searchQuery,
    setSearchQuery,
    cart,
    wishlist,
    settings,
    categories,
    activeDepartment,
    selectDepartment,
  } = useStore();

  const [footwearDropdownOpen, setFootwearDropdownOpen] = useState(false);
  const totalCartItems = cart.reduce((sum, item) => sum + item.qty, 0);

  const footwearSubcategories = categories.filter((c) => c.department === 'footwear');

  const handleNavClick = (dept, sub = 'all') => {
    if (isStaffView && onExitStaff) onExitStaff();
    selectDepartment(dept, sub);
    setFootwearDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b-2 border-black bg-white">
      {/* Top Announcement Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-black px-4 py-2 text-xs font-bold uppercase tracking-widest text-white">
        <span>TRENDIFY — FOOTWEAR, CLOTHES &amp; ACCESSORIES</span>
        <a
          href={settings.whatsapp_channel_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 underline underline-offset-4 hover:text-neutral-300"
        >
          WhatsApp Channel <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* Main Header Row */}
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <button
          type="button"
          onClick={() => handleNavClick('all', 'all')}
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
                placeholder="Search by brand (Nike, Casio...), item, or size..."
                className="w-full border border-black bg-white py-2 pr-4 pl-9 text-sm outline-none focus:bg-neutral-100"
              />
            </div>
          </div>
        )}

        {/* Right Header Icons: Wishlist, Cart, Customer Account / Track Orders */}
        <div className="order-2 flex items-center gap-2.5 md:order-3">
          {isStaffView ? (
            <button
              type="button"
              onClick={onExitStaff}
              className="border border-black bg-black px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-800"
            >
              Back to Storefront
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onOpenWishlist}
                className="relative border border-black p-2 transition hover:bg-black hover:text-white"
                aria-label="Wishlist"
                title="Wishlist"
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

              {user ? (
                <button
                  type="button"
                  onClick={onOpenCustomerOrders}
                  className="flex items-center gap-1.5 border border-black bg-white px-3 py-2 text-xs font-bold uppercase transition hover:bg-black hover:text-white"
                  title="Track My Orders"
                >
                  <Package className="h-4 w-4" />
                  <span className="hidden sm:inline">Track Orders</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenCustomerAuth}
                  className="flex items-center gap-1.5 border border-black bg-white px-3 py-2 text-xs font-bold uppercase transition hover:bg-black hover:text-white"
                  aria-label="Create Account or Sign In"
                  title="Create Account / Sign In"
                >
                  <UserPlus className="h-4 w-4" />
                  <span className="hidden sm:inline">Account</span>
                </button>
              )}

              {user && (
                <button
                  type="button"
                  onClick={onOpenCustomerAuth}
                  className="border border-black p-2 transition hover:bg-black hover:text-white"
                  aria-label="Account Settings"
                  title={user.email}
                >
                  <User className="h-5 w-5" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Department Navigation Strip (Slides & Open Shoes inside Footwear dropdown only) */}
      {!isStaffView && (
        <nav className="border-t border-neutral-200 bg-white px-4">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-1 py-2 text-xs font-bold uppercase tracking-wider">
            <button
              type="button"
              onClick={() => handleNavClick('all', 'all')}
              className={`px-3 py-1.5 transition ${
                activeDepartment === 'all' ? 'bg-black text-white' : 'hover:bg-neutral-100'
              }`}
            >
              All Drops
            </button>

            {/* Footwear with Dropdown (Sneakers, Slides & Open Shoes, etc.) */}
            <div
              className="relative"
              onMouseEnter={() => setFootwearDropdownOpen(true)}
              onMouseLeave={() => setFootwearDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={() => setFootwearDropdownOpen((prev) => !prev)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 transition ${
                  activeDepartment === 'footwear' ? 'bg-black text-white' : 'hover:bg-neutral-100'
                }`}
              >
                <span>Footwear</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>

              {footwearDropdownOpen && (
                <div className="absolute left-0 z-50 w-52 border-2 border-black bg-white shadow-lg">
                  <button
                    type="button"
                    onClick={() => handleNavClick('footwear', 'all')}
                    className="block w-full border-b border-neutral-200 px-4 py-2.5 text-left text-xs font-bold uppercase hover:bg-black hover:text-white"
                  >
                    All Footwear
                  </button>
                  {footwearSubcategories.map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => handleNavClick('footwear', sub.name)}
                      className="block w-full px-4 py-2.5 text-left text-xs font-bold uppercase hover:bg-black hover:text-white"
                    >
                      {sub.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleNavClick('clothes', 'all')}
              className={`px-3 py-1.5 transition ${
                activeDepartment === 'clothes' ? 'bg-black text-white' : 'hover:bg-neutral-100'
              }`}
            >
              Clothes
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('accessories', 'all')}
              className={`px-3 py-1.5 transition ${
                activeDepartment === 'accessories' ? 'bg-black text-white' : 'hover:bg-neutral-100'
              }`}
            >
              Accessories
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('specials', 'all')}
              className={`px-3 py-1.5 transition ${
                activeDepartment === 'specials' ? 'bg-black text-white' : 'hover:bg-neutral-100'
              }`}
            >
              Specials
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}