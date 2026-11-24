import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '');

  useEffect(() => {
    setSelectedSize(product.sizes?.[0] || '');
  }, [product.sizes]);

  const isWishlisted = wishlist.some((item) => item.id === product.id);

  return (
    <article className="group flex flex-col justify-between border border-black bg-white transition hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      <div>
        <div className="relative aspect-square overflow-hidden border-b border-black bg-neutral-100">
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover grayscale transition duration-300 group-hover:scale-105 group-hover:grayscale-0"
          />
          {product.is_special && (
            <span className="absolute top-2 left-2 bg-black px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white">
              Special
            </span>
          )}
          <button
            type="button"
            onClick={() => toggleWishlist(product)}
            className={`absolute top-2 right-2 border border-black p-1.5 transition ${
              isWishlisted
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-black hover:text-white'
            }`}
            aria-label={`Save ${product.name} to wishlist`}
          >
            <Heart className="h-4 w-4" fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
            <span>{product.brand || 'Trendify'}</span>
            <span>{product.subcategory || product.category}</span>
          </div>
          <h3 className="mt-1 text-base font-black uppercase leading-snug">{product.name}</h3>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-lg font-black">R{Number(product.price).toFixed(2)}</span>
            {product.compare_at_price && (
              <span className="text-xs text-neutral-400 line-through">
                R{Number(product.compare_at_price).toFixed(2)}
              </span>
            )}
          </div>

          <div className="mt-4">
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              Select Size / Fit
            </p>
            <div className="flex flex-wrap gap-1.5">
              {(product.sizes || []).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-[2.25rem] border px-2 py-1 text-xs font-bold uppercase transition ${
                    selectedSize === size
                      ? 'border-black bg-black text-white'
                      : 'border-neutral-300 bg-white text-black hover:border-black'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 pt-0">
        <button
          type="button"
          disabled={!product.in_stock}
          onClick={() => addToCart(product, selectedSize)}
          className="w-full bg-black py-2.5 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
          {product.in_stock ? 'Add to Cart' : 'Sold Out'}
        </button>
      </div>
    </article>
  );
}