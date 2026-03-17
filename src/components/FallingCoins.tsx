import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface Coin {
  id: number
  delay: number
}

interface FallingCoinsProps {
  coins: Coin[]
}

function SingleCoin({ delay, onComplete }: { delay: number; onComplete: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const startTime = useRef<number | null>(null)
  const initialX = useRef(Math.random() * 1.5 - 0.75)
  const initialZ = useRef(Math.random() * 0.8 - 0.4)
  const rotationSpeed = useRef({
    x: Math.random() * 10 + 5,
    y: Math.random() * 10 + 5,
    z: Math.random() * 5,
  })
  const wobble = useRef({
    amplitude: Math.random() * 0.3 + 0.1,
    frequency: Math.random() * 3 + 2,
  })

  const goldMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color('#FFD700'),
    metalness: 0.9,
    roughness: 0.1,
    emissive: new THREE.Color('#FFA500'),
    emissiveIntensity: 0.1,
  }), [])

  useFrame((state, delta) => {
    if (!meshRef.current) return

    if (startTime.current === null) {
      startTime.current = state.clock.elapsedTime + delay
    }

    const elapsed = state.clock.elapsedTime - startTime.current

    if (elapsed < 0) {
      meshRef.current.visible = false
      return
    }

    meshRef.current.visible = true

    // Physics simulation
    const gravity = 9.8
    const startY = 5
    const targetY = -0.3 // Target position inside piggy bank

    // Calculate position with gravity
    const y = startY - 0.5 * gravity * elapsed * elapsed

    if (y < targetY) {
      // Coin has reached inside the piggy bank
      meshRef.current.visible = false
      onComplete()
      return
    }

    // Wobble side to side while falling
    const wobbleX = Math.sin(elapsed * wobble.current.frequency) * wobble.current.amplitude * (1 - elapsed * 0.3)
    const wobbleZ = Math.cos(elapsed * wobble.current.frequency * 0.7) * wobble.current.amplitude * 0.5

    meshRef.current.position.set(
      initialX.current + wobbleX,
      y,
      initialZ.current + wobbleZ
    )

    // Spin the coin
    meshRef.current.rotation.x += rotationSpeed.current.x * delta
    meshRef.current.rotation.y += rotationSpeed.current.y * delta
    meshRef.current.rotation.z += rotationSpeed.current.z * delta

    // Scale effect - slightly squish on approach
    const scale = Math.max(0.8, 1 - Math.abs(y - 1) * 0.05)
    meshRef.current.scale.setScalar(scale)
  })

  return (
    <mesh ref={meshRef} material={goldMaterial} castShadow>
      <cylinderGeometry args={[0.15, 0.15, 0.03, 32]} />
    </mesh>
  )
}

export function FallingCoins({ coins }: FallingCoinsProps) {
  const completedCoins = useRef(new Set<number>())

  return (
    <group>
      {coins.map((coin) => (
        <SingleCoin
          key={coin.id}
          delay={coin.delay}
          onComplete={() => completedCoins.current.add(coin.id)}
        />
      ))}
    </group>
  )
}
