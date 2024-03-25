import React, { useState } from 'react'
import { useLocation } from 'react-router-dom';

const useQueryParam = (queryFieldName, defaultValue) => {
	const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const queryFieldValue = queryParams.get(queryFieldName);
	const state = useState(queryFieldValue !== null ? queryFieldValue : defaultValue)
  return state
}

export default useQueryParam