import React from 'react';
import { Copy, MapPin, User, Calendar } from 'lucide-react';
import { FarmWithRating } from '../types';
import { StarRating } from './StarRating';

interface FarmCardProps {
  farm: FarmWithRating;
  onClick: () => void;
}

export const FarmCard: React.FC<FarmCardProps> = ({ farm, onClick }) => {
  const handleCopyAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(farm.address);
    
    // Show a temporary toast notification
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    toast.textContent = 'Address copied to clipboard!';
    document.body.appendChild(toast);
    
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900 truncate pr-2">
          {farm.name}
        </h3>
        <StarRating rating={farm.averageRating} size="sm" />
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center text-gray-600">
          <User className="w-4 h-4 mr-3 flex-shrink-0" />
          <span className="text-sm truncate">{farm.managerName}</span>
        </div>
        
        <div className="flex items-center text-gray-600">
          <Calendar className="w-4 h-4 mr-3 flex-shrink-0" />
          <span className="text-sm">{formatDate(farm.collectionDate)}</span>
        </div>
        
        <div className="flex items-start text-gray-600">
          <MapPin className="w-4 h-4 mr-3 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <span className="text-sm line-clamp-2">{farm.address}</span>
          </div>
          <button
            onClick={handleCopyAddress}
            className="ml-2 p-1 hover:bg-gray-100 rounded-md transition-colors"
            title="Copy address"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {farm.evaluationCount > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-500">
            {farm.evaluationCount} evaluation{farm.evaluationCount !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
};