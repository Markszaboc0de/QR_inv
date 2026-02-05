import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AddItem = ({ inventory, onAdd }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        stockThreshold: 1,
        cabinetIndex: 1,
        drawerIndex: 1,
        qty: 0
    });
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'name' || name === 'id' ? value : Number(value)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null);

        if (!formData.id || !formData.name) {
            setError("ID és Név megadása kötelező!");
            return;
        }

        // Construct the item object
        const newItem = {
            id: formData.id,
            name: formData.name,
            stockThreshold: formData.stockThreshold,
            locations: [
                {
                    cabinetIndex: formData.cabinetIndex,
                    drawerIndex: formData.drawerIndex,
                    qty: formData.qty
                }
            ],
            // Add a temporary timestamp or let the backend handle it?
            // Backend handles "Last Updated" column on "update/write", logic is same.
        };

        try {
            onAdd(newItem);
            // Navigate to Dashboard or clear form? User might want to add multiple.
            // Let's clear form and show success, or navigate to the new item.
            // User said "I want to be able to edit every aspect... before adding it".
            // Navigating to the result view of the new item seems appropriate validation.
            navigate(`/${newItem.id}`);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-6 bg-white rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Új Alkatrész</h1>
                <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="text-sm text-blue-600 hover:text-blue-800"
                >
                    Dashboard &rarr;
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm border border-red-200">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID (Egyedi Azonosító)</label>
                    <input
                        type="text"
                        name="id"
                        value={formData.id}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="pl. R-202"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Megnevezés</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="pl. Csapágy"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hűtő Szám</label>
                        <input
                            type="number"
                            name="cabinetIndex"
                            value={formData.cabinetIndex}
                            onChange={handleChange}
                            min="1"
                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fiók Szám</label>
                        <input
                            type="number"
                            name="drawerIndex"
                            value={formData.drawerIndex}
                            onChange={handleChange}
                            min="1"
                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kezdő Mennyiség</label>
                        <input
                            type="number"
                            name="qty"
                            value={formData.qty}
                            onChange={handleChange}
                            min="0"
                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Min. Készlet</label>
                        <input
                            type="number"
                            name="stockThreshold"
                            value={formData.stockThreshold}
                            onChange={handleChange}
                            min="0"
                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors mt-6 shadow-sm"
                >
                    Hozzáadás
                </button>
            </form>
        </div>
    );
};

export default AddItem;
