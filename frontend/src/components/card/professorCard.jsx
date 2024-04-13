import React from 'react'

const ProfessorCard = ({ professor, className }) => {
  return (
    <div className={`bg-white overflow-hidden shadow rounded-lg border ${className}`}>
			<div className="px-4 py-5 sm:px-6">
				<h3 className="text-lg leading-6 font-medium text-gray-900">
					Perfil
				</h3>
				<p className="mt-1 max-w-2xl text-sm text-gray-500">
					Informacion del profesor.
				</p>
			</div>
			<div className="border-t border-gray-200 px-4 py-5 sm:p-0">
				<dl className="sm:divide-y sm:divide-gray-200">
					<div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
						<dt className="text-sm font-medium text-gray-500">
							Nombre
						</dt>
						<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
							{professor?.name}
						</dd>
					</div>
					<div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
						<dt className="text-sm font-medium text-gray-500">
							Apellido
						</dt>
						<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
							{professor?.lastName}
						</dd>
					</div>
					<div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
						<dt className="text-sm font-medium text-gray-500">
							Email
						</dt>
						<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
							{professor?.email}
						</dd>
					</div>
					<div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
						<dt className="text-sm font-medium text-gray-500">
							Numero de telefono
						</dt>
						<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
							{professor?.phoneNumber}
						</dd>
					</div>
				</dl>
			</div>
		</div>
  )
}

export default ProfessorCard