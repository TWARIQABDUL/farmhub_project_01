import React, { useState, useEffect } from 'react';
import { Calendar, Package, Wrench, ShoppingBag, Clock, Loader2 } from 'lucide-react';
import api from '../../services/api';

const ProfileHistory = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            setLoading(true);
            setError(null);

            // Parallel fetch orders and bookings
            const [ordersResult, bookingsResult] = await Promise.allSettled([
                api.get('/order/my-orders'),
                api.get('/bookings/my-bookings'),
            ]);

            const orders = ordersResult.status === 'fulfilled' ? (ordersResult.value || []) : [];
            const bookings = bookingsResult.status === 'fulfilled' ? (bookingsResult.value || []) : [];

            const combined = [
                ...orders.map((o) => ({
                    id: `order-${o.id}`,
                    type: 'order',
                    title: `Ordered ${o.productName || o.product || 'Product'}`,
                    description: `Order #${o.id} — RWF ${(o.totalAmount || o.price || 0).toLocaleString()}`,
                    date: o.createdAt,
                    status: o.status,
                })),
                ...bookings.map((b) => ({
                    id: `booking-${b.id}`,
                    type: 'booking',
                    title: `Booked ${b.equipmentName || 'Equipment'}`,
                    description: `Booking #${b.id} — ${b.startDate || ''} ${b.startTime || ''}`,
                    date: b.createdAt,
                    status: b.status,
                })),
            ]
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 50);

            setActivities(combined);
        } catch (err) {
            setError(err.message || 'Failed to load history.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'COMPLETED':
            case 'DELIVERED':
            case 'CONFIRMED':
                return 'bg-green-100 text-green-700';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-700';
            case 'CANCELLED':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                <span className="ml-3 text-gray-600">Loading history…</span>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Activity History</h2>

            {error && (
                <div className="text-center py-8">
                    <p className="text-red-500">{error}</p>
                    <button onClick={loadHistory} className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg">
                        Retry
                    </button>
                </div>
            )}

            {!error && activities.length > 0 ? (
                <div className="space-y-4">
                    {activities.map((activity) => (
                        <div
                            key={activity.id}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start gap-4">
                                <div
                                    className={`p-2 rounded-lg ${
                                        activity.type === 'order'
                                            ? 'bg-blue-100 text-blue-600'
                                            : 'bg-purple-100 text-purple-600'
                                    }`}
                                >
                                    {activity.type === 'order' ? (
                                        <ShoppingBag className="w-5 h-5" />
                                    ) : (
                                        <Wrench className="w-5 h-5" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                                            <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                                        </div>
                                        {activity.status && (
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(activity.status)}`}
                                            >
                                                {activity.status}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-500 text-sm mt-2">
                                        <Clock className="w-4 h-4" />
                                        <span>{formatDate(activity.date)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : !error ? (
                <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">No activity history yet</p>
                    <p className="text-gray-500 text-sm mt-2">
                        Your orders, bookings, and activities will appear here.
                    </p>
                </div>
            ) : null}
        </div>
    );
};

export default ProfileHistory;
