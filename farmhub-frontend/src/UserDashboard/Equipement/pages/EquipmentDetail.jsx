import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Clock, User, Phone, Loader2 } from 'lucide-react';
import BookingForm from '../components/BookingForm';
import api from '../../../services/api';

const EquipmentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [equipment, setEquipment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEquipment = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await api.get(`/equipment/${id}`);
                setEquipment(data);
            } catch (err) {
                setError(err.message || 'Failed to load equipment details.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchEquipment();
        }
    }, [id]);

    const handleBack = (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Navigate directly to book equipment tab
        navigate('/dashboard/equipment/book', { replace: false });
    };

    if (loading) {
        return (
            <div className="px-6 py-6 max-w-7xl mx-auto flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                <span className="ml-3 text-gray-600">Loading equipment details...</span>
            </div>
        );
    }

    if (error || !equipment) {
        return (
            <div className="px-6 py-6 max-w-7xl mx-auto text-center py-12">
                <p className="text-red-600 text-lg">{error || 'Equipment not found.'}</p>
                <button
                    type="button"
                    onClick={handleBack}
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                    Back to Equipment
                </button>
            </div>
        );
    }

    const availableSlots = equipment.availableSlots?.filter((slot) => !slot.booked) || [];

    return (
        <div className="px-6 py-6 max-w-7xl mx-auto">
            <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors hover:underline"
            >
                <ArrowLeft className="w-5 h-5" />
                Back to Equipment
            </button>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Equipment Info */}
                <div>
                    <img
                        src={equipment.imageUrl || equipment.image || `https://placehold.co/600x400?text=${equipment.name.replace(/\s+/g, '+')}`}
                        alt={equipment.name}
                        className="w-full h-96 object-cover rounded-xl mb-6 shadow-md"
                    />

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{equipment.name}</h1>
                                <p className="text-lg text-gray-600">{equipment.type}</p>
                            </div>
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-semibold whitespace-nowrap">
                                {equipment.availability === 'AVAILABLE' ? 'Available' : 'Unavailable'}
                            </span>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <MapPin className="w-5 h-5 text-green-600" />
                                <span className="text-gray-700 font-medium">{equipment.location}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                                    <p className="text-sm text-gray-600 mb-1">Per Hour</p>
                                    <p className="text-2xl font-bold text-green-600">RWF {equipment.hourlyRate}</p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                                    <p className="text-sm text-gray-600 mb-1">Per Day</p>
                                    <p className="text-2xl font-bold text-green-600">RWF {equipment.dailyRate}</p>
                                </div>
                            </div>

                            {equipment.description && (
                                <div className="pt-4 border-t border-gray-100">
                                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                                    <p className="text-gray-600 leading-relaxed">{equipment.description}</p>
                                </div>
                            )}

                            <div className="pt-4 border-t border-gray-100">
                                <h3 className="font-semibold text-gray-900 mb-3">Owner Information</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-gray-100 p-2 rounded-full">
                                            <User className="w-5 h-5 text-gray-600" />
                                        </div>
                                        <span className="text-gray-700 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                                            {equipment.owner?.name || equipment.ownerName || (equipment.farmer?.firstName ? `${equipment.farmer.firstName} ${equipment.farmer.lastName}` : null) || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="bg-gray-100 p-2 rounded-full">
                                            <Phone className="w-5 h-5 text-gray-600" />
                                        </div>
                                        <span className="text-gray-700 font-medium">
                                            {equipment.owner?.phone || equipment.farmer?.phone || equipment.farmer?.phoneNumber || 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Booking Section */}
                <div>
                    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Availability Details</h2>

                        {availableSlots.length > 0 ? (
                            <div className="space-y-3">
                                <p className="text-gray-600 mb-4">
                                    This equipment is available for the following time slots:
                                </p>
                                <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                    {availableSlots.map((slot, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Calendar className="w-5 h-5 text-green-600" />
                                                <div>
                                                    <p className="font-semibold text-gray-900">{slot.date}</p>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                                        <Clock className="w-4 h-4" />
                                                        <span>
                                                            {slot.startTime} - {slot.endTime}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="px-3 py-1 bg-green-600 text-white text-xs rounded-full font-semibold uppercase tracking-wider">
                                                Active
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-orange-50 rounded-lg border border-orange-200">
                                <p className="text-orange-600 font-semibold text-lg">Fully Booked</p>
                                <p className="text-gray-600 mt-2">There are currently no available time slots setup by the owner.</p>
                            </div>
                        )}
                    </div>

                    {availableSlots.length > 0 && equipment.availability === 'AVAILABLE' && (
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Make a Booking</h2>
                            <BookingForm equipment={equipment} availableSlots={availableSlots} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EquipmentDetail;
