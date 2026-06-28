// ============================================================
// IMMERSIVE 3D REDESIGN UTILS — Three.js & Custom Interactions
// ============================================================

import * as THREE from 'three';

let bgScene, bgCamera, bgRenderer, bgParticles, particleGeometry;
let bgParticlesCount = 1800;
let currentShape = 0; // 0: Vortex, 1: Beach Waves, 2: Mountains, 3: Sunset Orbit
let targetPositions = [];
let interpolationAlpha = 0.05;
let animationFrameId = null;

// Target coordinates for morphing shapes
let shapeVortex = new Float32Array(bgParticlesCount * 3);
let shapeWaves = new Float32Array(bgParticlesCount * 3);
let shapeMountains = new Float32Array(bgParticlesCount * 3);
let shapeSunset = new Float32Array(bgParticlesCount * 3);

// ==========================================
// 1. DYNAMIC BACKGROUND PARTICLES EFFECT
// ==========================================
export function initBackgroundParticles() {
    const canvas = document.createElement('canvas');
    canvas.id = 'space-background-canvas';
    document.body.insertBefore(canvas, document.body.firstChild);

    // Scene setup
    bgScene = new THREE.Scene();
    
    // Camera
    bgCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    bgCamera.position.z = 180;

    // Renderer
    bgRenderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: false,
        alpha: true,
        powerPreference: 'low-power'
    });
    bgRenderer.setSize(window.innerWidth, window.innerHeight);
    bgRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    bgRenderer.setClearColor(0x000000, 0);

    // Build geometries for the shapes
    generateShapeData();

    // Core Particle Buffer Geometry
    particleGeometry = new THREE.BufferGeometry();
    // Start with Vortex shape
    const initialPositions = new Float32Array(shapeVortex);
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(initialPositions, 3));

    // Particle Shader / Material
    const pMaterial = new THREE.PointsMaterial({
        color: 0x00f2fe,
        size: 0.0,
        transparent: true,
        opacity: 0.0,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    bgParticles = new THREE.Points(particleGeometry, pMaterial);
    bgScene.add(bgParticles);

    // Setup window resize handler
    window.addEventListener('resize', handleBGResize);

    // Animate morph
    animateParticles();
}

function generateShapeData() {
    for (let i = 0; i < bgParticlesCount; i++) {
        const i3 = i * 3;

        // Shape 0: Vortex/Stardust
        const angle = i * 0.12;
        const radius = Math.pow(i / bgParticlesCount, 0.6) * 160;
        const spiralOffset = (i % 2 === 0 ? 0 : Math.PI);
        shapeVortex[i3] = Math.cos(angle + spiralOffset) * radius + (Math.random() - 0.5) * 8;
        shapeVortex[i3 + 1] = Math.sin(angle + spiralOffset) * radius + (Math.random() - 0.5) * 8;
        shapeVortex[i3 + 2] = (Math.random() - 0.5) * 40;

        // Shape 1: Beach Waves (Sine grid)
        const cols = Math.floor(Math.sqrt(bgParticlesCount));
        const col = i % cols;
        const row = Math.floor(i / cols);
        const colWidth = 320 / cols;
        const rowHeight = 240 / cols;
        shapeWaves[i3] = (col - cols / 2) * colWidth;
        shapeWaves[i3 + 1] = -50 + Math.sin(col * 0.2 + row * 0.3) * 15;
        shapeWaves[i3 + 2] = (row - cols / 2) * rowHeight;

        // Shape 2: Mountains (Overlapping Peaks)
        const mx = (i % 40 - 20) * 8;
        const mz = (Math.floor(i / 40) - 20) * 8;
        // Simulating twin mountain ridges using Gaussians
        const d1 = Math.sqrt(Math.pow(mx - 40, 2) + Math.pow(mz, 2));
        const d2 = Math.sqrt(Math.pow(mx + 50, 2) + Math.pow(mz + 30, 2));
        const peak1 = Math.exp(-Math.pow(d1 / 60, 2)) * 60;
        const peak2 = Math.exp(-Math.pow(d2 / 50, 2)) * 45;
        shapeMountains[i3] = mx;
        shapeMountains[i3 + 1] = -40 + peak1 + peak2 + (Math.random() - 0.5) * 4;
        shapeMountains[i3 + 2] = mz;

        // Shape 3: Circular Orbit
        const spherical = new THREE.Spherical(
            85 + (Math.random() - 0.5) * 12,
            Math.acos(2 * Math.random() - 1),
            Math.random() * Math.PI * 2
        );
        const vec = new THREE.Vector3().setFromSpherical(spherical);
        shapeSunset[i3] = vec.x;
        shapeSunset[i3 + 1] = vec.y;
        shapeSunset[i3 + 2] = vec.z;
    }
    
    // Set default target
    targetPositions = shapeVortex;
}

function handleBGResize() {
    bgCamera.aspect = window.innerWidth / window.innerHeight;
    bgCamera.updateProjectionMatrix();
    bgRenderer.setSize(window.innerWidth, window.innerHeight);
}

export function setBackgroundShape(index) {
    if (index === currentShape) return;
    currentShape = index;
    if (index === 0) {
        targetPositions = shapeVortex;
        bgParticles.material.color.setHex(0x00f2fe); // Cyan for stardust
    } else if (index === 1) {
        targetPositions = shapeWaves;
        bgParticles.material.color.setHex(0x00f2fe); // Cyan/Teal for beaches
    } else if (index === 2) {
        targetPositions = shapeMountains;
        bgParticles.material.color.setHex(0xffaa00); // Gold/Amber for peaks
    } else if (index === 3) {
        targetPositions = shapeSunset;
        bgParticles.material.color.setHex(0xff6b00); // Rich orange for sunset orbit
    }
}

function animateParticles() {
    animationFrameId = requestAnimationFrame(animateParticles);

    // Slowly lerp position attributes toward targets
    const positionAttr = particleGeometry.attributes.position;
    const positions = positionAttr.array;

    let needsUpdate = false;
    for (let i = 0; i < bgParticlesCount * 3; i++) {
        const diff = targetPositions[i] - positions[i];
        if (Math.abs(diff) > 0.01) {
            positions[i] += diff * interpolationAlpha;
            needsUpdate = true;
        }
    }

    if (needsUpdate) {
        positionAttr.needsUpdate = true;
    }

    // Gentle continuous spin based on current shape
    if (currentShape === 0) {
        bgParticles.rotation.z += 0.001;
        bgParticles.rotation.y += 0.0003;
    } else if (currentShape === 1) {
        // Waves drift
        bgParticles.rotation.y = Math.sin(Date.now() * 0.0002) * 0.05;
        // Dynamic ripple inside waves
        const time = Date.now() * 0.001;
        for (let i = 0; i < bgParticlesCount; i++) {
            const i3 = i * 3;
            if (currentShape === 1) {
                // Modulate wave height offset slightly
                positions[i3 + 1] = targetPositions[i3 + 1] + Math.sin(time + (positions[i3] * 0.04)) * 3;
            }
        }
        positionAttr.needsUpdate = true;
    } else {
        bgParticles.rotation.y += 0.0006;
    }

    bgRenderer.render(bgScene, bgCamera);
}

export function destroyBackgroundParticles() {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    window.removeEventListener('resize', handleBGResize);
    if (bgRenderer) {
        bgRenderer.dispose();
    }
    const canvas = document.getElementById('space-background-canvas');
    if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
}

// ==========================================
// 2. 3D CARD HOVER PERSPECTIVE TILT
// ==========================================
export function initCardTilts() {
    const cards = document.querySelectorAll('.trip-card-redesign');
    cards.forEach(card => {
        card.addEventListener('mousemove', handleCardMouseMove);
        card.addEventListener('mouseleave', handleCardMouseLeave);
    });
}

function handleCardMouseMove(e) {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    
    // Mouse coords relative to card center
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    // Rotation coefficients (max 15 degrees)
    const rotateX = -(y / (rect.height / 2)) * 12;
    const rotateY = (x / (rect.width / 2)) * 12;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    card.style.boxShadow = `0 15px 35px rgba(255, 107, 0, 0.15)`;
}

function handleCardMouseLeave(e) {
    const card = e.currentTarget;
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    card.style.boxShadow = '';
}

// ==========================================
// 3. MAGENTIC CUSTOM CURSOR SYSTEM
// ==========================================
let cursorDot, cursorFollower;
let mouseX = -100, mouseY = -100;
let cursorX = -100, cursorY = -100;

export function initCustomCursor() {
    if (window.innerWidth < 1024) return; // Disable on tablet/mobile for raw performance
    
    cursorDot = document.createElement('div');
    cursorDot.className = 'custom-cursor';
    
    cursorFollower = document.createElement('div');
    cursorFollower.className = 'custom-cursor-follower';
    cursorFollower.innerHTML = '<span>Explore</span>';
    
    document.body.appendChild(cursorDot);
    document.body.appendChild(cursorFollower);
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    // Core animation tick for follower coordinates
    function tickCursor() {
        const easing = 0.12;
        const diffX = mouseX - cursorX;
        const diffY = mouseY - cursorY;
        
        cursorX += diffX * easing;
        cursorY += diffY * easing;
        
        if (cursorDot) {
            cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
        }
        
        if (cursorFollower) {
            cursorFollower.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
        }
        
        requestAnimationFrame(tickCursor);
    }
    tickCursor();
    
    // Magnetic and text reveal triggers on elements
    setupCursorListeners();
}

export function setupCursorListeners() {
    if (window.innerWidth < 1024) return;
    
    // Interactive targets
    const interactives = document.querySelectorAll('a, button, .trip-card-redesign, .dest-pill, .hero-search-bar');
    
    interactives.forEach(el => {
        el.addEventListener('mouseenter', () => {
            document.body.classList.add('hover-interactive');
            if (cursorFollower) {
                const text = el.dataset.cursorText || (el.classList.contains('trip-card-redesign') ? 'View' : 'Explore');
                cursorFollower.querySelector('span').textContent = text;
            }
        });
        
        el.addEventListener('mouseleave', () => {
            document.body.classList.remove('hover-interactive');
        });
    });
}

// ==========================================
// 4. PASSPORT WISHLIST STAMP & PARTICLE BURST
// ==========================================
export function applyWishlistStamp(cardElement, isSaved) {
    if (!cardElement) return;

    // Check if stamp container exists
    let container = cardElement.querySelector('.passport-stamp-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'passport-stamp-container';
        cardElement.appendChild(container);
    }

    // If unsaved, remove any existing stamps
    if (!isSaved) {
        container.innerHTML = '';
        return;
    }

    // Trigger slamming audio effect or vibration if supported
    if ('vibrate' in navigator) {
        navigator.vibrate(15);
    }

    // Generate random stamps values
    const stamps = ['PASSPORT OK', 'APPROVED', 'WANDERLUST', 'DISCOVERED', 'DEPARTURE'];
    const randomStampText = stamps[Math.floor(Math.random() * stamps.length)];
    const currentDate = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    // Create Stamp DOM
    const stampEl = document.createElement('div');
    stampEl.className = 'passport-stamp stamped';
    
    // Center-stamp randomly in card area
    const rx = 30 + Math.random() * 40; // 30% to 70% width
    const ry = 30 + Math.random() * 40; // 30% to 70% height
    stampEl.style.left = `${rx}%`;
    stampEl.style.top = `${ry}%`;

    stampEl.innerHTML = `
        <span class="passport-stamp-text">${randomStampText}</span>
        <span class="passport-stamp-sub">${currentDate}</span>
    `;

    container.appendChild(stampEl);

    // Wishlist Airplane Burst
    const rect = cardElement.getBoundingClientRect();
    triggerPaperPlaneFlight(rect.left + rect.width / 2, rect.top + rect.height / 2);
}

function triggerPaperPlaneFlight(startX, startY) {
    // Find target (wishlist icon in navbar)
    const targetEl = document.querySelector('a[href="#/saved"]') || document.querySelector('.material-icons-round[title*="Saved"]');
    if (!targetEl) return;
    
    const targetRect = targetEl.getBoundingClientRect();
    const endX = targetRect.left + targetRect.width / 2;
    const endY = targetRect.top + targetRect.height / 2;
    
    // Build floating CSS paper plane
    const plane = document.createElement('div');
    plane.style.position = 'fixed';
    plane.style.left = `${startX}px`;
    plane.style.top = `${startY}px`;
    plane.style.zIndex = '9999';
    plane.style.pointerEvents = 'none';
    plane.style.color = 'var(--color-aqua)';
    plane.innerHTML = `<span class="material-icons-round" style="font-size:24px; text-shadow:0 0 10px var(--color-aqua-glow)">send</span>`;
    
    document.body.appendChild(plane);

    // Simple physics glide path via GSAP
    if (window.gsap) {
        window.gsap.to(plane, {
            duration: 0.8,
            x: endX - startX,
            y: endY - startY,
            scale: 0.2,
            rotation: 45,
            opacity: 0.8,
            ease: 'power2.inOut',
            onComplete: () => {
                plane.remove();
                // Pulse target icon
                window.gsap.fromTo(targetEl, { scale: 1 }, { scale: 1.3, duration: 0.15, yoyo: true, repeat: 1 });
            }
        });
    } else {
        // Fallback remove
        setTimeout(() => plane.remove(), 800);
    }
}

// ==========================================
// 5. 3D CURVED CAROUSEL DRAG & MOMENTUM
// ==========================================
export function init3DCarousel(onActiveCardChange) {
    const deck = document.querySelector('.carousel-3d-deck');
    if (!deck) return;

    const wrappers = deck.querySelectorAll('.carousel-card-wrapper');
    const N = wrappers.length;
    if (N === 0) return;

    let activeIndex = 0;
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;

    // Reset deck rotation styles as we offset wrappers directly
    deck.style.transform = 'none';
    deck.style.transformStyle = 'flat';

    const updateStack = (transition = true) => {
        wrappers.forEach((wrapper, i) => {
            const diff = (i - activeIndex + N) % N;
            
            wrapper.style.transition = transition 
                ? 'transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.5s ease' 
                : 'none';

            if (diff === 0) {
                wrapper.style.transform = 'translate3d(0, 0, 10px) scale(1) rotate(0deg)';
                wrapper.style.opacity = '1';
                wrapper.style.zIndex = '10';
                wrapper.style.pointerEvents = 'auto';
                wrapper.style.visibility = 'visible';
                wrapper.classList.add('active-card');
            } else if (diff === 1) {
                wrapper.style.transform = 'translate3d(0, 15px, -40px) scale(0.93) rotate(-1.5deg)';
                wrapper.style.opacity = '0.65';
                wrapper.style.zIndex = '8';
                wrapper.style.pointerEvents = 'none';
                wrapper.style.visibility = 'visible';
                wrapper.classList.remove('active-card');
            } else if (diff === 2) {
                wrapper.style.transform = 'translate3d(0, 30px, -80px) scale(0.86) rotate(1.5deg)';
                wrapper.style.opacity = '0.3';
                wrapper.style.zIndex = '6';
                wrapper.style.pointerEvents = 'none';
                wrapper.style.visibility = 'visible';
                wrapper.classList.remove('active-card');
            } else {
                wrapper.style.transform = 'translate3d(0, 45px, -120px) scale(0.8) rotate(0deg)';
                wrapper.style.opacity = '0';
                wrapper.style.zIndex = '1';
                wrapper.style.pointerEvents = 'none';
                wrapper.style.visibility = 'hidden';
                wrapper.classList.remove('active-card');
            }
        });

        if (typeof onActiveCardChange === 'function') {
            onActiveCardChange(activeIndex);
        }
    };

    updateStack(false);

    const nextCard = () => {
        const activeWrapper = wrappers[activeIndex];
        if (activeWrapper && window.gsap) {
            window.gsap.to(activeWrapper, {
                x: 400,
                y: 50,
                rotation: 20,
                opacity: 0,
                duration: 0.35,
                ease: 'power2.out',
                onComplete: () => {
                    activeIndex = (activeIndex + 1) % N;
                    updateStack(false);
                    activeWrapper.style.transform = 'translate3d(0, 45px, -120px) scale(0.8)';
                    activeWrapper.style.opacity = '0';
                }
            });
        } else {
            activeIndex = (activeIndex + 1) % N;
            updateStack(true);
        }
    };

    const prevCard = () => {
        const prevIndex = (activeIndex - 1 + N) % N;
        const prevWrapper = wrappers[prevIndex];
        if (prevWrapper && window.gsap) {
            prevWrapper.style.transition = 'none';
            prevWrapper.style.transform = 'translate3d(-400px, 50px, 10px) scale(0.9) rotate(-20deg)';
            prevWrapper.style.opacity = '0';
            prevWrapper.style.zIndex = '11';
            prevWrapper.style.visibility = 'visible';

            requestAnimationFrame(() => {
                window.gsap.to(prevWrapper, {
                    x: 0,
                    y: 0,
                    rotation: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 0.35,
                    ease: 'power2.out',
                    onComplete: () => {
                        activeIndex = prevIndex;
                        updateStack(false);
                    }
                });
            });
        } else {
            activeIndex = prevIndex;
            updateStack(true);
        }
    };

    const nextBtn = document.getElementById('carousel-next-btn');
    const prevBtn = document.getElementById('carousel-prev-btn');

    const handleNextClick = (e) => {
        e.preventDefault();
        nextCard();
    };

    const handlePrevClick = (e) => {
        e.preventDefault();
        prevCard();
    };

    nextBtn?.addEventListener('click', handleNextClick);
    prevBtn?.addEventListener('click', handlePrevClick);

    const onPointerDown = (e) => {
        if (e.target.closest('.card-wishlist-btn') || e.target.closest('a') || e.target.closest('button')) return;
        isDragging = true;
        startX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
        startY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
        
        const activeWrapper = wrappers[activeIndex];
        if (activeWrapper) {
            activeWrapper.style.transition = 'none';
            activeWrapper.style.cursor = 'grabbing';
        }
    };

    const onPointerMove = (e) => {
        if (!isDragging) return;
        const x = e.clientX || (e.touches && e.touches[0].clientX) || 0;
        const y = e.clientY || (e.touches && e.touches[0].clientY) || 0;

        currentX = x - startX;
        currentY = y - startY;

        const activeWrapper = wrappers[activeIndex];
        if (activeWrapper) {
            const rotateDeg = currentX * 0.08;
            activeWrapper.style.transform = `translate3d(${currentX}px, ${currentY}px, 15px) scale(1.02) rotate(${rotateDeg}deg)`;
        }
    };

    const onPointerUp = () => {
        if (!isDragging) return;
        isDragging = false;

        const activeWrapper = wrappers[activeIndex];
        if (!activeWrapper) return;

        activeWrapper.style.cursor = 'grab';

        if (currentX > 110) {
            if (window.gsap) {
                window.gsap.to(activeWrapper, {
                    x: 400,
                    y: currentY + 30,
                    rotation: 25,
                    opacity: 0,
                    duration: 0.25,
                    ease: 'power2.out',
                    onComplete: () => {
                        activeIndex = (activeIndex + 1) % N;
                        updateStack(false);
                        activeWrapper.style.transform = 'translate3d(0, 45px, -120px) scale(0.8)';
                        activeWrapper.style.opacity = '0';
                    }
                });
            } else {
                activeIndex = (activeIndex + 1) % N;
                updateStack(true);
            }
        } else if (currentX < -110) {
            if (window.gsap) {
                window.gsap.to(activeWrapper, {
                    x: -400,
                    y: currentY + 30,
                    rotation: -25,
                    opacity: 0,
                    duration: 0.25,
                    ease: 'power2.out',
                    onComplete: () => {
                        activeIndex = (activeIndex + 1) % N;
                        updateStack(false);
                        activeWrapper.style.transform = 'translate3d(0, 45px, -120px) scale(0.8)';
                        activeWrapper.style.opacity = '0';
                    }
                });
            } else {
                activeIndex = (activeIndex + 1) % N;
                updateStack(true);
            }
        } else {
            activeWrapper.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s ease';
            activeWrapper.style.transform = 'translate3d(0, 0, 10px) scale(1) rotate(0deg)';
        }

        currentX = 0;
        currentY = 0;
    };

    deck.addEventListener('mousedown', onPointerDown);
    deck.addEventListener('touchstart', onPointerDown, { passive: true });

    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('touchmove', onPointerMove, { passive: true });

    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchend', onPointerUp);

    if (deck._cleanupCarousel) {
        deck._cleanupCarousel();
    }

    deck._cleanupCarousel = () => {
        deck.removeEventListener('mousedown', onPointerDown);
        deck.removeEventListener('touchstart', onPointerDown);
        window.removeEventListener('mousemove', onPointerMove);
        window.removeEventListener('touchmove', onPointerMove);
        window.removeEventListener('mouseup', onPointerUp);
        window.removeEventListener('touchend', onPointerUp);
        
        nextBtn?.removeEventListener('click', handleNextClick);
        prevBtn?.removeEventListener('click', handlePrevClick);
    };
}
