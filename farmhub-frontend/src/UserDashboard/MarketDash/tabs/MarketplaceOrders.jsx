import React, { useState, useEffect } from "react";
import OrderItem from "../../DashComponents/marketplace/OrderItem";
import api from "../../../services/api";
import { Loader2, ShoppingBag } from "lucide-react";

const MarketplaceOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get("/order/my-orders");
      // Normalise to the shape OrderItem expects
      const normalised = (data || []).map((o) => ({
        id: o.id,
        product: o.productName || o.product || "Product",
        price: o.totalAmount || o.price || 0,
        status: o.status || "PENDING",
        date: o.createdAt
          ? new Date(o.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
          : "—",
      }));
      setOrders(normalised);
    } catch (err) {
      setError(err.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        <span className="ml-3 text-gray-600">Loading orders…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500">{error}</p>
        <button
          onClick={fetchOrders}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-lg shadow-md">
        <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Orders Yet</h3>
        <p className="text-gray-500">Your marketplace orders will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((o) => (
        <OrderItem key={o.id} order={o} />
      ))}
    </div>
  );
};

export default MarketplaceOrders;
