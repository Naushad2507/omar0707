import React, { useState, useEffect } from 'react';

const DealList = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/external/deals');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch deals: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setDeals(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching deals:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg">Loading deals...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-red-600 text-center">
          <h3 className="text-lg font-semibold mb-2">Error loading deals</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">All Deals</h2>
      
      {deals.length === 0 ? (
        <div className="text-center text-gray-500 p-8">
          No deals available at the moment.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {deals.map((deal, index) => (
            <div key={deal.id || index} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold mb-2">
                {deal.dealTitle || 'Untitled'}
              </h3>
              <p className="text-gray-600">
                {deal.description || 'No description'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DealList;