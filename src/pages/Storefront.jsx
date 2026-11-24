import React from 'react';
import { ExternalLink } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';

export default function Storefront() {
  const {
    filteredProducts,
    categories,
    brands,
    activeDepartment,
    selectDepartment,
    activeSubcategory,
    setActiveSubcategory,
    activeBrand,
    setActiveBrand,
    searchQuery,
    setSearchQuery,
    settings,
  } = useStore();

  const currentSubcategories = categories.filter((c) => c.department === activeDepartment);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      {/* Hero Section */}
      <section className="mb-8 border-2 border-black bg-black p-6 text-white sm:p-10">
        <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">
          Strictly Monochrome
        </p>
        <h1 className="mt-2 max-w-2xl text-3xl font-black uppercase tracking-tight sm:text-5xl">
          Footwear, Streetwear &amp; Accessories.
        </h1>
        <p className="mt-3 max-w-xl text-sm text-neutral-300">
          Browse sneakers, slides, jackets, tracksuits, watches, and caps by brand or category.
          Sign in to place your order directly via WhatsApp.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => selectDepartment('footwear', 'Sneakers')}
            className="bg-white px-5 py-2.5 text-xs font-black uppercase tracking-widest text-black hover:bg-neutral-200"
          >
            Shop Sneakers
          </button>
          <button
            type="button"
            onClick={() => selectDepartment('footwear', 'Slides & Open Shoes')}
            className="border border-white px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white hover:bg-white hover:text-black"
          >
            Slides &amp; Open Shoes
          </button>
          <button
            type="button"
            onClick={() => selectDepartment('accessories', 'all')}
            className="border border-white px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white hover:bg-white hover:text-black"
          >
            Accessories
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

      {/* Dynamic Subcategory Pills (for Footwear, Clothes, or Accessories) */}
      {currentSubcategories.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-neutral-500">
            {activeDepartment}:
          </span>
          <button
            type="button"
            onClick={() => setActiveSubcategory('all')}
            className={`border border-black px-3 py-1 text-xs font-bold uppercase ${
              activeSubcategory === 'all' ? 'bg-black text-white' : 'bg-white text-black'
            }`}
          >
            All {activeDepartment}
          </button>
          {currentSubcategories.map((sub) => (
            <button
              key={sub.id}
              type="button"
              onClick={() => setActiveSubcategory(sub.name)}
              className={`border border-black px-3 py-1 text-xs font-bold uppercase ${
                activeSubcategory === sub.name ? 'bg-black text-white' : 'bg-white text-black'
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>
      )}

      {/* Brand Filter Strip */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-black pb-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[11px] font-black uppercase tracking-wider text-neutral-500">
            Brands:
          </span>
          <button
            type="button"
            onClick={() => setActiveBrand('all')}
            className={`border px-2.5 py-1 text-[11px] font-bold uppercase ${
              activeBrand === 'all'
                ? 'border-black bg-black text-white'
                : 'border-neutral-300 bg-white text-black hover:border-black'
            }`}
          >
            All Brands
          </button>
          {brands.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setActiveBrand(b.name)}
              className={`border px-2.5 py-1 text-[11px] font-bold uppercase ${
                activeBrand === b.name
                  ? 'border-black bg-black text-white'
                  : 'border-neutral-300 bg-white text-black hover:border-black'
              }`}
            >
              {b.name}
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
          <p className="text-sm font-bold uppercase">No matching items found</p>
          {(searchQuery || activeSubcategory !== 'all' || activeBrand !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                selectDepartment('all', 'all');
                setActiveBrand('all');
              }}
              className="mt-3 border border-black px-4 py-2 text-xs font-bold uppercase hover:bg-black hover:text-white"
            >
              Reset All Filters
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