import React, { useState } from 'react'
import { COLORS } from '../../constants'

const CardItem = ({ className, icon, children, onClick, disabled = false }) => {

	const [hovered, setHovered] = useState(false);
	const bg = disabled ? undefined : (hovered ? COLORS.primary[100] : COLORS.primary[50]);
	return ( 
	<div className={className} onClick={onClick}>
		<span
			style={{ backgroundColor: bg, color: COLORS.primary[900] }}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			className={`justify-center ${disabled ? "bg-gray-200" : "cursor-pointer"} shadow-lg flex items-center rounded-xl font-bold text-sm py-4 px-4`}>
			{icon}<span className="ml-3">{children}</span>
		</span>
	</div>);
}

export default CardItem