import React from 'react'
import { useNavigate } from 'react-router-dom'
import ProfessorModule from './professorModule'
import PaymentsTable from '../../paymentsTable'
import ButtonPrimary from '../../button/primary'

const ProfessorPayments = ({ onCancel, professor, onClickDeletePayment, onClickVerifyPayment }) => {
  const navigate = useNavigate()

  const handleCalculatePayments = () => {
    navigate(`/home/professors/${professor.id}/cursos/calculo-pagos`)
  }

  return (
    <ProfessorModule title="Pagos" onCancel={onCancel}>
      <PaymentsTable
        tableFooter={<ButtonPrimary onClick={handleCalculatePayments}>Calcular pagos</ButtonPrimary>}
        payments={professor.payments}
        isLoading={false}
        canVerify
        columnsProps={[
          {
            name: "Abonado por",
            hidden: true
          },
          {
            name: "Profesor",
            hidden: true
          },
          {
            name: "Comprobante",
            hidden: true
          },
        ]}
        onClickDeletePayment={onClickDeletePayment}
        onClickVerifyPayment={onClickVerifyPayment}
      />
    </ProfessorModule>
  )
}

export default ProfessorPayments