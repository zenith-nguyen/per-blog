'use client';

import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import { useEffect, useState } from 'react';

export default function ApiDocPage() {
  const [spec, setSpec] = useState(null);

  useEffect(() => {
    fetch('/api/doc')
      .then((res) => res.json())
      .then((data) => setSpec(data))
      .catch((err) => console.error('Failed to load API spec:', err));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">API Documentation</h1>
        <p className="text-slate-600">
          Interactive API documentation for the Personal Tech Blog. Test endpoints directly from this page.
        </p>
      </div>
      
      {spec ? (
        <div className="bg-white border border-slate-200 rounded-sm overflow-hidden">
          <SwaggerUI spec={spec} />
        </div>
      ) : (
        <div className="bg-white border border-slate-200 p-8 text-center">
          <p className="text-slate-600">Loading API documentation...</p>
        </div>
      )}
    </div>
  );
}
