import React from 'react'
import './GlassButton.css'

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <button
      type="button"
      className={`glass-btn ${className}`}
      aria-label="Pause"
      {...props}
    >
      {children || (
        <span className="pause-icon">
          <span className="pause-bar"></span>
          <span className="pause-bar"></span>
        </span>
      )}
    </button>
  )
}

export default GlassButton
