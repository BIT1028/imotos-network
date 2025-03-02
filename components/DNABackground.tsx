"use client"

import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// DNA链几何体生成函数
const createDNAGeometry = (count = 100, radius = 4, height = 15, twists = 3) => {
  // 创建第一条螺旋
  const helix1Positions = []
  const helix2Positions = []
  const connectionPositions = []
  
  for (let i = 0; i < count; i++) {
    const t = i / count
    const angle = t * Math.PI * 2 * twists
    
    // 第一条螺旋的点
    const x1 = Math.cos(angle) * radius
    const y = t * height - height / 2
    const z1 = Math.sin(angle) * radius
    
    // 第二条螺旋的点 (位于相反位置)
    const x2 = Math.cos(angle + Math.PI) * radius
    const z2 = Math.sin(angle + Math.PI) * radius
    
    helix1Positions.push(new THREE.Vector3(x1, y, z1))
    helix2Positions.push(new THREE.Vector3(x2, y, z2))
    
    // 每10个点添加一个连接线
    if (i % 10 === 0) {
      connectionPositions.push(
        new THREE.Vector3(x1, y, z1),
        new THREE.Vector3(x2, y, z2)
      )
    }
  }
  
  return { helix1Positions, helix2Positions, connectionPositions }
}

// DNA组件
function DNA() {
  const groupRef = useRef<THREE.Group>(null)
  const material1 = useMemo(() => new THREE.MeshBasicMaterial({ color: '#00a0e9', transparent: true, opacity: 0.5 }), [])
  const material2 = useMemo(() => new THREE.MeshBasicMaterial({ color: '#9d00ff', transparent: true, opacity: 0.5 }), [])
  const connectionMaterial = useMemo(() => new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.2 }), [])
  
  // 创建DNA几何体
  const { helix1Positions, helix2Positions, connectionPositions } = useMemo(() => 
    createDNAGeometry(100, 4, 15, 3), []
  )
  
  // 创建连接线
  const connectionGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints(connectionPositions)
    return geometry
  }, [connectionPositions])
  
  // 动画
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.1
    }
  })
  
  return (
    <group ref={groupRef}>
      {/* 第一条螺旋 */}
      {helix1Positions.map((position, i) => (
        <mesh key={`helix1-${i}`} position={[position.x, position.y, position.z]} material={material1}>
          <sphereGeometry args={[0.2, 8, 8]} />
        </mesh>
      ))}
      
      {/* 第二条螺旋 */}
      {helix2Positions.map((position, i) => (
        <mesh key={`helix2-${i}`} position={[position.x, position.y, position.z]} material={material2}>
          <sphereGeometry args={[0.2, 8, 8]} />
        </mesh>
      ))}
      
      {/* 连接线 */}
      <lineSegments geometry={connectionGeometry} material={connectionMaterial} />
    </group>
  )
}

// 备选渲染方式：使用div而不是Canvas
const SimpleDNABackground = () => {
  return (
    <div className="fixed inset-0 -z-5 opacity-30 pointer-events-none grid grid-cols-12 gap-4">
      {Array.from({ length: 24 }).map((_, i) => (
        <div key={i} className="relative h-full flex flex-col justify-around opacity-20">
          <div className="h-2 w-2 rounded-full bg-[#00a0e9] animate-pulse" 
               style={{ animationDelay: `${i * 0.1}s` }}></div>
          <div className="h-2 w-2 rounded-full bg-[#9d00ff] animate-pulse"
               style={{ animationDelay: `${i * 0.1 + 0.5}s` }}></div>
          <div className="h-2 w-2 rounded-full bg-[#00a0e9] animate-pulse"
               style={{ animationDelay: `${i * 0.1 + 1}s` }}></div>
        </div>
      ))}
    </div>
  )
}

// DNA背景组件
export default function DNABackground() {
  // 当Three.js遇到问题时使用备选方案
  const [useSimpleVersion, setUseSimpleVersion] = React.useState(false)
  
  React.useEffect(() => {
    // 检测Three.js是否发生错误
    const handleError = () => {
      setUseSimpleVersion(true)
    }
    
    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])
  
  if (useSimpleVersion) {
    return <SimpleDNABackground />
  }
  
  try {
    return (
      <div className="fixed inset-0 -z-5 opacity-30 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 20], fov: 60 }}>
          <ambientLight intensity={0.5} />
          <DNA />
        </Canvas>
      </div>
    )
  } catch (error) {
    console.error("Three.js渲染错误", error)
    return <SimpleDNABackground />
  }
} 