'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

interface TechGlobeProps {
  className?: string
}

export default function TechGlobe({ className = '' }: TechGlobeProps) {
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 0.3) % 360)
    }, 50)

    return () => clearInterval(interval)
  }, [])

  // Generate many network nodes for dense mesh
  const generateNodes = () => {
    const nodes = []
    for (let lat = -80; lat <= 80; lat += 20) {
      for (let lon = -180; lon <= 180; lon += 20) {
        nodes.push({ lat, lon })
      }
    }
    // Add some random nodes for density
    for (let i = 0; i < 30; i++) {
      nodes.push({
        lat: -70 + Math.random() * 140,
        lon: -180 + Math.random() * 360,
      })
    }
    return nodes
  }

  const networkNodes = generateNodes()

  // Convert lat/lon to 3D sphere coordinates, then project to 2D
  const toSphere = (lat: number, lon: number, radius: number) => {
    const adjustedLon = (lon + rotation) % 360
    const phi = ((90 - lat) * Math.PI) / 180
    const theta = (adjustedLon * Math.PI) / 180

    // 3D sphere coordinates
    const x3d = radius * Math.sin(phi) * Math.cos(theta)
    const y3d = radius * Math.cos(phi)
    const z3d = radius * Math.sin(phi) * Math.sin(theta)

    // Project to 2D (orthographic projection)
    const scale = 1
    const x = x3d * scale
    const y = y3d * scale

    // Calculate depth for visibility
    const depth = z3d
    const visible = depth > -radius * 0.5 // Show front hemisphere

    return { x, y, z: z3d, visible }
  }

  const radius = 140
  const centerX = 200
  const centerY = 200

  return (
    <div className={`relative ${className}`}>
      <svg
        width="400"
        height="400"
        viewBox="0 0 400 400"
        className="w-full h-full"
        style={{
          transform: 'perspective(1000px) rotateX(15deg)',
          transformStyle: 'preserve-3d',
        }}
      >
        <defs>
          {/* Blue/Cyan gradients */}
          <linearGradient id="cyanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.8)" />
            <stop offset="50%" stopColor="rgba(34, 211, 238, 0.9)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0.8)" />
          </linearGradient>
          <radialGradient id="nodeGlowBlue">
            <stop offset="0%" stopColor="rgba(34, 211, 238, 1)" />
            <stop offset="50%" stopColor="rgba(59, 130, 246, 0.6)" />
            <stop offset="100%" stopColor="rgba(34, 211, 238, 0.2)" />
          </radialGradient>
          <radialGradient id="nodeGlowCyan">
            <stop offset="0%" stopColor="rgba(34, 211, 238, 1)" />
            <stop offset="100%" stopColor="rgba(34, 211, 238, 0.1)" />
          </radialGradient>
          <filter id="blueGlow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="strongGlow">
            <feGaussianBlur stdDeviation="6" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Wireframe sphere - Latitude circles (concentric ellipses) */}
        {[-75, -60, -45, -30, -15, 0, 15, 30, 45, 60, 75].map((lat, i) => {
          const phi = ((90 - lat) * Math.PI) / 180
          const circleRadius = radius * Math.sin(phi)
          const y = centerY - radius * Math.cos(phi)

          if (circleRadius > 5) {
            return (
              <ellipse
                key={`lat-circle-${i}`}
                cx={centerX}
                cy={y}
                rx={circleRadius}
                ry={circleRadius * 0.3}
                fill="none"
                stroke="url(#cyanGradient)"
                strokeWidth="1.5"
                opacity={0.4 + (Math.abs(lat) / 90) * 0.3}
                style={{ filter: 'url(#blueGlow)' }}
              />
            )
          }
          return null
        })}

        {/* Wireframe sphere - Longitude lines (meridians) */}
        {Array.from({ length: 24 }, (_, i) => {
          const lon = (i * 15 + rotation) % 360
          const theta = (lon * Math.PI) / 180

          // Draw full meridian as ellipse arc
          const points = []
          for (let lat = -90; lat <= 90; lat += 5) {
            const phi = ((90 - lat) * Math.PI) / 180
            const x = centerX + radius * Math.sin(phi) * Math.cos(theta)
            const y = centerY - radius * Math.cos(phi)
            points.push({ x, y })
          }

          // Draw as path
          const pathData = points
            .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
            .join(' ')

          return (
            <path
              key={`meridian-${i}`}
              d={pathData}
              fill="none"
              stroke="url(#cyanGradient)"
              strokeWidth="1.5"
              opacity={0.3 + Math.abs(Math.cos(theta)) * 0.4}
              style={{ filter: 'url(#blueGlow)' }}
            />
          )
        })}

        {/* Dense network connections - connect nearby nodes */}
        {networkNodes.map((node1, i) => {
          const coord1 = toSphere(node1.lat, node1.lon, radius)
          if (!coord1.visible) return null

          return networkNodes.slice(i + 1).map((node2, j) => {
            const coord2 = toSphere(node2.lat, node2.lon, radius)
            if (!coord2.visible) return null

            // Calculate distance
            const dx = coord1.x - coord2.x
            const dy = coord1.y - coord2.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            // Only connect nearby nodes (within certain distance)
            if (distance < radius * 0.4 && distance > 10) {
              const x1 = centerX + coord1.x
              const y1 = centerY + coord1.y
              const x2 = centerX + coord2.x
              const y2 = centerY + coord2.y

              // Vary opacity based on depth
              const avgDepth = (coord1.z + coord2.z) / 2
              const opacity = 0.2 + ((radius + avgDepth) / (radius * 2)) * 0.3

              return (
                <line
                  key={`connection-${i}-${i + 1 + j}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="rgba(34, 211, 238, 0.6)"
                  strokeWidth="1"
                  opacity={opacity}
                  style={{ filter: 'url(#blueGlow)' }}
                />
              )
            }
            return null
          })
        })}

        {/* Glowing nodes scattered across sphere */}
        {networkNodes.map((node, i) => {
          const coord = toSphere(node.lat, node.lon, radius)

          if (coord.visible) {
            const x = centerX + coord.x
            const y = centerY + coord.y

            // Vary node size and intensity
            const nodeSize = 2 + (Math.random() * 3)
            const intensity = 0.6 + (Math.random() * 0.4)
            const depthFactor = (radius + coord.z) / (radius * 2)

            return (
              <g key={`node-${i}`}>
                {/* Pulsing glow effect */}
                <circle
                  cx={x}
                  cy={y}
                  r={nodeSize * 3}
                  fill="none"
                  stroke="rgba(34, 211, 238, 0.4)"
                  strokeWidth="1"
                  opacity="0"
                >
                  <animate
                    attributeName="r"
                    values={`${nodeSize * 2};${nodeSize * 4};${nodeSize * 2}`}
                    dur="3s"
                    begin={`${(i * 0.1) % 3}s`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.6;0.2;0"
                    dur="3s"
                    begin={`${(i * 0.1) % 3}s`}
                    repeatCount="indefinite"
                  />
                </circle>
                {/* Outer glow */}
                <circle
                  cx={x}
                  cy={y}
                  r={nodeSize * 2}
                  fill="url(#nodeGlowBlue)"
                  opacity={intensity * depthFactor}
                  style={{ filter: 'url(#strongGlow)' }}
                />
                {/* Inner bright core */}
                <circle
                  cx={x}
                  cy={y}
                  r={nodeSize}
                  fill="rgba(34, 211, 238, 1)"
                  opacity={0.9 * depthFactor}
                />
              </g>
            )
          }
          return null
        })}

        {/* Additional wireframe mesh lines for density */}
        {Array.from({ length: 15 }, (_, i) => {
          const angle = (i * 24 + rotation * 0.5) % 360
          const theta = (angle * Math.PI) / 180

          const points = []
          for (let phi = 0; phi <= Math.PI; phi += 0.1) {
            const x = centerX + radius * Math.sin(phi) * Math.cos(theta + phi * 0.5)
            const y = centerY - radius * Math.cos(phi)
            points.push({ x, y })
          }

          const pathData = points
            .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
            .join(' ')

          return (
            <path
              key={`mesh-${i}`}
              d={pathData}
              fill="none"
              stroke="rgba(59, 130, 246, 0.3)"
              strokeWidth="0.5"
              opacity={0.4}
            />
          )
        })}
      </svg>

      {/* Floating blue particles around globe */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute rounded-full"
          style={{
            width: '3px',
            height: '3px',
            left: `${10 + (i * 11)}%`,
            top: `${15 + (i % 3) * 25}%`,
            background: 'radial-gradient(circle, rgba(34, 211, 238, 1), rgba(59, 130, 246, 0.3))',
            boxShadow: '0 0 10px rgba(34, 211, 238, 0.8)',
          }}
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [1, 2, 1],
            y: [0, -25, 0],
          }}
          transition={{
            duration: 5 + (i % 3),
            repeat: Infinity,
            delay: i * 0.6,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}
