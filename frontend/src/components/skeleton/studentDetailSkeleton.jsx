import React from 'react';

export default function StudentDetailSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Header con nombre del estudiante */}
      <div className="mb-8">
        <div className="h-8 bg-gray-300 rounded w-48 mb-4"></div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex space-x-8">
          <div className="h-6 bg-gray-300 rounded w-16"></div>
          <div className="h-6 bg-gray-300 rounded w-16"></div>
          <div className="h-6 bg-gray-300 rounded w-16"></div>
          <div className="h-6 bg-gray-300 rounded w-16"></div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información del perfil */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="h-6 bg-gray-300 rounded w-32 mb-4"></div>
            <div className="space-y-4">
              <div>
                <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-5 bg-gray-300 rounded w-24"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-5 bg-gray-300 rounded w-20"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-12 mb-2"></div>
                <div className="h-5 bg-gray-300 rounded w-32"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-5 bg-gray-300 rounded w-28"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-5 bg-gray-300 rounded w-24"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-28 mb-2"></div>
                <div className="h-5 bg-gray-300 rounded w-20"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido de las pestañas */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg p-6">
            {/* Skeleton para tabla o contenido */}
            <div className="space-y-4">
              <div className="h-6 bg-gray-300 rounded w-40 mb-6"></div>
              
              {/* Filas de tabla skeleton */}
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex space-x-4 py-3 border-b border-gray-100">
                  <div className="h-4 bg-gray-200 rounded flex-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
