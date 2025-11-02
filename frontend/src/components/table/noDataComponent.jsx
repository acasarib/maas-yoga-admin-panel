import React from 'react'

const NoDataComponent = ({ Icon, title, subtitle }) => {
  return (
  <div className="text-center py-12">
      <Icon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
          {title}
      </h3>
      <p className="text-gray-500">
          {subtitle}
      </p>
  </div>
  )
}

export default NoDataComponent;