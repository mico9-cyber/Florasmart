import React, { useState, useEffect } from 'react';
import { AppContext } from '../context/AppData';
import { Bell, Sprout, Clock, Leaf, Flower2, Coffee, Thermometer, Droplets, Sun, Activity, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function PlantCareReminders({ isOpen, onClose }) {
  const { t } = useTranslation();
  const { user, refreshAppData } = useContext(AppContext);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchReminders();
    }
  }, [isOpen]);

  const fetchReminders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/v1/plant-care-reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.accessToken}`
        },
        body: JSON.stringify({ userId: user.id })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch plant care reminders');
      }
      
      const data = await response.json();
      setReminders(data.data.tips || []);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || 'Failed to load plant care reminders');
      setReminders([]);
    } finally {
      setLoading(false);
    }
  };

  const getCareTypeIcon = (careType) => {
    const icons = {
      'watering': Droplets,
      'light': Sun,
      'scheduling': Clock,
      'seasonal': Activity,
      'general': Leaf
    };
    return icons[careType] || Leaf;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'HIGH': 'bg-red-900/30 border-red-500/50 text-red-300',
      'MEDIUM': 'bg-yellow-900/30 border-yellow-500/50 text-yellow-300',
      'LOW': 'bg-green-900/30 border-green-500/50 text-green-300'
    };
    return colors[priority] || 'bg-gray-900/30 border-gray-500/50 text-gray-300';
  };

  const getCareTypeLabel = (careType) => {
    const labels = {
      'watering': 'Watering',
      'light': 'Light',
      'scheduling': 'Schedule',
      'seasonal': 'Seasonal',
      'general': 'General'
    };
    return labels[careType] || careType;
  };

  const getAllPlantTips = async () => {
    if (user.id) {
      await fetchReminders();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-green-800 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-green-800/50 bg-gradient-to-r from-green-900/50 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-green-500/20 p-2 rounded-lg">
                <Sprout size={24} color="#84cc16" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">FloraSmart Plant Care Reminders</h2>
                <p className="text-sm text-green-300">
                  Personalized care tips for your plants
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <RefreshCw size={32} className="text-green-500 animate-spin mb-4" />
              <p className="text-green-300">Generating personalized plant care tips...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
              <p className="text-red-300 mb-4">{error}</p>
              <button 
                onClick={fetchReminders}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : reminders.length === agenundefined ? (
            <div className="text-center py-12">
              <Leaf size={48} className="text-green-400 mx-auto mb-4" />
              <p className="text-green-300 mb-2">No plant care tips available right now</p>
              <p className="text-sm text-gray-400">Tips are generated based on your plants and current season</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-400">
                  Last updated: {lastUpdated?.toLocaleTimeString()}
                </span>
                <button
                  onClick={fetchReminders}
                  className="text-xs text-green-400 hover:text-green-300 transition-colors"
                >
                  Refresh
                </button>
              </div>

              {reminders.map((tip, index) => {
                const IconComponent = getCareTypeIcon(tip.careType);
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${getPriorityColor(tip.priority)} transition-all hover:scale-[1.02]`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-black/30 p-2 rounded-lg">
                        <IconComponent size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-white text-sm">
                            {tip.title}
                          </h3>
                          <span className="text-xs px-2 py-1 bg-black/30 rounded-full">
                            {getCareTypeLabel(tip.careType)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 mb-2">
                          {tip.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {tip.iconEmoji} {tip.plantId ? `Plant ID: ${tip.plantId}` : 'General care'}
                          </span>
                          {tip.actionable && tip.actionLink && (
                            <button className="text-xs text-green-400 hover:text-green-300 font-medium">
                              View Details →
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-green-800/50 bg-gray-950/50">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              Tips generated using AI based on your plant portfolio and current season
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}