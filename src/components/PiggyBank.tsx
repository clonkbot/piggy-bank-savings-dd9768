import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface PiggyBankProps {
  fillLevel: number
}

export function PiggyBank({ fillLevel }: PiggyBankProps) {
  const groupRef = useRef<THREE.Group>(null!)

  // Create glass material
  const glassMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#FFE4E1'),
    metalness: 0,
    roughness: 0,
    transmission: 0.95,
    thickness: 0.5,
    envMapIntensity: 1,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    ior: 1.5,
    transparent: true,
    opacity: 0.9,
  }), [])

  // Nose material (solid pink)
  const noseMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color('#F4A0A0'),
    metalness: 0.2,
    roughness: 0.3,
  }), [])

  // Eye material
  const eyeMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color('#4A3C3C'),
    metalness: 0.1,
    roughness: 0.5,
  }), [])

  // Ear material (slightly translucent pink)
  const earMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#F8B4B4'),
    metalness: 0,
    roughness: 0.2,
    transmission: 0.6,
    thickness: 0.2,
    transparent: true,
    opacity: 0.85,
  }), [])

  // Coin slot material
  const slotMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color('#2D2D2D'),
    metalness: 0.8,
    roughness: 0.2,
  }), [])

  useFrame((state) => {
    if (groupRef.current) {
      // Subtle breathing animation
      const breathe = Math.sin(state.clock.elapsedTime * 0.5) * 0.02
      groupRef.current.scale.setScalar(1 + breathe)
    }
  })

  return (
    <group ref={groupRef}>
      {/* Main body - stretched sphere */}
      <mesh material={glassMaterial} castShadow scale={[1.3, 1, 1]}>
        <sphereGeometry args={[1.2, 64, 64]} />
      </mesh>

      {/* Head - smaller sphere attached to body */}
      <mesh position={[1.3, 0.3, 0]} material={glassMaterial} castShadow>
        <sphereGeometry args={[0.6, 48, 48]} />
      </mesh>

      {/* Snout */}
      <mesh position={[1.85, 0.2, 0]} rotation={[0, 0, Math.PI / 2]} material={noseMaterial} castShadow>
        <cylinderGeometry args={[0.25, 0.3, 0.2, 32]} />
      </mesh>

      {/* Nostrils */}
      <mesh position={[1.96, 0.25, 0.08]} material={eyeMaterial}>
        <sphereGeometry args={[0.04, 16, 16]} />
      </mesh>
      <mesh position={[1.96, 0.25, -0.08]} material={eyeMaterial}>
        <sphereGeometry args={[0.04, 16, 16]} />
      </mesh>

      {/* Eyes */}
      <mesh position={[1.6, 0.55, 0.35]} material={eyeMaterial}>
        <sphereGeometry args={[0.08, 24, 24]} />
      </mesh>
      <mesh position={[1.6, 0.55, -0.35]} material={eyeMaterial}>
        <sphereGeometry args={[0.08, 24, 24]} />
      </mesh>

      {/* Eye highlights */}
      <mesh position={[1.63, 0.58, 0.37]}>
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[1.63, 0.58, -0.33]}>
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>

      {/* Ears */}
      <mesh position={[1.15, 0.85, 0.3]} rotation={[0.3, 0.2, 0.4]} material={earMaterial} castShadow>
        <coneGeometry args={[0.2, 0.4, 16]} />
      </mesh>
      <mesh position={[1.15, 0.85, -0.3]} rotation={[0.3, -0.2, -0.4]} material={earMaterial} castShadow>
        <coneGeometry args={[0.2, 0.4, 16]} />
      </mesh>

      {/* Legs */}
      {[
        [0.6, -0.9, 0.5],
        [0.6, -0.9, -0.5],
        [-0.6, -0.9, 0.5],
        [-0.6, -0.9, -0.5],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} material={noseMaterial} castShadow>
          <cylinderGeometry args={[0.15, 0.18, 0.5, 16]} />
        </mesh>
      ))}

      {/* Hooves */}
      {[
        [0.6, -1.15, 0.5],
        [0.6, -1.15, -0.5],
        [-0.6, -1.15, 0.5],
        [-0.6, -1.15, -0.5],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} material={eyeMaterial} castShadow>
          <cylinderGeometry args={[0.18, 0.16, 0.1, 16]} />
        </mesh>
      ))}

      {/* Curly tail */}
      <group position={[-1.5, 0.2, 0]}>
        {Array.from({ length: 8 }, (_, i) => {
          const t = i / 7
          const x = -t * 0.4
          const y = Math.sin(t * Math.PI * 2) * 0.15
          const z = Math.cos(t * Math.PI * 2) * 0.15
          return (
            <mesh key={i} position={[x, y, z]} material={noseMaterial}>
              <sphereGeometry args={[0.06 - t * 0.02, 12, 12]} />
            </mesh>
          )
        })}
      </group>

      {/* Coin slot on top */}
      <mesh position={[0, 1.18, 0]} rotation={[0, 0, 0]} material={slotMaterial}>
        <boxGeometry args={[0.5, 0.05, 0.08]} />
      </mesh>

      {/* Slot rim */}
      <mesh position={[0, 1.15, 0]} material={earMaterial}>
        <boxGeometry args={[0.6, 0.02, 0.15]} />
      </mesh>
    </group>
  )
}
