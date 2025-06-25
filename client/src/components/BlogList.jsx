import React, { useState, useEffect } from 'react';

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/external/blogs');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch blogs: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setBlogs(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching blogs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg">Loading blogs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-red-600 text-center">
          <h3 className="text-lg font-semibold mb-2">Error loading blogs</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">All Blogs</h2>
      
      {blogs.length === 0 ? (
        <div className="text-center text-gray-500 p-8">
          No blogs available at the moment.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog, index) => (
            <div key={blog.id || index} className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold mb-3">
                {blog.title || 'Untitled'}
              </h3>
              
              {blog.description && (
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {blog.description}
                </p>
              )}
              
              <div className="space-y-2 text-sm text-gray-500">
                {blog.author && (
                  <div className="flex items-center">
                    <span className="font-medium">Author:</span>
                    <span className="ml-2">{blog.author}</span>
                  </div>
                )}
                
                {(blog.date || blog.createdOn) && (
                  <div className="flex items-center">
                    <span className="font-medium">Date:</span>
                    <span className="ml-2">
                      {new Date(blog.date || blog.createdOn).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogList;