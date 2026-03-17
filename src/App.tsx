import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Float, ContactShadows } from '@react-three/drei'
import { Suspense, useState, useCallback, useRef, useEffect } from 'react'
import { PiggyBank } from './components/PiggyBank'
import { FallingCoins } from './components/FallingCoins'
import { CoinPile } from './components/CoinPile'

function Scene({ coins, fillLevel }: { coins: { id: number; delay: number }[]; fillLevel: number }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight position={[-3, 5, -2]} intensity={0.4} color="#ffe4e1" />
      <pointLight position={[0, 3, 0]} intensity={0.5} color="#ffd700" />

      <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.3}>
        <group position={[0, -0.5, 0]}>
          <PiggyBank fillLevel={fillLevel} />
          <CoinPile fillLevel={fillLevel} />
        </group>
      </Float>

      <FallingCoins coins={coins} />

      <ContactShadows
        position={[0, -2.5, 0]}
        opacity={0.4}
        scale={10}
        blur={2}
        far={4}
        color="#8b6b61"
      />

      <Environment preset="apartment" />
    </>
  )
}

function App() {
  const [coins, setCoins] = useState<{ id: number; delay: number }[]>([])
  const [fillLevel, setFillLevel] = useState(0)
  const [totalSaved, setTotalSaved] = useState(0)
  const coinIdRef = useRef(0)
  const intervalRef = useRef<number | null>(null)

  const dropCoin = useCallback(() => {
    const newCoin = { id: coinIdRef.current++, delay: 0 }
    setCoins(prev => [...prev.slice(-30), newCoin])
    setFillLevel(prev => Math.min(prev + 0.02, 1))
    setTotalSaved(prev => prev + Math.floor(Math.random() * 50) + 10)
  }, [])

  const startAutoDropping = useCallback(() => {
    if (intervalRef.current) return
    intervalRef.current = window.setInterval(() => {
      dropCoin()
    }, 400)
  }, [dropCoin])

  const stopAutoDropping = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    // Initial burst of coins
    const initialCoins = Array.from({ length: 5 }, (_, i) => ({
      id: coinIdRef.current++,
      delay: i * 0.15
    }))
    setCoins(initialCoins)
    setFillLevel(0.1)
    setTotalSaved(150)
  }, [])

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  return (
    <div className="w-screen h-screen relative overflow-hidden" style={{
      background: 'linear-gradient(180deg, #FFF8F5 0%, #FFE8E0 50%, #FDF5F0 100%)'
    }}>
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 md:w-64 md:h-64 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #FFD700 0%, transparent 70%)' }} />
        <div className="absolute bottom-40 right-20 w-48 h-48 md:w-96 md:h-96 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #F4A0A0 0%, transparent 70%)' }} />
        <div className="absolute top-1/3 right-10 w-24 h-24 md:w-48 md:h-48 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #87CEEB 0%, transparent 70%)' }} />
      </div>

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 p-4 md:p-8">
        <div className="text-center">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-light tracking-wider"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: '#8B6B61',
              textShadow: '0 2px 4px rgba(139, 107, 97, 0.1)'
            }}>
            Savings Jar
          </h1>
          <p className="text-xs md:text-sm mt-2 tracking-widest uppercase opacity-60"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: '#A08B83'
            }}>
            Watch your dreams grow
          </p>
        </div>
      </header>

      {/* Stats Panel */}
      <div className="absolute top-24 md:top-32 right-4 md:right-8 z-10 p-4 md:p-6 rounded-2xl backdrop-blur-md"
        style={{
          background: 'rgba(255, 255, 255, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          boxShadow: '0 8px 32px rgba(139, 107, 97, 0.1)'
        }}>
        <div className="text-center">
          <p className="text-xs tracking-widest uppercase mb-1"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: '#A08B83'
            }}>
            Total Saved
          </p>
          <p className="text-2xl md:text-3xl font-light"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: '#D4A574',
              textShadow: '0 2px 4px rgba(212, 165, 116, 0.2)'
            }}>
            ${totalSaved.toLocaleString()}
          </p>
        </div>
        <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-white/50">
          <p className="text-xs tracking-widest uppercase mb-2"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: '#A08B83'
            }}>
            Fill Level
          </p>
          <div className="w-24 md:w-32 h-2 rounded-full overflow-hidden"
            style={{ background: 'rgba(139, 107, 97, 0.1)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${fillLevel * 100}%`,
                background: 'linear-gradient(90deg, #F4A0A0, #D4A574, #FFD700)'
              }}
            />
          </div>
          <p className="text-right text-xs mt-1 opacity-60"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: '#A08B83'
            }}>
            {Math.round(fillLevel * 100)}%
          </p>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="absolute bottom-20 md:bottom-24 left-1/2 transform -translate-x-1/2 z-10 flex gap-3 md:gap-4">
        <button
          onClick={dropCoin}
          className="px-6 md:px-8 py-3 md:py-4 rounded-full text-sm md:text-base tracking-wider uppercase transition-all duration-300 hover:scale-105 active:scale-95"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            background: 'linear-gradient(135deg, #D4A574 0%, #E8C49A 100%)',
            color: '#FFFFFF',
            boxShadow: '0 8px 24px rgba(212, 165, 116, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
            border: 'none',
            minWidth: '120px'
          }}>
          Drop Coin
        </button>
        <button
          onMouseDown={startAutoDropping}
          onMouseUp={stopAutoDropping}
          onMouseLeave={stopAutoDropping}
          onTouchStart={startAutoDropping}
          onTouchEnd={stopAutoDropping}
          className="px-6 md:px-8 py-3 md:py-4 rounded-full text-sm md:text-base tracking-wider uppercase transition-all duration-300 hover:scale-105 active:scale-95"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            background: 'linear-gradient(135deg, #F4A0A0 0%, #FFB6B6 100%)',
            color: '#FFFFFF',
            boxShadow: '0 8px 24px rgba(244, 160, 160, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
            border: 'none',
            minWidth: '120px'
          }}>
          Rain Money
        </button>
      </div>

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 1, 6], fov: 45 }}
        shadows
        dpr={[1, 2]}
        style={{ touchAction: 'none' }}
      >
        <Suspense fallback={null}>
          <Scene coins={coins} fillLevel={fillLevel} />
        </Suspense>
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={4}
          maxDistance={12}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>

      {/* Footer */}
      <footer className="absolute bottom-4 left-0 right-0 text-center z-10">
        <p className="text-xs tracking-wide opacity-40"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            color: '#8B6B61'
          }}>
          Requested by @web-user · Built by @clonkbot
        </p>
      </footer>
    </div>
  )
}

export default App
