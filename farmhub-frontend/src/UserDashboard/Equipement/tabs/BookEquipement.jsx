import React, { useState, useEffect } from 'react';
import EquipmentCard from '../components/EquipmentCard';
import api from '../../../services/api';
import { Loader2 } from 'lucide-react';

const BookEquipment = () => {
    const [equipment, setEquipment] = useState([]);
    const [filteredEquipment, setFilteredEquipment] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchEquipment();
    }, []);

    const fetchEquipment = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await api.get('/equipment');
            // Show only available equipment
            const available = (data || []).filter(
                (eq) => eq.availability === 'AVAILABLE'
            );
            setEquipment(available);
            setFilteredEquipment(available);
        } catch (err) {
            setError(err.message || 'Failed to load equipment.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let filtered = equipment;

        if (searchTerm) {
            filtered = filtered.filter(
                (eq) =>
                    eq.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    eq.location?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (typeFilter !== 'All') {
            filtered = filtered.filter((eq) => eq.type === typeFilter);
        }

        setFilteredEquipment(filtered);
    }, [searchTerm, typeFilter, equipment]);

    const equipmentTypes = ['All', ...new Set(equipment.map((eq) => eq.type).filter(Boolean))];

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                <span className="ml-3 text-gray-600">Loading equipment…</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-16">
                <p className="text-red-500">{error}</p>
                <button
                    onClick={fetchEquipment}
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <input
                    type="text"
                    placeholder="Search equipment..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                    {equipmentTypes.map((type) => (
                        <option key={type} value={type}>
                            {type}
                        </option>
                    ))}
                </select>
            </div>

            {filteredEquipment.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEquipment.map((item) => (
                        <EquipmentCard key={item.id} equipment={item} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <p className="text-gray-600 text-lg">No available equipment found.</p>
                    <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filters.</p>
                </div>
            )}
        </div>
    );
};

export default BookEquipment;
