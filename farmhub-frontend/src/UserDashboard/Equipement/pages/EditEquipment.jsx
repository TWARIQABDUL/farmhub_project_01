import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import EquipmentForm from '../components/EquipmentForm';
import api from '../../../services/api';

const EditEquipment = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [equipment, setEquipment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEquipment = async () => {
            try {
                setLoading(true);
                const data = await api.get(`/equipment/${id}`);
                setEquipment(data);
            } catch (err) {
                setError(err.message || 'Failed to load equipment.');
            } finally {
                setLoading(false);
            }
        };
        fetchEquipment();
    }, [id]);

    const handleBack = (e) => {
        e.preventDefault();
        e.stopPropagation();
        navigate('/dashboard/equipment/share', { replace: false });
    };

    const handleSubmit = async (formData) => {
        try {
            const payload = {
                name: formData.name,
                type: formData.type,
                location: formData.location,
                hourlyRate: formData.hourlyRate,
                dailyRate: formData.dailyRate,
                description: formData.description,
                imageUrl: formData.image,
                availableSlots: formData.availableSlots || [],
            };
            await api.patch(`/equipment/${id}`, payload);
            alert('Equipment updated successfully!');
            navigate('/dashboard/equipment/share');
        } catch (err) {
            alert(err.message || 'Failed to update equipment.');
        }
    };

    if (loading) {
        return (
            <div className="px-6 py-6 max-w-4xl mx-auto">
                <div className="text-center py-12">Loading…</div>
            </div>
        );
    }

    if (error || !equipment) {
        return (
            <div className="px-6 py-6 max-w-4xl mx-auto">
                <div className="text-center py-12">
                    <p className="text-red-500">{error || 'Equipment not found.'}</p>
                    <button
                        type="button"
                        onClick={handleBack}
                        className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                        Back to Equipment
                    </button>
                </div>
            </div>
        );
    }

    // Map backend fields to the shape EquipmentForm expects
    const initialData = {
        name: equipment.name || '',
        type: equipment.type || '',
        location: equipment.location || '',
        hourlyRate: equipment.hourlyRate || '',
        dailyRate: equipment.dailyRate || '',
        description: equipment.description || '',
        image: equipment.imageUrl || equipment.image || '',
        availableSlots: equipment.availableSlots || [],
    };

    return (
        <div className="px-6 py-6 max-w-4xl mx-auto">
            <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors cursor-pointer hover:underline focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded px-2 py-1"
            >
                <ArrowLeft className="w-5 h-5" />
                Back to Equipment
            </button>

            <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Equipment</h1>

            <EquipmentForm onSubmit={handleSubmit} initialData={initialData} />
        </div>
    );
};

export default EditEquipment;
