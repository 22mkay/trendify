import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, Heart, ShoppingBag } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function CartDrawer({ mode, onClose, onSwitchMode, onStartCheckout }) {
  const {
    cart,
    updateCartQty,
    removeFromCart,
    wishlist,
    toggleWishlist,
    addToCart,
    applyPromoCode,
    appliedPromo,
    subtotal,
    discount,
  } = useStore();

  const [promoInput, setPromoInput] = useState('');
  const [promoFeedback, setPromoFeedback] = useState(null);
  const [wishlistSizes, setWishlistSizes] = useState({});

  if (!mode) return null;

  const handlePromoSubmit = (e) => {
    e.preventDefault();
    const result = applyPromoCode(promoInput);
    setPromoFeedback(result);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75">
      <div className="flex h-full w-full max-w-md flex-col justify-between border-l-2 border-black bg-white text-black">
        {/* Top Drawer Header */}
        <div className="border-b border-black p-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onSwitchMode('cart')}
                className={`flex items-center gap-1.5 border border-black px-3 py-1.5 text-xs font-bold uppercase ${
                  mode === 'cart' ? 'bg-black text-white' : 'bg-white text-black'
                }`}
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                Cart ({cart.reduce((s, i) => s + i.qty, 0)})
              </button>
              <button
                type="button"
                onClick={() => onSwitchMode('wishlist')}
                className={`flex items-center gap-1.5 border border-black px-3 py-1.5 text-xs font-bold uppercase ${
                  mode === 'wishlist' ? 'bg-black text-white' : 'bg-white text-black'
                }`}
              >
                <Heart className="h-3.5 w-3.5" />
                Wishlist ({wishlist.length})
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="border border-black p-1.5 hover:bg-black hover:text-white"
              aria-label="Close drawer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {mode === 'cart' ? (
            cart.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-sm font-bold uppercase">Your cart is empty</p>
                <p className="mt-1 text-xs text-neutral-500">
                  Select sneakers or clothes and choose a size to begin.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={`${item.id}-${item.selectedSize}`}
                    className="flex gap-3 border border-black p-3"
                  >
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="h-20 w-20 shrink-0 border border-black object-cover grayscale"
                    />
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-black uppercase">{item.name}</h4>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id, item.selectedSize)}
                            className="text-neutral-500 hover:text-black"
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="mt-0.5 text-[11px] font-bold uppercase text-neutral-600">
                          Size: {item.selectedSize}
                        </p>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center border border-black">
                          <button
                            type="button"
                            onClick={() => updateCartQty(item.id, item.selectedSize, -1)}
                            className="p-1 hover:bg-neutral-100"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-2.5 text-xs font-bold">{item.qty}</span>
                          <button
                            type="button"
                            onClick={() => updateCartQty(item.id, item.selectedSize, 1)}
                            className="p-1 hover:bg-neutral-100"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="text-xs font-black">
                          R{(Number(item.price) * item.qty).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : wishlist.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm font-bold uppercase">Your wishlist is empty</p>
              <p className="mt-1 text-xs text-neutral-500">
                Tap the heart icon on any sneaker or clothing item to save it here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {wishlist.map((item) => {
                const chosenSize = wishlistSizes[item.id] || item.sizes?.[0] || '';
                return (
                  <div key={item.id} className="border border-black p-3">
                    <div className="flex gap-3">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-20 w-20 shrink-0 border border-black object-cover grayscale"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h4 className="text-xs font-black uppercase">{item.name}</h4>
                          <button
                            type="button"
                            onClick={() => toggleWishlist(item)}
                            className="text-[10px] font-bold uppercase underline"
                          >
                            Remove
                          </button>
                        </div>
                        <p className="mt-1 text-sm font-black">R{Number(item.price).toFixed(2)}</p>

                        <div className="mt-2 flex flex-wrap gap-1">
                          {(item.sizes || []).map((sz) => (
                            <button
                              key={sz}
                              type="button"
                              onClick={() =>
                                setWishlistSizes((prev) => ({ ...prev, [item.id]: sz }))
                              }
                              className={`border px-2 py-0.5 text-[10px] font-bold uppercase ${
                                chosenSize === sz
                                  ? 'border-black bg-black text-white'
                                  : 'border-neutral-300 bg-white text-black'
                              }`}
                            >
                              {sz}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        addToCart(item, chosenSize);
                        onSwitchMode('cart');
                      }}
                      className="mt-3 w-full bg-black py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-800"
                    >
                      Move to Cart
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Cart Footer: Promo Code + Checkout Trigger */}
        {mode === 'cart' && cart.length > 0 && (
          <div className="border-t-2 border-black bg-neutral-50 p-4">
            <form onSubmit={handlePromoSubmit} className="mb-3 flex gap-2">
              <input
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                placeholder="Promo code"
                className="flex-1 border border-black bg-white px-3 py-2 text-xs uppercase outline-none"
              />
              <button
                type="submit"
                className="border border-black bg-white px-3 py-2 text-xs font-bold uppercase hover:bg-black hover:text-white"
              >
                Apply
              </button>
            </form>

            {promoFeedback && (
              <p
                className={`mb-2 text-xs font-bold ${
                  promoFeedback.success ? 'text-black' : 'text-neutral-600'
                }`}
              >
                {promoFeedback.message}
              </p>
            )}

            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>R{subtotal.toFixed(2)}</span>
              </div>
              {appliedPromo && (
                <div className="flex justify-between font-bold">
                  <span>Discount ({appliedPromo.code})</span>
                  <span>-R{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-black pt-2 text-sm font-black">
                <span>Items Total</span>
                <span>R{Math.max(0, subtotal - discount).toFixed(2)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onStartCheckout();
              }}
              className="mt-4 w-full bg-black py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-neutral-800"
            >
              Proceed to Address &amp; Delivery &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}