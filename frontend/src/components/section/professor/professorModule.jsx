import React from 'react'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';


const ProfessorModule = ({ title, onCancel, children }) => {
  return (<>
    <div className="flex items-center mb-6">
			<ArrowBackIcon onClick={onCancel} className="cursor-pointer"/>
			<h1 className="w-full text-2xl md:text-3xl text-center font-bold text-yellow-900">{title}</h1>
		</div>
		{children}
	</>)
}

export default ProfessorModule