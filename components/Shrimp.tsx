'use client'

interface ShrimpProps {
  className?: string
  size?: number
}

export default function Shrimp({ className = '', size = 24 }: ShrimpProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Shrimp body - curved segmented body */}
      <path d="M5 8C5 6 7 4 10 4C13 4 15 6 15 8C15 10 13 12 10 12C7 12 5 10 5 8Z" />
      {/* Shrimp tail fan */}
      <path d="M3 6C3 4 4 2 6 2" />
      <path d="M3 10C3 12 4 14 6 14" />
      <path d="M4 8L3 8" />
      {/* Shrimp head */}
      <path d="M15 8C17 8 19 7 20 5" />
      {/* Shrimp antennae */}
      <path d="M20 5C21 5 22 4 22 3" />
      <path d="M20 5C21 5 22 6 22 7" />
      <path d="M19 4C20 3 21 2 21 1" />
      <path d="M19 6C20 7 21 8 21 9" />
      {/* Shrimp legs on body */}
      <path d="M7 7L6 6" />
      <path d="M7 9L6 10" />
      <path d="M9 7L10 6" />
      <path d="M9 9L10 10" />
      <path d="M11 7L12 6" />
      <path d="M11 9L12 10" />
      {/* Body segments */}
      <path d="M7 8H9" />
      <path d="M9 8H11" />
      <path d="M6 7H12" />
      <path d="M6 9H12" />
    </svg>
  )
}

