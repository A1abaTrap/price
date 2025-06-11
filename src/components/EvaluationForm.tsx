import React, { useState, useEffect } from 'react';
import { Save, ChevronDown } from 'lucide-react';
import { Farm, Evaluation } from '../types';
import { storageUtils } from '../utils/storage';
import { StarRating } from './StarRating';

interface EvaluationFormProps {
  onSave: () => void;
}

export const EvaluationForm: React.FC<EvaluationFormProps> = ({ onSave }) => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const loadedFarms = storageUtils.getFarms();
    setFarms(loadedFarms);
  }, []);

  const selectedFarm = farms.find(farm => farm.id === selectedFarmId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFarmId || rating === 0) {
      return;
    }

    setIsSubmitting(true);

    const evaluation: Evaluation = {
      id: crypto.randomUUID(),
      farmId: selectedFarmId,
      rating,
      comment: comment.trim(),
      createdAt: new Date().toISOString()
    };

    try {
      storageUtils.saveEvaluation(evaluation);
      
      // Reset form
      setSelectedFarmId('');
      setRating(0);
      setComment('');
      setShowDropdown(false);

      // Show success message
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      toast.textContent = 'Evaluation saved successfully!';
      document.body.appendChild(toast);
      
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 3000);

      onSave();
    } catch (error) {
      console.error('Error saving evaluation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredFarms = farms.filter(farm =>
    farm.name.toLowerCase().includes('')
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Farm Evaluation</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Farm *
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-left focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 flex items-center justify-between"
            >
              <span className={selectedFarm ? 'text-gray-900' : 'text-gray-500'}>
                {selectedFarm ? selectedFarm.name : 'Choose a farm to evaluate'}
              </span>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                {filteredFarms.length === 0 ? (
                  <div className="px-4 py-3 text-gray-500 text-center">
                    No farms available. Add a farm first.
                  </div>
                ) : (
                  filteredFarms.map((farm) => (
                    <button
                      key={farm.id}
                      type="button"
                      onClick={() => {
                        setSelectedFarmId(farm.id);
                        setShowDropdown(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors duration-200 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">{farm.name}</div>
                      <div className="text-sm text-gray-500">{farm.managerName}</div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {selectedFarm && (
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-medium text-gray-900 mb-2">{selectedFarm.name}</h3>
            <p className="text-sm text-gray-600">Manager: {selectedFarm.managerName}</p>
            <p className="text-xs text-gray-500 mt-1">{selectedFarm.address}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Rating *
          </label>
          <div className="flex items-center gap-4">
            <StarRating
              rating={rating}
              onRatingChange={setRating}
              interactive={true}
              size="lg"
            />
            {rating > 0 && (
              <span className="text-sm text-gray-600">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </span>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            Evaluation Comment
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 resize-none"
            placeholder="Share your thoughts about this farm..."
          />
        </div>

        <button
          type="submit"
          disabled={!selectedFarmId || rating === 0 || isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          {isSubmitting ? 'Saving...' : 'Save Evaluation'}
        </button>
      </form>
    </div>
  );
};