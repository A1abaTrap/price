import React, { useState, useEffect, useMemo } from 'react';
import { TabNavigation } from './components/TabNavigation';
import { SearchBar } from './components/SearchBar';
import { FarmCard } from './components/FarmCard';
import { FarmForm } from './components/FarmForm';
import { EvaluationForm } from './components/EvaluationForm';
import { FarmDetails } from './components/FarmDetails';
import { FarmWithRating } from './types';
import { storageUtils } from './utils/storage';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [farms, setFarms] = useState<FarmWithRating[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<FarmWithRating | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load farms with ratings
  useEffect(() => {
    const loadFarms = () => {
      const allFarms = storageUtils.getFarms();
      const farmsWithRatings: FarmWithRating[] = allFarms.map(farm => {
        const { average, count } = storageUtils.getFarmAverageRating(farm.id);
        return {
          ...farm,
          averageRating: average,
          evaluationCount: count
        };
      });
      
      // Sort by collection date (nearest first)
      farmsWithRatings.sort((a, b) => 
        new Date(a.collectionDate).getTime() - new Date(b.collectionDate).getTime()
      );
      
      setFarms(farmsWithRatings);
    };

    loadFarms();
  }, [refreshTrigger]);

  // Handle data refresh after form submissions
  const handleDataRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Filter farms based on search query
  const filteredFarms = useMemo(() => {
    if (!searchQuery.trim()) return farms;
    
    const query = searchQuery.toLowerCase();
    return farms.filter(farm =>
      farm.name.toLowerCase().includes(query) ||
      farm.managerName.toLowerCase().includes(query) ||
      farm.department.toLowerCase().includes(query) ||
      farm.address.toLowerCase().includes(query)
    );
  }, [farms, searchQuery]);

  // Get upcoming farms (collection date is today or in the future)
  const upcomingFarms = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return filteredFarms.filter(farm => {
      const collectionDate = new Date(farm.collectionDate);
      collectionDate.setHours(0, 0, 0, 0);
      return collectionDate >= today;
    });
  }, [filteredFarms]);

  const handleFarmSelect = (farm: FarmWithRating) => {
    setSelectedFarm(farm);
  };

  const handleCloseFarmDetails = () => {
    setSelectedFarm(null);
  };

  const renderHomeTab = () => (
    <div className="p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Farm Collections
          </h1>
          <p className="text-gray-600">
            {upcomingFarms.length} upcoming collection{upcomingFarms.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="mb-6">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search farms, managers, or locations..."
          />
        </div>

        {upcomingFarms.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No farms found' : 'No upcoming collections'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery 
                ? 'Try adjusting your search terms'
                : 'Add your first farm to get started'
              }
            </p>
            {!searchQuery && (
              <button
                onClick={() => setActiveTab('add-farm')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add First Farm
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingFarms.map((farm) => (
              <FarmCard
                key={farm.id}
                farm={farm}
                onClick={() => handleFarmSelect(farm)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderAddFarmTab = () => (
    <div className="pb-20">
      <div className="max-w-2xl mx-auto">
        <FarmForm onSave={handleDataRefresh} />
      </div>
    </div>
  );

  const renderEvaluateTab = () => (
    <div className="pb-20">
      <div className="max-w-2xl mx-auto">
        <EvaluationForm onSave={handleDataRefresh} />
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return renderHomeTab();
      case 'add-farm':
        return renderAddFarmTab();
      case 'evaluate':
        return renderEvaluateTab();
      default:
        return renderHomeTab();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                Farm Manager
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {renderTabContent()}
      </main>

      {/* Farm Details Modal */}
      {selectedFarm && (
        <FarmDetails
          farm={selectedFarm}
          onClose={handleCloseFarmDetails}
          onEvaluationUpdate={handleDataRefresh}
        />
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200">
        <TabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
    </div>
  );
}

export default App;