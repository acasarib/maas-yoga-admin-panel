import React, { useState } from 'react'

const useModal = (initialValue = false) => {
  const [isOpen, setIsOpen] = useState(initialValue);
	const toggle = () => setIsOpen(!isOpen);
	const open = () => setIsOpen(true);
	const close = () => setIsOpen(false);
  return {
		isOpen,
		toggle,
		open,
		close,
	}
}

export default useModal