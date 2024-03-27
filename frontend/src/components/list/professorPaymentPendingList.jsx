import React from 'react'
import { capitalizeFirstCharacter, getMonthNameByMonthNumber } from '../../utils';

const ProfessorPaymentPendingList = ({ periods }) => {
  return (
    <ul className="bg-white shadow overflow-hidden sm:rounded-md mx-auto">
      {periods.map((period, index) =>
      <li key={index} className={`${index > 0 && "border-t border-gray-200"}`}>
        <div className="px-4 py-5 sm:px-6">
          <div className="flex items-center justify-between">
            <div className='flex flex-col'>
              <h3 className="text-lg leading-6 font-medium text-gray-900">{capitalizeFirstCharacter(getMonthNameByMonthNumber(period.month))} {period.year}</h3>
              <p className="text-sm font-medium text-gray-500">Curso: {period?.course?.title}</p>
            </div>
          </div>
        </div>
      </li>
      )}
    </ul>
  )
}

export default ProfessorPaymentPendingList