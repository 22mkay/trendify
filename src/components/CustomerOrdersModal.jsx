import React, { useState, useEffect } from 'react';
import { X, PackageCheck, Truck, Clock, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const STATUS_STEPS = [
  { key: 'transferred_to_whatsapp', label: 'Order Sent', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: PackageCheck },
  { key: 'dispatched', label: 'Dispatched', icon: Truck },
  { key: 'completed', label: 'Delivered', icon: CheckCircle2 },
];

export default function CustomerOrdersModal({ isOpen, onClose, user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !user?.email) return;

    const loadMyOrders = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_email', user.email)
        .order('created_at', { ascending: false });

      if (!error && data) setOrders(data);
      setLoading(false);
    };

    loadMyOrders();
  }, [isOpen, user]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col border-2 border-black bg-white text-black shadow-2xl">
        <div className="flex items-center justify-between border-b border-black p-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
              {user?.email}
            </p>
            <h2 className="text-xl font-black uppercase">Track My Orders</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="border border-black p-1.5 hover:bg-black hover:text-white"
            aria-label="Close order tracker"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <p className="py-10 text-center text-xs font-bold uppercase">Loading your orders...</p>
          ) : orders.length === 0 ? (
            <div className="border border-neutral-300 py-12 text-center">
              <p className="text-sm font-bold uppercase">No orders found yet</p>
              <p className="mt-1 text-xs text-neutral-500">
                Once you place an order, its status and courier tracking details will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {orders.map((ord) => {
                const currentStepIndex = Math.max(
                  0,
                  STATUS_STEPS.findIndex((s) => s.key === ord.status)
                );

                return (
                  <div key={ord.id} className="border border-black p-4 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 pb-3">
                      <div>
                        <span className="text-sm font-black uppercase">
                          Order #{ord.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span className="ml-2 text-neutral-500">
                          {new Date(ord.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="bg-black px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                        {STATUS_STEPS[currentStepIndex]?.label || ord.status}
                      </span>
                    </div>

                    {/* 4-Step Visual Progress Tracker */}
                    <div className="my-4 grid grid-cols-4 gap-1">
                      {STATUS_STEPS.map((step, idx) => {
                        const Icon = step.icon;
                        const active = idx <= currentStepIndex;
                        return (
                          <div
                            key={step.key}
                            className={`border p-2 text-center ${
                              active
                                ? 'border-black bg-black text-white'
                                : 'border-neutral-200 bg-neutral-50 text-neutral-400'
                            }`}
                          >
                            <Icon className="mx-auto mb-1 h-4 w-4" />
                            <p className="text-[10px] font-bold uppercase">{step.label}</p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Courier & Waybill Details */}
                    <div className="mb-3 border border-neutral-300 bg-neutral-50 p-2.5">
                      <p className="font-bold uppercase">
                        Delivery Method: <span className="font-normal">{ord.delivery_method}</span>
                      </p>
                      {ord.tracking_number ? (
                        <p className="mt-1 font-bold uppercase">
                          Courier: <span className="font-normal">{ord.courier_name || 'Courier'}</span>{' '}
                          &bull; Waybill / Tracking #:{' '}
                          <span className="underline">{ord.tracking_number}</span>
                        </p>
                      ) : (
                        <p className="mt-1 text-neutral-500">
                          Waybill tracking number will appear here once dispatched.
                        </p>
                      )}
                    </div>

                    {/* Ordered Items */}
                    <div className="space-y-1 text-neutral-700">
                      {(ord.items || []).map((item, i) => (
                        <div key={i} className="flex justify-between">
                          <span>
                            {item.name} [Size: {item.selectedSize}] &times; {item.qty}
                          </span>
                          <span className="font-bold">
                            R{(Number(item.price) * item.qty).toFixed(2)}
                          </span>
                        </div>
                      ))}
                      <div className="mt-2 flex justify-between border-t border-neutral-200 pt-2 font-black text-black">
                        <span>Total Paid / Payable</span>
                        <span>R{Number(ord.total_amount).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}