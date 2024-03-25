import React, { useState } from 'react'

const UseModal = (initialValue = false) => {
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

export default UseModal