import React, { useState, useEffect } from 'react';

const StoreDeals = ({ storeId, dealId, pinId }) => {
  const [dealData, setDealData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStoreDeal = async () => {
      if (!storeId || !dealId || !pinId) {
        setError('Missing required props: storeId, dealId, and pinId are required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/external/store-deals/${storeId}/${dealId}/${pinId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch store deal: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setDealData(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching store deal:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreDeal();
  }, [storeId, dealId, pinId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg">Loading store deal...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-red-600 text-center">
          <h3 className="text-lg font-semibold mb-2">Error loading store deal</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!dealData) {
    return (
      <div className="text-center text-gray-500 p-8">
        No deal data found.
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-white border rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold mb-2">
            {dealData.dealTitle || 'Untitled Deal'}
          </h2>
          <p className="text-gray-600">
            {dealData.description || 'No description available'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {dealData.price && (
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Price:</span>
              <span className="text-green-600 font-semibold">{dealData.price}</span>
            </div>
          )}
          
          {dealData.discount && (
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Discount:</span>
              <span className="text-red-600 font-semibold">{dealData.discount}</span>
            </div>
          )}
          
          {dealData.category && (
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Category:</span>
              <span className="text-gray-900">{dealData.category}</span>
            </div>
          )}
          
          {dealData.store && (
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Store:</span>
              <span className="text-gray-900">{dealData.store}</span>
            </div>
          )}
          
          {dealData.validUntil && (
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Valid Until:</span>
              <span className="text-gray-900">{dealData.validUntil}</span>
            </div>
          )}
          
          {dealData.location && (
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Location:</span>
              <span className="text-gray-900">{dealData.location}</span>
            </div>
          )}
        </div>

        {/* Display any additional properties that might be in the API response */}
        {Object.keys(dealData).length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Additional Details:</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                {JSON.stringify(dealData, null, 2)}
              </pre>
            </div>
          </div>
        )}
        
        <div className="mt-4 text-sm text-gray-500">
          Store ID: {storeId} | Deal ID: {dealId} | Pin ID: {pinId}
        </div>
      </div>
    </div>
  );
};

export default StoreDeals;