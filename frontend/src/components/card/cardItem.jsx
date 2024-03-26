import React from 'react'

const CardItem = ({ className, icon, children, onClick, disabled = false }) => {

	return ( 
	<div className={className} onClick={onClick}>
		<span className={`justify-center ${disabled ? "bg-gray-200" : "bg-orange-50 hover:bg-orange-100 cursor-pointer"} text-yellow-900 shadow-lg flex items-center rounded-xl font-bold text-sm py-4 px-4`}>
			{icon}<span className="ml-3">{children}</span>
		</span>
	</div>);
}

export default CardItem