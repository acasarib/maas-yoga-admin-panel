import React from 'react'
import { Tooltip } from '@mui/material';
import { capitalizeFirstCharacter, formatPaymentValue, getMonthNameByMonthNumber } from '../../utils';
import DeleteButton from '../button/deleteButton';
import VerifyButton from '../button/verifyButton';

const ProfessorPaymentNotVerifiedList = ({ periods, onClickVerifyPayment, onClickDeletePayment }) => {

  return (<>
    <ul className="bg-white shadow overflow-hidden sm:rounded-md mx-auto">
      {periods.map((period, index) =>
      <li key={index} className={`${index > 0 && "border-t border-gray-200"}`}>
        <div className="px-4 py-5 sm:px-6">
          <div className="flex items-center justify-between">
            <div className='flex flex-col'>
              <h3 className="text-lg leading-6 font-medium text-gray-900">{formatPaymentValue(period.payment.value)}</h3>
              <p className="text-sm font-medium text-gray-500">{capitalizeFirstCharacter(getMonthNameByMonthNumber(period.month))} {period.year}</p>
              <p className="text-sm font-medium text-gray-500">Curso: {period.course.title}</p>
            </div>

            <div className="mt-1 max-w-2xl text-sm text-gray-500">
              <VerifyButton onClick={() => onClickVerifyPayment(period.payment)}/>
              <DeleteButton onClick={() => onClickDeletePayment(period.payment)}/>
            </div>
          </div>
        </div>
      </li>
      )}
    </ul>
  </>)
}

export default ProfessorPaymentNotVerifiedList