import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { Farm } from '../types';
import { storageUtils } from '../utils/storage';

interface FarmFormProps {
  onSave: () => void;
}

export const FarmForm: React.FC<FarmFormProps> = ({ onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    managerName: '',
    managerPhone: '',
    address: '',
    collectionDate: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Farm name is required';
    if (!formData.department.trim()) newErrors.department = 'Department is required';
    if (!formData.managerName.trim()) newErrors.managerName = 'Manager name is required';
    if (!formData.managerPhone.trim()) newErrors.managerPhone = 'Phone number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.collectionDate) newErrors.collectionDate = 'Collection date is required';

    // Validate phone number format
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (formData.managerPhone.trim() && !phoneRegex.test(formData.managerPhone.replace(/\s+/g, ''))) {
      newErrors.managerPhone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    const farm: Farm = {
      id: crypto.randomUUID(),
      name: formData.name.trim(),
      department: formData.department.trim(),
      managerName: formData.managerName.trim(),
      managerPhone: formData.managerPhone.trim(),
      address: formData.address.trim(),
      collectionDate: formData.collectionDate,
      createdAt: new Date().toISOString()
    };

    try {
      storageUtils.saveFarm(farm);
      
      // Reset form
      setFormData({
        name: '',
        department: '',
        managerName: '',
        managerPhone: '',
        address: '',
        collectionDate: ''
      });

      // Show success message
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      toast.textContent = 'Farm saved successfully!';
      document.body.appendChild(toast);
      
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 3000);

      onSave();
    } catch (error) {
      console.error('Error saving farm:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Farm</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Farm Name *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 ${
              errors.name ? 'border-red-500' : 'border-gray-200'
            }`}
            placeholder="Enter farm name"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
            Department / Affiliation *
          </label>
          <input
            type="text"
            id="department"
            value={formData.department}
            onChange={(e) => handleInputChange('department', e.target.value)}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 ${
              errors.department ? 'border-red-500' : 'border-gray-200'
            }`}
            placeholder="Enter department or affiliation"
          />
          {errors.department && <p className="mt-1 text-sm text-red-600">{errors.department}</p>}
        </div>

        <div>
          <label htmlFor="managerName" className="block text-sm font-medium text-gray-700 mb-2">
            Manager Name *
          </label>
          <input
            type="text"
            id="managerName"
            value={formData.managerName}
            onChange={(e) => handleInputChange('managerName', e.target.value)}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 ${
              errors.managerName ? 'border-red-500' : 'border-gray-200'
            }`}
            placeholder="Enter manager name"
          />
          {errors.managerName && <p className="mt-1 text-sm text-red-600">{errors.managerName}</p>}
        </div>

        <div>
          <label htmlFor="managerPhone" className="block text-sm font-medium text-gray-700 mb-2">
            Manager Phone Number *
          </label>
          <input
            type="tel"
            id="managerPhone"
            value={formData.managerPhone}
            onChange={(e) => handleInputChange('managerPhone', e.target.value)}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 ${
              errors.managerPhone ? 'border-red-500' : 'border-gray-200'
            }`}
            placeholder="Enter manager phone number"
          />
          {errors.managerPhone && <p className="mt-1 text-sm text-red-600">{errors.managerPhone}</p>}
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
            Google Maps Address *
          </label>
          <textarea
            id="address"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            rows={3}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 resize-none ${
              errors.address ? 'border-red-500' : 'border-gray-200'
            }`}
            placeholder="Enter farm address"
          />
          {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
        </div>

        <div>
          <label htmlFor="collectionDate" className="block text-sm font-medium text-gray-700 mb-2">
            Collection Date *
          </label>
          <input
            type="date"
            id="collectionDate"
            value={formData.collectionDate}
            onChange={(e) => handleInputChange('collectionDate', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 ${
              errors.collectionDate ? 'border-red-500' : 'border-gray-200'
            }`}
          />
          {errors.collectionDate && <p className="mt-1 text-sm text-red-600">{errors.collectionDate}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          {isSubmitting ? 'Saving...' : 'Save Farm'}
        </button>
      </form>
    </div>
  );
};