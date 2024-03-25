import React from 'react'
import { Link as ReactLink } from 'react-router-dom'

const Link = ({ children, ...rest }) => {
  return (
    <ReactLink {...rest} className='font-medium text-blue-600 dark:text-blue-500 hover:underline'>{children}</ReactLink>
  )
}

export default Link