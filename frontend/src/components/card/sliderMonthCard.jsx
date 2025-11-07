import React, { useEffect, useState } from 'react'
import { capitalizeFirstCharacter, formatPaymentValue, getMonthNameByMonthNumber } from '../../utils';
import SimpleCard from './simpleCard';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';

const SliderMonthCard = ({ payments, operativeResult = false, title, all = false }) => {
	const [currentIndex, setCurrentIndex] = useState(null)
	const [indexPayments, setIndexPayments] = useState([])
	const removeDays = date => date.slice(0, -3);
	const total = payments.reduce((total, payment) => total + payment.value, 0);
	
	useEffect(() => {
		const indexPayments = []
		payments.forEach(p => {
			let date;
			if (operativeResult) {
				const operativeResult = new Date(p.operativeResult)
				const year = operativeResult.getFullYear()
				const month = operativeResult.getMonth()+1
				date = `${year}-${month}`
			} else {
				if (p.periodFrom) {
					date = removeDays(p.periodFrom)
				} else if (p.at) {
					date = removeDays(p.at)
				} else {
					return;
				}
			}
			const indexPayment = indexPayments.find(indexPayment => indexPayment.date === date)
			if (!indexPayment) {
				indexPayments.push({ date, value: p.value })
			} else {
				indexPayment.value += p.value
			}
		})
		indexPayments.sort((a,b) => {
			var dateA = new Date(a.date + "-01");
			var dateB = new Date(b.date + "-01");
			if (dateA < dateB) {
				return -1;
			}
			if (dateA > dateB) {
				return 1;
			}
			return 0;
		});
		setIndexPayments(indexPayments)
		setCurrentIndex(indexPayments.length > 0 ? indexPayments.length -1 : null)
	}, [payments])
	
	const onClickPreviousArrow = () => setCurrentIndex(currentIndex-1)

	const onClickNextArrow = () => setCurrentIndex(currentIndex+1)

	const formatDate = (date) => {
		if (date == undefined) return 'Fecha invalida'
		const split = date.split("-")
		const month = capitalizeFirstCharacter( getMonthNameByMonthNumber(split[1]) )
		const year = split[0]
		return month + " " + year
	}

	return <SimpleCard className={"w-full h-full"}>
		{currentIndex !== null ? 
		<div>
			<h3 className='text-lg leading-6 text-gray-900 font-bold mb-1'>{formatPaymentValue(all ? total : indexPayments[currentIndex].value)}</h3>
			<p className="text-sm font-medium text-gray-500">{title}</p>
			<div className="text-sm font-medium text-gray-500 flex">
				{!all &&
				<>
					<div className={`cursor-pointer ${currentIndex === 0 ? "invisible" : ""}`}>
						<ArrowLeftIcon onClick={onClickPreviousArrow}/>
					</div>
					{formatDate(indexPayments[currentIndex].date)}
					<div className={`cursor-pointer ${currentIndex === indexPayments.length-1 ? "invisible" : ""}`}>
						<ArrowRightIcon className="cursor-pointer" onClick={onClickNextArrow}/>
					</div>
				</>}
			</div>
		</div>
		: 
		<div>
			<h3 className='text-lg leading-6 font-medium text-gray-900'>$0</h3>
			<p className="text-sm font-medium text-gray-500">{title}</p>
		</div>}
	

	</SimpleCard>
}

export default SliderMonthCard