import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface CoinPileProps {
  fillLevel: number
}

export function CoinPile({ fillLevel }: CoinPileProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null!)

  // Generate coin positions based on fill level
  const coinTransforms = useMemo(() => {
    const maxCoins = 150
    const numCoins = Math.floor(fillLevel * maxCoins)
    const transforms: { position: THREE.Vector3; rotation: THREE.Euler; scale: number }[] = []

    // Create a pile of coins inside the piggy bank body
    for (let i = 0; i < numCoins; i++) {
      // Distribute coins within an ellipsoid shape (piggy body)
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      // Adjust radius based on position in pile (lower = more spread, higher = tighter)
      const heightRatio = i / maxCoins
      const baseRadius = 0.9 * (1 - heightRatio * 0.3)

      // Calculate position with ellipsoid scaling
      const r = Math.random() * baseRadius * 0.8
      const x = r * Math.sin(phi) * Math.cos(theta) * 1.1 // Stretch for piggy body
      const y = -0.8 + heightRatio * 1.2 * fillLevel // Fill from bottom up
      const z = r * Math.sin(phi) * Math.sin(theta) * 0.8

      // Random rotation for natural look
      const rotation = new THREE.Euler(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      )

      // Slight scale variation
      const scale = 0.8 + Math.random() * 0.4

      transforms.push({
        position: new THREE.Vector3(x, y, z),
        rotation,
        scale
      })
    }

    return transforms
  }, [fillLevel])

  // Update instanced mesh matrices
  useFrame(() => {
    if (!instancedMeshRef.current) return

    const matrix = new THREE.Matrix4()
    const quaternion = new THREE.Quaternion()

    coinTransforms.forEach((transform, i) => {
      quaternion.setFromEuler(transform.rotation)
      matrix.compose(
        transform.position,
        quaternion,
        new THREE.Vector3(transform.scale, transform.scale, transform.scale)
      )
      instancedMeshRef.current.setMatrixAt(i, matrix)
    })

    instancedMeshRef.current.instanceMatrix.needsUpdate = true
  })

  // Gold coin material with variation
  const goldMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color('#FFD700'),
    metalness: 0.85,
    roughness: 0.15,
    emissive: new THREE.Color('#FFA500'),
    emissiveIntensity: 0.05,
  }), [])

  if (coinTransforms.length === 0) return null

  return (
    <group ref={groupRef}>
      <instancedMesh
        ref={instancedMeshRef}
        args={[undefined, undefined, coinTransforms.length]}
        material={goldMaterial}
      >
        <cylinderGeometry args={[0.12, 0.12, 0.025, 16]} />
      </instancedMesh>

      {/* Sparkle effects */}
      {fillLevel > 0.2 && (
        <Sparkles fillLevel={fillLevel} />
      )}
    </group>
  )
}

function Sparkles({ fillLevel }: { fillLevel: number }) {
  const ref = useRef<THREE.Group>(null!)
  const particlesRef = useRef<THREE.Points>(null!)

  const sparkleCount = Math.floor(fillLevel * 30)

  const { positions, sizes } = useMemo(() => {
    const positions = new Float32Array(sparkleCount * 3)
    const sizes = new Float32Array(sparkleCount)

    for (let i = 0; i < sparkleCount; i++) {
      const theta = Math.random() * Math.PI * 2
      const r = Math.random() * 0.8
      const y = -0.5 + Math.random() * fillLevel * 1.5

      positions[i * 3] = r * Math.cos(theta) * 1.1
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = r * Math.sin(theta) * 0.8

      sizes[i] = Math.random() * 0.03 + 0.01
    }

    return { positions, sizes }
  }, [sparkleCount, fillLevel])

  useFrame((state) => {
    if (!particlesRef.current) return

    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < sparkleCount; i++) {
      // Subtle floating animation
      positions[i * 3 + 1] += Math.sin(state.clock.elapsedTime * 2 + i) * 0.001
    }
    particlesRef.current.geometry.attributes.position.needsUpdate = true
  })

  const sparkleMaterial = useMemo(() => new THREE.PointsMaterial({
    color: new THREE.Color('#FFFACD'),
    size: 0.05,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
  }), [])

  if (sparkleCount === 0) return null

  return (
    <group ref={ref}>
      <points ref={particlesRef} material={sparkleMaterial}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={sparkleCount}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
      </points>
    </group>
  )
}
