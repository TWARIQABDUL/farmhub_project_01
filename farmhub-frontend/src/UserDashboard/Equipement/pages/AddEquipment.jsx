import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import EquipmentForm from '../components/EquipmentForm';
import api from '../../../services/api';

const AddEquipment = () => {
    const navigate = useNavigate();

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
                availability: 'AVAILABLE',
                availableSlots: formData.availableSlots || [],
            };
            await api.post('/equipment', payload);
            alert('Equipment added successfully!');
            navigate('/dashboard/equipment/share');
        } catch (err) {
            alert(err.message || 'Failed to add equipment.');
        }
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

            <h1 className="text-3xl font-bold text-gray-900 mb-6">Add New Equipment</h1>

            <EquipmentForm onSubmit={handleSubmit} />
        </div>
    );
};

export default AddEquipment;
