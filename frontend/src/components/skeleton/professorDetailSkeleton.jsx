import React from 'react';

export default function ProfessorDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="h-8 bg-gray-300 rounded w-56 mx-auto" />

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-4/12">
          <div className="bg-white shadow rounded-lg p-6 space-y-4">
            <div className="h-6 bg-gray-300 rounded w-32" />
            {[...Array(4)].map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24" />
                <div className="h-5 bg-gray-300 rounded w-32" />
              </div>
            ))}
          </div>
        </div>

        <div className="lg:flex-1 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(2)].map((_, index) => (
              <div key={index} className="bg-white shadow rounded-lg p-4 space-y-3">
                <div className="h-5 bg-gray-300 rounded w-32" />
                <div className="h-4 bg-gray-200 rounded w-20" />
                <div className="h-4 bg-gray-200 rounded w-16" />
              </div>
            ))}
          </div>

          <div className="bg-white shadow rounded-lg p-6 space-y-3">
            <div className="h-5 bg-gray-300 rounded w-40" />
            {[...Array(4)].map((_, index) => (
              <div key={index} className="h-4 bg-gray-200 rounded w-full" />
            ))}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              {[...Array(2)].map((_, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-2">
                  <div className="h-5 bg-gray-300 rounded w-24" />
                  <div className="h-4 bg-gray-200 rounded w-20" />
                  <div className="h-4 bg-gray-200 rounded w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
