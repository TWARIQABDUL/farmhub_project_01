import React, { useState, useEffect } from 'react';
import OrderCard from '../components/OrderCard';
import MyOrderCard from '../components/MyOrderCard';
import api from '../../../services/api';
import { Loader2 } from 'lucide-react';

const OrdersEquipment = () => {
    const [myOrders, setMyOrders] = useState([]);
    const [ordersForMe, setOrdersForMe] = useState([]);
    const [activeTab, setActiveTab] = useState('forMe');
    const [statusFilter, setStatusFilter] = useState('All');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            setLoading(true);
            setError(null);
            // Parallel fetch: bookings I made + bookings on my equipment
            const [myBookings, equipmentBookings] = await Promise.all([
                api.get('/bookings/my-bookings'),
                api.get('/bookings/my-equipment-bookings'),
            ]);
            setMyOrders(myBookings || []);
            setOrdersForMe(equipmentBookings || []);
        } catch (err) {
            setError(err.message || 'Failed to load orders.');
        } finally {
            setLoading(false);
        }
    };

    const getFilteredOrders = (orders) => {
        if (statusFilter === 'All') return orders;
        return orders.filter((order) => order.status === statusFilter);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                <span className="ml-3 text-gray-600">Loading orders…</span>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Equipment Orders</h2>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                    <option value="All">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                </select>
            </div>

            {error && (
                <div className="text-center py-8">
                    <p className="text-red-500">{error}</p>
                    <button onClick={loadOrders} className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg">
                        Retry
                    </button>
                </div>
            )}

            <div className="border-b border-gray-200 mb-6">
                <div className="flex space-x-8">
                    <button
                        onClick={() => setActiveTab('forMe')}
                        className={`pb-3 px-1 font-medium text-sm transition-colors ${activeTab === 'forMe'
                            ? 'text-green-700 border-b-2 border-green-700'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Orders for My Equipment ({ordersForMe.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('myOrders')}
                        className={`pb-3 px-1 font-medium text-sm transition-colors ${activeTab === 'myOrders'
                            ? 'text-green-700 border-b-2 border-green-700'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        My Orders ({myOrders.length})
                    </button>
                </div>
            </div>

            {activeTab === 'forMe' ? (
                <>
                    {getFilteredOrders(ordersForMe).length > 0 ? (
                        <div className="space-y-4">
                            {getFilteredOrders(ordersForMe).map((order) => (
                                <OrderCard key={order.id} order={order} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-xl">
                            <p className="text-gray-600 text-lg">No orders for your equipment.</p>
                            <p className="text-gray-500 text-sm mt-2">
                                When people book your equipment, orders will appear here.
                            </p>
                        </div>
                    )}
                </>
            ) : (
                <>
                    {getFilteredOrders(myOrders).length > 0 ? (
                        <div className="space-y-4">
                            {getFilteredOrders(myOrders).map((order) => (
                                <MyOrderCard key={order.id} order={order} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-xl">
                            <p className="text-gray-600 text-lg">You haven't made any orders yet.</p>
                            <p className="text-gray-500 text-sm mt-2">
                                Book equipment from the "Book Equipment" tab to see your orders here.
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default OrdersEquipment;
