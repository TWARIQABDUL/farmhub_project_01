import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader2 } from 'lucide-react';
import MyEquipmentCard from '../components/MyEquipmentCard';
import BookingsModal from '../components/BookingsModal';
import api from '../../../services/api';

const ShareEquipment = () => {
    const navigate = useNavigate();
    const [myEquipment, setMyEquipment] = useState([]);
    const [selectedEquipment, setSelectedEquipment] = useState(null);
    const [showBookingsModal, setShowBookingsModal] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadEquipment = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await api.get('/equipment/my-equipment');
            setMyEquipment(data || []);
        } catch (err) {
            setError(err.message || 'Failed to load your equipment.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEquipment();
        // Refresh when window gains focus
        const handleFocus = () => loadEquipment();
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, []);

    const handleAddEquipment = () => navigate('/dashboard/equipment/add');

    const handleEdit = (equipment) => navigate(`/dashboard/equipment/edit/${equipment.id}`);

    const handleDelete = async (equipmentId) => {
        if (!window.confirm('Are you sure you want to delete this equipment?')) return;
        try {
            await api.delete(`/equipment/${equipmentId}`);
            await loadEquipment();
        } catch (err) {
            alert(err.message || 'Failed to delete equipment.');
        }
    };

    const handleViewBookings = async (equipment) => {
        try {
            const allBookings = await api.get('/bookings/my-equipment-bookings');
            const equipmentBookings = (allBookings || []).filter(
                (b) => b.equipmentId === equipment.id
            );
            setSelectedEquipment(equipment);
            setBookings(equipmentBookings);
            setShowBookingsModal(true);
        } catch (err) {
            alert(err.message || 'Failed to load bookings.');
        }
    };

    const handleCloseBookingsModal = () => {
        setShowBookingsModal(false);
        setSelectedEquipment(null);
        setBookings([]);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                <span className="ml-3 text-gray-600">Loading your equipment…</span>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">My Equipment</h2>
                <button
                    onClick={handleAddEquipment}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add Equipment
                </button>
            </div>

            {error && (
                <div className="text-center py-8">
                    <p className="text-red-500">{error}</p>
                    <button onClick={loadEquipment} className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg">
                        Retry
                    </button>
                </div>
            )}

            {!error && myEquipment.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myEquipment.map((item) => (
                        <MyEquipmentCard
                            key={item.id}
                            equipment={item}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onViewBookings={handleViewBookings}
                        />
                    ))}
                </div>
            ) : !error ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <p className="text-gray-600 text-lg mb-4">You haven't posted any equipment yet.</p>
                    <button
                        onClick={handleAddEquipment}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Add Your First Equipment
                    </button>
                </div>
            ) : null}

            {showBookingsModal && selectedEquipment && (
                <BookingsModal
                    equipment={selectedEquipment}
                    bookings={bookings}
                    onClose={handleCloseBookingsModal}
                />
            )}
        </div>
    );
};

export default ShareEquipment;
