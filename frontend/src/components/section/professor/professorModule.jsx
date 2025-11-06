import React from 'react'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { COLORS } from '../../../constants';


const ProfessorModule = ({ title, onCancel, children }) => {
  return (<>
    <div className="flex items-center mb-6">
			<ArrowBackIcon onClick={onCancel} className="cursor-pointer"/>
			<h1 style={{ color: COLORS.primary[900] }} className="w-full text-2xl md:text-3xl text-center font-bold">{title}</h1>
		</div>
		{children}
	</>)
}

export default ProfessorModule