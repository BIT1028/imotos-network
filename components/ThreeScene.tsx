"use client"

import { useRef, Suspense, useEffect, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"

function ElectricalSphere() {
  const meshRef = useRef<any>(null)
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2
      meshRef.current.rotation.y += delta * 0.3
    }
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color="#4a9eff" emissive="#4a9eff" emissiveIntensity={0.5} wireframe />
    </mesh>
  )
}

export default function ThreeScene() {
  // 使用客户端专用的状态来确保组件仅在客户端渲染
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  // 如果没有挂载（服务器渲染阶段），渲染一个占位符
  if (!isMounted) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-blue-400">Loading 3D Scene...</div>
      </div>
    )
  }
  
  // 如果已挂载（客户端），渲染 Canvas
  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Suspense fallback={null}>
        <ElectricalSphere />
      </Suspense>
    </Canvas>
  )
} 