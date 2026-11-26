import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { DELIVERY_OPTIONS } from '../config/deliveryOptions';

export default function CheckoutWizard({
  cart,
  subtotal,
  discount,
  settings,
  user,
  onRequireLogin,
  onClose,
  onClearCart,
}) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    street: '',
    suburb: '',
    city: '',
    province: 'Gauteng',
    postalCode: '',
  });

  const [delivery, setDelivery] = useState(DELIVERY_OPTIONS[1] || DELIVERY_OPTIONS[0]);
  const grandTotal = Math.max(0, subtotal - discount) + delivery.fee;

  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
        <div className="w-full max-w-md border-2 border-black bg-white p-6 text-black shadow-2xl">
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">
            Login Required
          </p>
          <h2 className="mt-1 text-xl font-black uppercase">Sign In to Place Your Order</h2>
          <p className="mt-2 text-xs text-neutral-600">
            Customers must be signed in before entering a delivery address or transferring an order to WhatsApp.
          </p>
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={onRequireLogin}
              className="flex-1 bg-black py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-neutral-800"
            >
              Sign In / Create Account
            </button>
            <button
              type="button"
              onClick={onClose}
              className="border border-black px-4 py-3 text-xs font-bold uppercase hover:bg-neutral-100"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const buildWhatsAppUrl = (orderId) => {
    const lines = [
      `*NEW TRENDIFY ORDER #${orderId.slice(0, 8).toUpperCase()}*`,
      `------------------------------`,
      `*Customer:* ${address.fullName} (${user.email})`,
      `*Phone:* ${address.phone}`,
      `*Delivery Address:* ${address.street}, ${address.suburb}, ${address.city}, ${address.province}, ${address.postalCode}`,
      `*Delivery Option:* ${delivery.label} (${delivery.fee === 0 ? 'FREE' : `R${delivery.fee.toFixed(2)}`})`,
      `------------------------------`,
      `*Order Items:*`,
      ...cart.map(
        (item, idx) =>
          `${idx + 1}. ${item.name} [Size: ${item.selectedSize}] x${item.qty} - R${(
            Number(item.price) * item.qty
          ).toFixed(2)}`
      ),
  
      `------------------------------`,
      ...(discount > 0 ? [`*Promo Discount:* -R${discount.toFixed(2)}`] : []),
      `*Total Payable:* R${grandTotal.toFixed(2)}`,
      ...(settings?.account_number
        ? [
            `------------------------------`,
            `*EFT Banking Details:*`,
            `Bank: ${settings.bank_name}`,
            `Account Holder: ${settings.account_holder}`,
            `Account Number: ${settings.account_number}`,
            `Branch Code: ${settings.branch_code}`,
            `Reference: #${orderId.slice(0, 8).toUpperCase()}`,
          ]
        : []),
            ``,
      `Please confirm stock availability and I will send proof of payment.`,
    ];

    const phone = (settings?.whatsapp_number || '27000000000').replace(/\D/g, '');
    return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join('\n'))}`;
  };

  const handleTransferToWhatsApp = async () => {
    if (!user) {
      onRequireLogin();
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([
          {
            customer_name: address.fullName,
            customer_email: user.email,
            customer_phone: address.phone,
            delivery_address: { ...address, email: user.email, user_id: user.id },
            delivery_method: delivery.label,
            delivery_fee: delivery.fee,
            items: cart,
            total_amount: grandTotal,
            status: 'transferred_to_whatsapp',
          },
        ])
        .select()
        .single();

      if (error) throw error;

      const waUrl = buildWhatsAppUrl(data.id);
      onClearCart();
      window.open(waUrl, '_blank', 'noopener,noreferrer');
      onClose();
    } catch (err) {
      alert(`Could not record order: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-lg border-2 border-black bg-white p-6 text-black shadow-2xl">
        <div className="mb-6 flex items-center justify-between border-b border-black pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">
              Step {step} of 2 &bull; {user.email}
            </p>
            <h2 className="text-xl font-black uppercase tracking-tight">
              {step === 1 ? 'Delivery Address' : 'Delivery Options & WhatsApp'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="border border-black px-3 py-1 text-xs font-bold uppercase hover:bg-black hover:text-white"
          >
            Close
          </button>
        </div>

        {step === 1 && (
          <form onSubmit={handleAddressSubmit} className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                required
                placeholder="Full Name"
                value={address.fullName}
                onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                className="border border-black p-2.5 text-sm outline-none focus:bg-neutral-100"
              />
              <input
                required
                placeholder="WhatsApp / Mobile Number"
                value={address.phone}
                onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                className="border border-black p-2.5 text-sm outline-none focus:bg-neutral-100"
              />
            </div>

            <input
              required
              placeholder="Street Address & Unit / Complex"
              value={address.street}
              onChange={(e) => setAddress({ ...address, street: e.target.value })}
              className="w-full border border-black p-2.5 text-sm outline-none focus:bg-neutral-100"
            />

            <div className="grid grid-cols-2 gap-3">
              <input
                required
                placeholder="Suburb"
                value={address.suburb}
                onChange={(e) => setAddress({ ...address, suburb: e.target.value })}
                className="border border-black p-2.5 text-sm outline-none focus:bg-neutral-100"
              />
              <input
                required
                placeholder="City"
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                className="border border-black p-2.5 text-sm outline-none focus:bg-neutral-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <select
                value={address.province}
                onChange={(e) => setAddress({ ...address, province: e.target.value })}
                className="border border-black bg-white p-2.5 text-sm outline-none"
              >
                <option>Gauteng</option>
                <option>Western Cape</option>
                <option>KwaZulu-Natal</option>
                <option>Eastern Cape</option>
                <option>Free State</option>
                <option>Limpopo</option>
                <option>Mpumalanga</option>
                <option>North West</option>
                <option>Northern Cape</option>
              </select>
              <input
                required
                placeholder="Postal Code"
                value={address.postalCode}
                onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                className="border border-black p-2.5 text-sm outline-none focus:bg-neutral-100"
              />
            </div>

            <button
              type="submit"
              className="mt-4 w-full bg-black py-3 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-neutral-800"
            >
              Continue to Delivery Options &rarr;
            </button>
          </form>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="border border-neutral-300 bg-neutral-50 p-3 text-xs">
              <div className="flex justify-between">
                <span className="font-bold uppercase">Delivery Address:</span>
                <button type="button" onClick={() => setStep(1)} className="underline">
                  Change Address
                </button>
              </div>
              <p className="mt-1 text-neutral-700">
                {address.fullName} ({address.phone}) &bull; {address.street}, {address.suburb},{' '}
                {address.city}, {address.province}, {address.postalCode}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider">
                Choose Delivery Option
              </p>
              <div className="space-y-2">
                {DELIVERY_OPTIONS.map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex cursor-pointer items-center justify-between border p-3 text-sm ${
                      delivery.id === opt.id
                        ? 'border-2 border-black bg-neutral-100 font-bold'
                        : 'border-neutral-300'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="delivery"
                        checked={delivery.id === opt.id}
                        onChange={() => setDelivery(opt)}
                        className="accent-black"
                      />
                      {opt.label}
                    </span>
                    <span>{opt.fee === 0 ? 'FREE' : `R${opt.fee.toFixed(2)}`}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t border-black pt-3 text-sm">
              <div className="flex justify-between text-neutral-600">
                <span>Items Subtotal</span>
                <span>R{subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-neutral-600">
                  <span>Promo Discount</span>
                  <span>-R{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-600">
                <span>Delivery</span>
                <span>{delivery.fee === 0 ? 'FREE' : `R${delivery.fee.toFixed(2)}`}</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-neutral-300 pt-2 text-base font-black">
                <span>TOTAL</span>
                <span>R{grandTotal.toFixed(2)}</span>
              </div>
            </div>
            {settings?.account_number && (
              <div className="border border-black bg-neutral-50 p-3 text-xs">
                <p className="font-black uppercase tracking-wider">EFT Payment Details</p>
                <div className="mt-1.5 grid grid-cols-2 gap-1 text-neutral-700">
                  <span>Bank:</span>
                  <span className="font-bold text-black">{settings.bank_name}</span>
                  <span>Account Holder:</span>
                  <span className="font-bold text-black">{settings.account_holder}</span>
                  <span>Account Number:</span>
                  <span className="font-bold text-black">{settings.account_number}</span>
                  <span>Branch Code:</span>
                  <span className="font-bold text-black">{settings.branch_code}</span>
                  <span>Account Type:</span>
                  <span className="font-bold text-black">{settings.account_type}</span>
                </div>
                <p className="mt-2 text-[11px] text-neutral-600">
                  Use your Order ID as payment reference and send Proof of Payment on WhatsApp.
                </p>
              </div>
            )}

            <button
              type="button"
              disabled={loading}
              onClick={handleTransferToWhatsApp}
              className="w-full bg-black py-3.5 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-neutral-800 disabled:opacity-50"
            >
              {loading ? 'Transferring...' : 'Transfer Order to WhatsApp'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}