import React, { useState, useEffect } from 'react';
import { X, MapPin, User, Calendar, Phone, Building, MessageSquare, Star as StarIcon } from 'lucide-react';
import { FarmWithRating, Evaluation } from '../types';
import { storageUtils } from '../utils/storage';
import { StarRating } from './StarRating';

interface FarmDetailsProps {
  farm: FarmWithRating;
  onClose: () => void;
  onEvaluationUpdate: () => void;
}

export const FarmDetails: React.FC<FarmDetailsProps> = ({
  farm,
  onClose,
  onEvaluationUpdate
}) => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [showAllEvaluations, setShowAllEvaluations] = useState(false);

  useEffect(() => {
    const farmEvaluations = storageUtils.getEvaluationsForFarm(farm.id);
    // Sort by creation date (newest first)
    farmEvaluations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setEvaluations(farmEvaluations);
  }, [farm.id]);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(farm.address);
    
    // Show toast notification
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    toast.textContent = 'Address copied to clipboard!';
    document.body.appendChild(toast);
    
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 2000);
  };

  const handleCallManager = () => {
    window.open(`tel:${farm.managerPhone}`, '_self');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isUpcoming = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const collectionDate = new Date(farm.collectionDate);
    collectionDate.setHours(0, 0, 0, 0);
    return collectionDate >= today;
  };

  const getDaysUntilCollection = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const collectionDate = new Date(farm.collectionDate);
    collectionDate.setHours(0, 0, 0, 0);
    const diffTime = collectionDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const displayedEvaluations = showAllEvaluations 
    ? evaluations 
    : evaluations.slice(0, 3);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 p-4 md:items-center">
      <div className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{farm.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={farm.averageRating} size="sm" />
              {farm.evaluationCount > 0 && (
                <span className="text-sm text-gray-500">
                  ({farm.evaluationCount} review{farm.evaluationCount !== 1 ? 's' : ''})
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
          <div className="p-6 space-y-6">
            {/* Collection Status */}
            <div className={`p-4 rounded-xl ${
              isUpcoming() 
                ? 'bg-blue-50 border border-blue-200' 
                : 'bg-gray-50 border border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Collection Status</h3>
                  <p className={`text-sm ${
                    isUpcoming() ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {isUpcoming() 
                      ? getDaysUntilCollection() === 0 
                        ? 'Collection due today'
                        : `${getDaysUntilCollection()} day${getDaysUntilCollection() !== 1 ? 's' : ''} remaining`
                      : 'Collection overdue'
                    }
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  isUpcoming() 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {isUpcoming() ? 'Upcoming' : 'Overdue'}
                </div>
              </div>
            </div>

            {/* Farm Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Farm Information</h3>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Building className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Department</p>
                    <p className="text-gray-900">{farm.department}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Collection Date</p>
                    <p className="text-gray-900">{formatDate(farm.collectionDate)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Manager Contact */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Manager Contact</h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-900">{farm.managerName}</span>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-900">{farm.managerPhone}</span>
                  <button
                    onClick={handleCallManager}
                    className="ml-auto bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                  >
                    Call
                  </button>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-gray-900 leading-relaxed">{farm.address}</p>
                  </div>
                  <button
                    onClick={handleCopyAddress}
                    className="ml-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg text-sm font-medium transition-colors flex-shrink-0"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>

            {/* Evaluations */}
            {evaluations.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Recent Evaluations
                  </h3>
                  {farm.averageRating > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <StarIcon className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{farm.averageRating.toFixed(1)}</span>
                      <span>•</span>
                      <span>{farm.evaluationCount} review{farm.evaluationCount !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {displayedEvaluations.map((evaluation) => (
                    <div key={evaluation.id} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <StarRating rating={evaluation.rating} size="sm" />
                        <span className="text-sm text-gray-500">
                          {formatDateTime(evaluation.createdAt)}
                        </span>
                      </div>
                      {evaluation.comment && (
                        <div className="flex items-start gap-2">
                          <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {evaluation.comment}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}

                  {evaluations.length > 3 && !showAllEvaluations && (
                    <button
                      onClick={() => setShowAllEvaluations(true)}
                      className="w-full text-center py-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Show {evaluations.length - 3} more evaluation{evaluations.length - 3 !== 1 ? 's' : ''}
                    </button>
                  )}

                  {showAllEvaluations && evaluations.length > 3 && (
                    <button
                      onClick={() => setShowAllEvaluations(false)}
                      className="w-full text-center py-2 text-gray-600 hover:text-gray-700 text-sm font-medium"
                    >
                      Show less
                    </button>
                  )}
                </div>
              </div>
            )}

            {evaluations.length === 0 && (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <StarIcon className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-gray-900 font-medium mb-1">No evaluations yet</h3>
                <p className="text-gray-500 text-sm">Be the first to evaluate this farm</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};