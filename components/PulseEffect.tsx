"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface PulseEffectProps {
  active?: boolean;
  color?: string;
  duration?: number;
  delay?: number;
  position?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

export default function PulseEffect({
  active = false,
  color = '#00a0e9', // 默认为科技蓝
  duration = 1.5,
  delay = 0,
  position = 'left',
  className = ''
}: PulseEffectProps) {
  const [isVisible, setIsVisible] = useState(active)
  
  useEffect(() => {
    if (active) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, duration * 1000)
      
      return () => clearTimeout(timer)
    }
  }, [active, duration])
  
  // 根据位置设置样式
  const getPositionStyles = () => {
    switch (position) {
      case 'top':
        return {
          top: 0,
          left: '10%',
          right: '10%',
          height: '4px',
          transformOrigin: 'center top'
        }
      case 'right':
        return {
          top: '10%',
          right: 0,
          bottom: '10%',
          width: '4px',
          transformOrigin: 'right center'
        }
      case 'bottom':
        return {
          bottom: 0,
          left: '10%',
          right: '10%',
          height: '4px',
          transformOrigin: 'center bottom'
        }
      case 'left':
      default:
        return {
          top: '10%',
          left: 0,
          bottom: '10%',
          width: '4px',
          transformOrigin: 'left center'
        }
    }
  }
  
  const positionStyles = getPositionStyles()
  
  // 根据位置设置动画
  const getAnimationVariants = () => {
    const isVertical = position === 'left' || position === 'right'
    
    return {
      initial: {
        opacity: 0,
        scaleX: isVertical ? 1 : 0,
        scaleY: isVertical ? 0 : 1
      },
      animate: {
        opacity: [0, 1, 0],
        scaleX: isVertical ? 1 : [0, 1.2, 1],
        scaleY: isVertical ? [0, 1.2, 1] : 1,
        transition: {
          duration,
          ease: "easeInOut",
          delay
        }
      },
      exit: {
        opacity: 0,
        transition: { duration: 0.3 }
      }
    }
  }
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`absolute z-50 ${className}`}
          style={{
            ...positionStyles,
            background: `linear-gradient(to ${position === 'top' || position === 'bottom' ? 'right' : 'bottom'}, 
                          ${color}, rgba(255, 255, 255, 0.8), ${color})`,
            boxShadow: `0 0 15px ${color}, 0 0 5px ${color}`
          }}
          variants={getAnimationVariants()}
          initial="initial"
          animate="animate"
          exit="exit"
        />
      )}
    </AnimatePresence>
  )
} 