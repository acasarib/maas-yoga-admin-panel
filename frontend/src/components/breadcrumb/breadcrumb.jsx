import React from 'react'
import Link from '../link/link'

const Breadcrumb = ({ className, items }) => {
  return (
    <nav className={`flex ${className}`} aria-label="Breadcrumb">
			<ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
				{items.map((item, index) => 
					<li key={index} className="inline-flex items-center">
						{index !== 0 &&
							<svg className="rtl:rotate-180 w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
								<path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
							</svg>
						}
						{index === (items.length -1) ?
						<span className='text-gray-400'>{item.name}</span>
						:
						<Link to={item.href}>{item.name}</Link>
						}
					</li>
				)}
			</ol>
    </nav>

  )
}

export default Breadcrumb