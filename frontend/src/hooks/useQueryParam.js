import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom';

const useQueryParam = (queryFieldName, defaultValue) => {
	const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const queryFieldValue = queryParams.get(queryFieldName);
	const state = useState(queryFieldValue !== null ? queryFieldValue : defaultValue)
  useEffect(() => {
    const queryParams = new URLSearchParams(search);
    const queryFieldValue = queryParams.get(queryFieldName);
    const [_, setState] = state;
    setState(queryFieldValue !== null ? queryFieldValue : defaultValue)
  }, [search])
  return state
}

export default useQueryParam