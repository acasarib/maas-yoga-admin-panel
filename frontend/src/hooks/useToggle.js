import React, { useState } from 'react'

const useToggle = (initialValue = false) => {
  const [value, setValue] = useState(initialValue);
	const toggle = () => setValue(!value);
	const disable = () => setValue(false);
	const enable = () => setValue(true);
  return {
		value,
		toggle,
		disable,
		enable,
	}
}

export default useToggle