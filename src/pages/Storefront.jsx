import React from 'react';
import { ExternalLink } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';

const CATEGORIES = [
  { id: 'all', label: 'All Inventory' },
  { id: 'sneakers', label: 'Sneakers' },
  { id: 'clothes', label: 'Clothes' },
  { id: 'specials', label: 'Specials' },
];

export default function Storefront() {
  const {
    filteredProducts,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    settings,
  } = useStore();

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      {/* Monochrome Hero Banner */}
      <section className="mb-8 border-2 border-black bg-black p-6 text-white sm:p-10">
        <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">
          Strictly Black &amp; White
        </p>
        <h1 className="mt-2 max-w-2xl text-3xl font-black uppercase tracking-tight sm:text-5xl">
          Sneakers &amp; Streetwear Built for Sharp Contrast.
        </h1>
        <p className="mt-3 max-w-xl text-sm text-neutral-300">
          Pick your size, save items to your wishlist or cart, enter your delivery address, choose
          your delivery option, and send your order straight to WhatsApp.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setActiveCategory('sneakers')}
            className="bg-white px-5 py-2.5 text-xs font-black uppercase tracking-widest text-black hover:bg-neutral-200"
          >
            Shop Sneakers
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('clothes')}
            className="border border-white px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white hover:bg-white hover:text-black"
          >
            Shop Clothes
          </button>
          <a
            href={settings.whatsapp_channel_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 border border-neutral-600 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-neutral-200 hover:border-white hover:text-white"
          >
            WhatsApp Channel <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </section>

      {/* Category Filter Tabs */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-black pb-4">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`border border-black px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                activeCategory === cat.id
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-neutral-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <p className="text-xs font-bold uppercase text-neutral-500">
          {filteredProducts.length} {filteredProducts.length === 1 ? 'Item' : 'Items'}
        </p>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="border border-black py-16 text-center">
          <p className="text-sm font-bold uppercase">No matching inventory found</p>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="mt-3 border border-black px-4 py-2 text-xs font-bold uppercase hover:bg-black hover:text-white"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}