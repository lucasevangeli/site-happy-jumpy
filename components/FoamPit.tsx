'use client';

import React, { useEffect, useRef } from 'react';
import Matter from 'matter-js';

const COLORS = ['#E60A7E', '#DC822F', '#C4D648', '#00D4FF', '#FFFF00'];

const FoamPit = () => {
    const sceneRef = useRef<HTMLDivElement>(null);
    const engineRef = useRef<Matter.Engine | null>(null);

    useEffect(() => {
        if (!sceneRef.current) return;

        const { Engine, Render, Runner, Bodies, Composite, Mouse, MouseConstraint } = Matter;
        const engine = Engine.create();
        engineRef.current = engine;
        const world = engine.world;

        const containerWidth = sceneRef.current.clientWidth;
        const containerHeight = sceneRef.current.clientHeight;
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

        const render = Render.create({
            element: sceneRef.current,
            engine: engine,
            options: {
                width: containerWidth,
                height: containerHeight,
                background: 'transparent',
                wireframes: false,
                pixelRatio: isMobile ? 1 : window.devicePixelRatio // Performance turbo no mobile
            }
        });

        Render.run(render);
        const runner = Runner.create();
        Runner.run(runner, engine);

        // Ground / Walls (Invisíveis)
        const thickness = 100;
        const floor = Bodies.rectangle(containerWidth / 2, containerHeight + thickness / 2, containerWidth, thickness, { 
            isStatic: true,
            render: { visible: false }
        });
        const leftWall = Bodies.rectangle(-thickness / 2, containerHeight / 2, thickness, containerHeight * 2, { 
            isStatic: true,
            render: { visible: false }
        });
        const rightWall = Bodies.rectangle(containerWidth + thickness / 2, containerHeight / 2, thickness, containerHeight * 2, { 
            isStatic: true,
            render: { visible: false }
        });

        Composite.add(world, [floor, leftWall, rightWall]);

        // Foam blocks (Tamanho Uniforme e Bordas Levemente Arredondadas)
        const count = isMobile ? 18 : 45; // Quantidade otimizada para visual vs performance
        const blockSize = isMobile ? 45 : 60;
        const blocks = [];

        for (let i = 0; i < count; i++) {
            const x = Math.random() * containerWidth;
            const y = Math.random() * -containerHeight;

            const block = Bodies.rectangle(x, y, blockSize, blockSize, {
                chamfer: { radius: 8 }, // Mais arredondado para o mobile ficar "fofo"
                render: {
                    fillStyle: COLORS[Math.floor(Math.random() * COLORS.length)],
                    lineWidth: 0
                },
                restitution: 0.5,
                friction: 0.1,
                frictionAir: isMobile ? 0.07 : 0.04 
            });
            blocks.push(block);
        }

        Composite.add(world, [floor, leftWall, rightWall, ...blocks]);

        // Repulsor "Magnético" Invisível que segue o mouse ou touch
        const repulsor = Bodies.circle(0, 0, isMobile ? 100 : 80, {
            isStatic: true,
            render: { visible: false }
        });
        Composite.add(world, repulsor);

        const updateRepulsor = (clientX: number, clientY: number) => {
            const rect = sceneRef.current?.getBoundingClientRect();
            if (rect) {
                const x = clientX - rect.left;
                const y = clientY - rect.top;
                Matter.Body.setPosition(repulsor, { x, y });
            }
        };

        const handleMouseMove = (e: MouseEvent) => updateRepulsor(e.clientX, e.clientY);
        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches[0]) {
                updateRepulsor(e.touches[0].clientX, e.touches[0].clientY);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchstart', (e) => handleTouchMove(e));
        window.addEventListener('touchmove', (e) => handleTouchMove(e));

        // Repulsão Dinâmica (Efeito "Susto")
        Matter.Events.on(engine, 'beforeUpdate', () => {
            const bodies = Composite.allBodies(world);
            for (let i = 0; i < bodies.length; i++) {
                const body = bodies[i];
                if (body.isStatic || body === repulsor) continue;

                const dx = body.position.x - repulsor.position.x;
                const dy = body.position.y - repulsor.position.y;
                const distanceSq = dx * dx + dy * dy;
                const forceRange = isMobile ? 150 : 120; // Raio de influência maior no toque

                if (distanceSq < forceRange * forceRange) {
                    const distance = Math.sqrt(distanceSq);
                    const forceMagnitude = (forceRange - distance) * (isMobile ? 0.0006 : 0.0004);
                    Matter.Body.applyForce(body, body.position, {
                        x: (dx / distance) * forceMagnitude * body.mass,
                        y: (dy / distance) * forceMagnitude * body.mass
                    });
                }
            }
        });

        // Resize
        const handleResize = () => {
            if (!sceneRef.current) return;
            const newWidth = sceneRef.current.clientWidth;
            const newHeight = sceneRef.current.clientHeight;
            render.canvas.width = newWidth;
            render.canvas.height = newHeight;
            render.options.width = newWidth;
            render.options.height = newHeight;
            Matter.Body.setPosition(floor, { x: newWidth / 2, y: newHeight + thickness / 2 });
            Matter.Body.setPosition(rightWall, { x: newWidth + thickness / 2, y: newHeight / 2 });
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchstart', (e) => handleTouchMove(e as any));
            window.removeEventListener('touchmove', (e) => handleTouchMove(e as any));
            window.removeEventListener('resize', handleResize);
            Render.stop(render);
            Runner.stop(runner);
            Engine.clear(engine);
            render.canvas.remove();
        };
    }, []);

    return (
        <div 
            ref={sceneRef} 
            className="w-full h-full relative pointer-events-none"
            style={{ touchAction: 'none' }}
        />
    );
};

export default FoamPit;
