import React from 'react'
import { cn } from '../../lib/utils'

export function Button({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  children, 
  ...props 
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none hover:scale-[1.01] active:scale-[0.98]",
        {
          'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
          'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm': variant === 'secondary',
          'bg-teal-500 text-white hover:bg-teal-600': variant === 'teal',
          'bg-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100/50': variant === 'ghost',
          'bg-transparent text-zinc-700 hover:bg-zinc-50 border border-zinc-200 shadow-sm': variant === 'outline',
          
          'h-8 px-3 text-xs': size === 'sm',
          'h-10 px-4 py-2': size === 'md',
          'h-11 px-8': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
