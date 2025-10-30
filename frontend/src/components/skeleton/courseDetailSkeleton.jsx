import React from 'react';

export default function CourseDetailSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Header con nombre del curso */}
      <div className="mb-8">
        <div className="h-8 bg-gray-300 rounded w-56 mb-4"></div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex space-x-8">
          <div className="h-6 bg-gray-300 rounded w-20"></div>
          <div className="h-6 bg-gray-300 rounded w-16"></div>
          <div className="h-6 bg-gray-300 rounded w-18"></div>
          <div className="h-6 bg-gray-300 rounded w-16"></div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Información del curso */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="h-6 bg-gray-300 rounded w-32 mb-4"></div>
            <div className="space-y-4">
              <div>
                <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-5 bg-gray-300 rounded w-28"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-12 mb-2"></div>
                <div className="h-5 bg-gray-300 rounded w-24"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-18 mb-2"></div>
                <div className="h-5 bg-gray-300 rounded w-20"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-5 bg-gray-300 rounded w-32"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-5 bg-gray-300 rounded w-16"></div>
              </div>
            </div>

            {/* Calendario skeleton */}
            <div className="mt-8">
              <div className="h-6 bg-gray-300 rounded w-24 mb-4"></div>
              <div className="grid grid-cols-7 gap-1">
                {[...Array(35)].map((_, index) => (
                  <div key={index} className="h-8 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Contenido de las pestañas */}
        <div className="lg:col-span-3">
          <div className="bg-white shadow rounded-lg p-6">
            {/* Skeleton para contenido principal */}
            <div className="space-y-6">
              <div className="h-6 bg-gray-300 rounded w-48 mb-6"></div>
              
              {/* Cards skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="h-5 bg-gray-300 rounded w-32 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tabla skeleton */}
              <div className="mt-8">
                <div className="h-6 bg-gray-300 rounded w-40 mb-4"></div>
                <div className="space-y-3">
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="flex space-x-4 py-3 border-b border-gray-100">
                      <div className="h-4 bg-gray-200 rounded flex-1"></div>
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
