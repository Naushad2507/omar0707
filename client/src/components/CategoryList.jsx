import React, { useState, useEffect } from 'react';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('https://api.instoredealz.com/S0G1IP/Category/AllCategories');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg">Loading categories...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-red-600 text-center">
          <h3 className="text-lg font-semibold mb-2">Error loading categories</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">All Categories</h2>
      
      {categories.length === 0 ? (
        <div className="text-center text-gray-500 p-8">
          No categories available at the moment.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => (
            <div key={category.id || index} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold mb-2">
                {category.categoryTitle || 'Untitled'}
              </h3>
              {category.categoryDescription && (
                <p className="text-gray-600">
                  {category.categoryDescription}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryList;