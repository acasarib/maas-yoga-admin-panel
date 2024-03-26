import React from 'react'
import ProfessorModule from './professorModule'

const ProfessorPayments = ({ onCancel }) => {
  return (
    <ProfessorModule title="Pagos" onCancel={onCancel}></ProfessorModule>
  )
}

export default ProfessorPayments