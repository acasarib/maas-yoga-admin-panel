import React from 'react'
import ProfessorModule from './professorModule'
import PaymentsTable from '../../paymentsTable'

const ProfessorPayments = ({ onCancel, professor, onClickDeletePayment, onClickVerifyPayment }) => {
  return (
    <ProfessorModule title="Pagos" onCancel={onCancel}>
      <PaymentsTable
        payments={professor.payments}
        isLoading={false}
        canVerify
        onClickDeletePayment={onClickDeletePayment}
        onClickVerifyPayment={onClickVerifyPayment}
      />
    </ProfessorModule>
  )
}

export default ProfessorPayments