import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StatCard from "./DashComponents/StatCard";
import QuickActionButton from "./DashComponents/QuickActionButton";
import ActivityItem from "./DashComponents/ActivityItem";
import WeatherWidget from "./DashComponents/WeatherWidget";
import AlertCard from "./DashComponents/AlertCard";
import AuthUtils from "../utils/authUtils";
import api from "../services/api";
import {
  ShoppingBag,
  Wrench,
  MessageSquare,
  Scan,
  PlusCircle,
  TrendingUp,
  DollarSign,
  Package,
  Calendar,
  ArrowRight,
  Clock,
  Loader2
} from "lucide-react";

const Overview = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrders: 0,
    equipmentRentals: 0,
    diagnosisResults: 0,
    totalRevenue: 0,
    activeListings: 0,
    pendingOrders: 0
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = AuthUtils.getCurrentUser();
    setCurrentUser(user);
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Parallel fetch all data sources
      const [orders, bookings, myEquipment] = await Promise.allSettled([
        api.get('/order/my-orders'),
        api.get('/bookings/my-bookings'),
        api.get('/equipment/my-equipment'),
      ]);

      const orderList = orders.status === 'fulfilled' ? (orders.value || []) : [];
      const bookingList = bookings.status === 'fulfilled' ? (bookings.value || []) : [];
      const equipmentList = myEquipment.status === 'fulfilled' ? (myEquipment.value || []) : [];

      // Calculate stats
      const totalOrders = orderList.length + bookingList.length;
      const equipmentRentals = bookingList.length;
      const pendingOrders = [...orderList, ...bookingList].filter(
        (o) => o.status === 'PENDING'
      ).length;

      const completedOrders = orderList.filter(
        (o) => o.status === 'COMPLETED' || o.status === 'DELIVERED' || o.status === 'CONFIRMED'
      );
      const totalRevenue = completedOrders.reduce(
        (sum, o) => sum + (o.totalAmount || o.price || 0), 0
      );

      const activeListings = equipmentList.filter(
        (eq) => eq.availability === 'AVAILABLE'
      ).length;

      setStats({
        totalOrders,
        equipmentRentals,
        diagnosisResults: 0, // No diagnosis history endpoint yet
        totalRevenue,
        activeListings,
        pendingOrders
      });

      // Build recent activity feed
      const activities = [
        ...bookingList.slice(0, 3).map((b) => ({
          text: b.equipmentName
            ? `Equipment "${b.equipmentName}" was booked`
            : 'New equipment booking received',
          time: formatTimeAgo(b.createdAt),
          type: 'equipment'
        })),
        ...orderList.slice(0, 2).map((o) => ({
          text: o.productName
            ? `Order for "${o.productName}" received`
            : 'New marketplace order',
          time: formatTimeAgo(o.createdAt),
          type: 'marketplace'
        }))
      ].slice(0, 5);

      setRecentActivity(activities.length > 0 ? activities : []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-6 sm:mb-8">
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
            👋 Welcome Back, {AuthUtils.getUserDisplayName(currentUser)}!
          </h1>
          <p className="text-green-50 text-sm sm:text-base">
            Here's your farm's activity overview for today
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          <span className="ml-3 text-gray-600">Loading dashboard…</span>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-5 mb-6 sm:mb-8">
            <StatCard title="Total Orders" value={stats.totalOrders} icon={ShoppingBag} color="bg-green-500" trend="+12%" />
            <StatCard title="Equipment" value={stats.equipmentRentals} icon={Wrench} color="bg-blue-500" />
            <StatCard title="Diagnosis" value={stats.diagnosisResults} icon={Scan} color="bg-yellow-500" />
            <StatCard title="Revenue" value={`RWF ${(stats.totalRevenue / 1000).toFixed(0)}K`} icon={DollarSign} color="bg-emerald-500" />
            <StatCard title="Active Listings" value={stats.activeListings} icon={Package} color="bg-purple-500" />
            <StatCard title="Pending" value={stats.pendingOrders} icon={Clock} color="bg-orange-500" />
          </div>

          {/* Quick Actions */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Quick Actions</h2>
              <button
                onClick={() => navigate('/dashboard/marketplace')}
                className="hidden sm:flex items-center gap-2 text-green-600 hover:text-green-700 text-sm font-medium"
              >
                View All <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <QuickActionButton label="Post Produce" icon={PlusCircle} onClick={() => navigate('/dashboard/marketplace')} />
              <QuickActionButton label="Post Equipment" icon={Wrench} onClick={() => navigate('/dashboard/equipment/share')} />
              <QuickActionButton label="Diagnosis" icon={Scan} onClick={() => navigate('/dashboard/diagnosis')} />
              <QuickActionButton label="Marketplace" icon={ShoppingBag} onClick={() => navigate('/dashboard/marketplace')} />
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 sm:mb-8">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    Alerts
                  </h2>
                </div>
                <div className="space-y-3">
                  {stats.pendingOrders > 0 && (
                    <AlertCard message={`📦 You have ${stats.pendingOrders} pending orders waiting for confirmation.`} />
                  )}
                  <AlertCard message="⚠️ Rain expected tomorrow — consider harvesting today." />
                  <AlertCard message="🐛 Pest alert in your district — maize leaf blight risk high." />
                </div>
              </div>
            </div>
            <div className="lg:col-span-2">
              <WeatherWidget />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-md p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-600" />
                Recent Activity
              </h2>
              <button
                onClick={() => navigate('/dashboard/profile')}
                className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
              >
                View All <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <ActivityItem key={index} text={activity.text} time={activity.time} type={activity.type} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No recent activity yet. Start by posting produce or equipment!</p>
              </div>
            )}
          </div>

          {/* Quick Stats Row */}
          <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 sm:p-6 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">This Month</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                  <p className="text-xs text-gray-500 mt-1">Total Orders</p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 sm:p-6 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">RWF {stats.totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">Total Earnings</p>
                </div>
                <DollarSign className="w-10 h-10 text-blue-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 sm:p-6 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeListings}</p>
                  <p className="text-xs text-gray-500 mt-1">Listings</p>
                </div>
                <Package className="w-10 h-10 text-purple-600" />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Overview;
