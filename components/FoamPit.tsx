'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Physics, useBox, useSphere, usePlane } from '@react-three/cannon';
import * as THREE from 'three';

const COLORS = ['#E60A7E', '#DC822F', '#C4D648', '#00D4FF', '#FFFF00'];

// Individual Cube Component
function Cube({ position, color }: { position: [number, number, number], color: string }) {
    const [ref, api] = useBox(() => ({
        mass: 1,
        position,
        args: [1, 1, 1],
        material: { friction: 0.1, restitution: 0.2 },
        linearDamping: 0.2,
        angularDamping: 0.2,
    }));

    return (
        <mesh ref={ref as any} castShadow receiveShadow>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
        </mesh>
    );
}

// Mouse Repulsor Sphere (Invisible)
function MouseRepulsor() {
    const { viewport } = useThree();
    const [, api] = useSphere(() => ({
        type: 'Kinematic',
        args: [2.5],
        position: [0, 0, 0],
    }));

    useFrame((state) => {
        const x = (state.mouse.x * viewport.width) / 2;
        const y = (state.mouse.y * viewport.height) / 2;
        // Seguindo o mouse no plano XY
        api.position.set(x, y, 0.5);
    });

    return null;
}

// Dynamic Boundaries Based on Viewport
function Borders() {
    const { viewport } = useThree();
    const h = viewport.height / 2;
    const w = viewport.width / 2;

    // Floor - Posicionado exatamente no limite inferior da viewport
    usePlane(() => ({ 
        rotation: [-Math.PI / 2, 0, 0], 
        position: [0, -h, 0] 
    }), undefined, [h]);

    // Left Wall
    usePlane(() => ({ 
        rotation: [0, Math.PI / 2, 0], 
        position: [-w, 0, 0] 
    }), undefined, [w]);

    // Right Wall
    usePlane(() => ({ 
        rotation: [0, -Math.PI / 2, 0], 
        position: [w, 0, 0] 
    }), undefined, [w]);

    // Back (Depth limit)
    usePlane(() => ({ 
        rotation: [0, 0, 0], 
        position: [0, 0, -1] 
    }));

    // Front (Forward limit - helps keep interaction focused)
    usePlane(() => ({ 
        rotation: [0, Math.PI, 0], 
        position: [0, 0, 2] 
    }));

    return null;
}

const FoamPit = () => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
    const cubeCount = isMobile ? 30 : 65;

    // Cubos começam caindo de cima, mas se acumulam na base
    const cubes = useMemo(() => {
        return Array.from({ length: cubeCount }).map((_, i) => ({
            id: i,
            // Começam distribuídos na largura, caindo de alturas variadas
            position: [
                (Math.random() - 0.5) * 20, 
                Math.random() * 15 + 5,      
                Math.random() * 0.8         
            ] as [number, number, number],
            color: COLORS[Math.floor(Math.random() * COLORS.length)]
        }));
    }, [cubeCount]);

    return (
        <div className="w-full h-full relative pointer-events-auto overflow-hidden">
            <Canvas
                shadows
                orthographic
                camera={{ 
                    zoom: isMobile ? 40 : 70, 
                    position: [0, 0, 20], 
                    near: 0.1,
                    far: 1000 
                }}
                className="bg-transparent"
                style={{ touchAction: 'none' }}
                dpr={[1, 2]}
            >
                <ambientLight intensity={1.8} />
                <directionalLight 
                    position={[10, 25, 10]} 
                    intensity={2} 
                    castShadow 
                    shadow-mapSize={[1024, 1024]}
                />
                <pointLight position={[-10, 10, -5]} intensity={1.2} color="#ffffff" />

                <Physics 
                    gravity={[0, -18, 0]} 
                    defaultContactMaterial={{ friction: 0.2, restitution: 0.1 }}
                >
                    <Borders />
                    <MouseRepulsor />
                    {cubes.map((cube) => (
                        <Cube key={cube.id} position={cube.position} color={cube.color} />
                    ))}
                </Physics>
            </Canvas>
        </div>
    );
};

export default FoamPit;
