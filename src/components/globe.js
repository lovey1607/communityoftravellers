// ============================================
// 3D Globe Animation — Three.js
// Premium travel globe with flight paths
// ============================================

import * as THREE from 'three';

// City coordinates [lat, lon, name, isIndia]
const CITIES = [
    // Indian cities (origins)
    { lat: 28.61, lon: 77.21, name: 'Delhi', isOrigin: true },
    { lat: 19.07, lon: 72.87, name: 'Mumbai', isOrigin: true },
    { lat: 12.97, lon: 77.59, name: 'Bangalore', isOrigin: true },
    { lat: 13.08, lon: 80.27, name: 'Chennai', isOrigin: true },
    { lat: 22.57, lon: 88.36, name: 'Kolkata', isOrigin: true },
    { lat: 17.38, lon: 78.49, name: 'Hyderabad', isOrigin: true },
    
    // Indian destinations
    { lat: 15.49, lon: 73.82, name: 'Goa', isOrigin: false },
    { lat: 32.24, lon: 77.19, name: 'Manali', isOrigin: false },
    { lat: 34.15, lon: 77.57, name: 'Ladakh', isOrigin: false },
    { lat: 26.92, lon: 70.90, name: 'Jaisalmer', isOrigin: false },
    { lat: 9.93, lon: 76.26, name: 'Kerala', isOrigin: false },
    { lat: 30.09, lon: 78.27, name: 'Rishikesh', isOrigin: false },
    { lat: 27.18, lon: 78.02, name: 'Agra', isOrigin: false },
    
    // International destinations
    { lat: -8.34, lon: 115.17, name: 'Bali', isOrigin: false },
    { lat: 13.75, lon: 100.50, name: 'Bangkok', isOrigin: false },
    { lat: 25.20, lon: 55.27, name: 'Dubai', isOrigin: false },
    { lat: 41.01, lon: 28.98, name: 'Istanbul', isOrigin: false },
    { lat: 35.68, lon: 139.69, name: 'Tokyo', isOrigin: false },
    { lat: 4.18, lon: 73.51, name: 'Maldives', isOrigin: false },
    { lat: 27.70, lon: 85.32, name: 'Kathmandu', isOrigin: false },
    { lat: 21.02, lon: 105.85, name: 'Hanoi', isOrigin: false },
    { lat: 48.86, lon: 2.35, name: 'Paris', isOrigin: false },
    { lat: 1.35, lon: 103.82, name: 'Singapore', isOrigin: false },
    { lat: 41.69, lon: 44.80, name: 'Tbilisi', isOrigin: false },
];

// Flight routes (origin index -> destination index)
const ROUTES = [
    [0, 13], // Delhi -> Bali
    [0, 14], // Delhi -> Bangkok
    [0, 15], // Delhi -> Dubai
    [1, 16], // Mumbai -> Istanbul
    [1, 17], // Mumbai -> Tokyo
    [2, 18], // Bangalore -> Maldives
    [0, 19], // Delhi -> Kathmandu
    [2, 20], // Bangalore -> Hanoi
    [1, 21], // Mumbai -> Paris
    [4, 22], // Kolkata -> Singapore
    [0, 6],  // Delhi -> Goa
    [2, 10], // Bangalore -> Kerala
    [0, 8],  // Delhi -> Ladakh
    [1, 9],  // Mumbai -> Jaisalmer
    [0, 7],  // Delhi -> Manali
    [3, 23], // Chennai -> Tbilisi
];

export class Globe {
    constructor(container) {
        this.container = container;
        this.width = container.clientWidth;
        this.height = container.clientHeight;
        this.isVisible = true;
        this.mouse = { x: 0, y: 0 };
        this.targetRotation = { x: 0.3, y: 0 };
        this.animationId = null;
        this.arcAnimations = [];
        this.time = 0;
        
        this.isMobile = window.innerWidth < 768;
        this.isTargeting = false;
        this.targetEulerX = 0;
        this.targetEulerY = 0;
        this.focusRing = null;
        
        this.init();
        this.createGlobe();
        this.createAtmosphere();
        this.createStarfield();
        this.createCityPoints();
        this.createFlightArcs();
        this.createFloatingElements();
        this.setupEventListeners();
        this.animate();
    }

    init() {
        // Scene
        this.scene = new THREE.Scene();
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 1000);
        this.camera.position.z = this.isMobile ? 320 : 280;
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: !this.isMobile,
            alpha: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.isMobile ? 1.5 : 2));
        this.renderer.setClearColor(0x000000, 0);
        this.container.appendChild(this.renderer.domElement);
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0x443322, 0.6);
        this.scene.add(ambientLight);
        
        const pointLight = new THREE.PointLight(0xff5a00, 1.5, 500);
        pointLight.position.set(-100, 50, 150);
        this.scene.add(pointLight);
        
        const rimLight = new THREE.PointLight(0xff9f1c, 0.8, 400);
        rimLight.position.set(100, -50, -100);
        this.scene.add(rimLight);

        const warmLight = new THREE.PointLight(0xff9f1c, 0.3, 300);
        warmLight.position.set(50, 100, 80);
        this.scene.add(warmLight);
    }

    latLonToVector3(lat, lon, radius) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);
        return new THREE.Vector3(
            -radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.cos(phi),
            radius * Math.sin(phi) * Math.sin(theta)
        );
    }

    createGlobe() {
        const GLOBE_RADIUS = 100;
        this.globeRadius = GLOBE_RADIUS;
        
        // Globe group
        this.globeGroup = new THREE.Group();
        // Tilt to show India prominently
        this.globeGroup.rotation.x = 0.15;
        this.globeGroup.rotation.y = -1.2; // Center on India
        
        // Main globe sphere
        const geometry = new THREE.SphereGeometry(GLOBE_RADIUS, this.isMobile ? 48 : 64, this.isMobile ? 48 : 64);
        
        // Custom shader material for premium look
        const globeMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                lightPos: { value: new THREE.Vector3(-100, 50, 150) }
            },
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;
                varying vec2 vUv;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;
                varying vec2 vUv;
                uniform float time;
                
                void main() {
                    // Base dark color
                    vec3 baseColor = vec3(0.04, 0.02, 0.0);
                    
                    // Grid lines
                    float latLines = smoothstep(0.48, 0.5, abs(fract(vUv.y * 18.0) - 0.5));
                    float lonLines = smoothstep(0.48, 0.5, abs(fract(vUv.x * 36.0) - 0.5));
                    float grid = max(latLines, lonLines) * 0.08;
                    
                    // Continental outlines (simplified with noise-like pattern)
                    float continent = smoothstep(0.3, 0.5, sin(vUv.x * 12.0 + vUv.y * 8.0) * sin(vUv.y * 15.0 - vUv.x * 5.0));
                    continent *= 0.08;
                    
                    // Orange glow on edges (fresnel)
                    vec3 viewDir = normalize(-vPosition);
                    float fresnel = 1.0 - max(dot(viewDir, vNormal), 0.0);
                    fresnel = pow(fresnel, 3.0);
                    vec3 fresnelColor = vec3(1.0, 0.35, 0.0) * fresnel * 0.5;
                    
                    // Subtle surface color variation
                    vec3 surfaceColor = baseColor + vec3(grid * 0.8, grid * 0.5, grid * 0.0);
                    surfaceColor += vec3(continent * 0.5, continent * 0.25, continent * 0.0);
                    
                    // Lighting
                    vec3 lightDir = normalize(vec3(-1.0, 0.5, 1.5));
                    float diff = max(dot(vNormal, lightDir), 0.0) * 0.3 + 0.15;
                    
                    vec3 finalColor = surfaceColor * diff + fresnelColor;
                    
                    gl_FragColor = vec4(finalColor, 0.92);
                }
            `,
            transparent: true,
            side: THREE.FrontSide
        });
        
        this.globe = new THREE.Mesh(geometry, globeMaterial);
        this.globeGroup.add(this.globe);
        this.scene.add(this.globeGroup);
    }

    createAtmosphere() {
        // Outer glow atmosphere
        const atmosphereGeometry = new THREE.SphereGeometry(this.globeRadius * 1.15, 32, 32);
        const atmosphereMaterial = new THREE.ShaderMaterial({
            vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec3 vNormal;
                void main() {
                    float intensity = pow(0.65 - dot(vNormal, vec3(0, 0, 1.0)), 2.5);
                    vec3 color = mix(vec3(1.0, 0.35, 0.0), vec3(1.0, 0.62, 0.11), intensity);
                    gl_FragColor = vec4(color, intensity * 0.3);
                }
            `,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
            transparent: true
        });
        
        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        this.globeGroup.add(atmosphere);
    }

    createStarfield() {
        const starCount = this.isMobile ? 1000 : 2500;
        const positions = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);
        const colors = new Float32Array(starCount * 3);
        
        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            // Distribute in a sphere around the scene
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = 400 + Math.random() * 200;
            
            positions[i3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = r * Math.cos(phi);
            
            sizes[i] = Math.random() * 2 + 0.5;
            
            // Mostly white/amber with some orange
            const colorChoice = Math.random();
            if (colorChoice < 0.7) {
                colors[i3] = 0.9 + Math.random() * 0.1;
                colors[i3 + 1] = 0.85 + Math.random() * 0.15;
                colors[i3 + 2] = 0.8;
            } else if (colorChoice < 0.9) {
                colors[i3] = 1.0;
                colors[i3 + 1] = 0.5 + Math.random() * 0.3;
                colors[i3 + 2] = 0.0 + Math.random() * 0.2;
            } else {
                colors[i3] = 1.0;
                colors[i3 + 1] = 0.7 + Math.random() * 0.2;
                colors[i3 + 2] = 0.1;
            }
        }
        
        const starGeometry = new THREE.BufferGeometry();
        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const starMaterial = new THREE.PointsMaterial({
            size: 1.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true
        });
        
        this.stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(this.stars);
    }

    createCityPoints() {
        // Instanced mesh for city dots
        const dotGeometry = new THREE.SphereGeometry(1.2, 8, 8);
        
        CITIES.forEach((city, index) => {
            const pos = this.latLonToVector3(city.lat, city.lon, this.globeRadius + 0.5);
            
            // City dot
            const dotMaterial = new THREE.MeshBasicMaterial({
                color: city.isOrigin ? 0xff9f1c : 0xff5a00,
                transparent: true,
                opacity: 0.9
            });
            
            const dot = new THREE.Mesh(dotGeometry, dotMaterial);
            dot.position.copy(pos);
            dot.scale.setScalar(city.isOrigin ? 1.3 : 0.9);
            this.globeGroup.add(dot);
            
            // Pulse ring for origin cities
            if (city.isOrigin) {
                const ringGeometry = new THREE.RingGeometry(2, 3.5, 16);
                const ringMaterial = new THREE.MeshBasicMaterial({
                    color: 0xff9f1c,
                    transparent: true,
                    opacity: 0.4,
                    side: THREE.DoubleSide,
                    blending: THREE.AdditiveBlending
                });
                const ring = new THREE.Mesh(ringGeometry, ringMaterial);
                ring.position.copy(pos);
                ring.lookAt(new THREE.Vector3(0, 0, 0));
                ring.userData = { pulsePhase: Math.random() * Math.PI * 2 };
                this.globeGroup.add(ring);
            }
        });
    }

    createFlightArcs() {
        this.arcs = [];
        
        ROUTES.forEach((route, routeIndex) => {
            const startCity = CITIES[route[0]];
            const endCity = CITIES[route[1]];
            
            const startVec = this.latLonToVector3(startCity.lat, startCity.lon, this.globeRadius + 1);
            const endVec = this.latLonToVector3(endCity.lat, endCity.lon, this.globeRadius + 1);
            
            // Calculate arc height based on distance
            const distance = startVec.distanceTo(endVec);
            const arcHeight = this.globeRadius + Math.min(distance * 0.3, 50);
            
            // Midpoint elevated above globe surface
            const mid = startVec.clone().lerp(endVec, 0.5);
            mid.normalize().multiplyScalar(arcHeight);
            
            // Control points for smooth arc
            const ctrl1 = startVec.clone().lerp(mid, 0.5);
            ctrl1.normalize().multiplyScalar(arcHeight * 0.9);
            const ctrl2 = endVec.clone().lerp(mid, 0.5);
            ctrl2.normalize().multiplyScalar(arcHeight * 0.9);
            
            // Create bezier curve
            const curve = new THREE.CubicBezierCurve3(startVec, ctrl1, ctrl2, endVec);
            const points = curve.getPoints(this.isMobile ? 40 : 60);
            
            // Arc line with gradient
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            
            // Color gradient along the arc
            const colors = new Float32Array(points.length * 3);
            for (let i = 0; i < points.length; i++) {
                const t = i / (points.length - 1);
                const i3 = i * 3;
                // Orange to gold gradient
                colors[i3] = 1.0;
                colors[i3 + 1] = 0.35 + t * 0.27;
                colors[i3 + 2] = 0.0 + t * 0.11;
            }
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
            
            const material = new THREE.LineBasicMaterial({
                vertexColors: true,
                transparent: true,
                opacity: 0.6,
                blending: THREE.AdditiveBlending,
                linewidth: 1
            });
            
            const line = new THREE.Line(geometry, material);
            
            // Animate with draw range
            geometry.setDrawRange(0, 0);
            
            this.globeGroup.add(line);
            
            // Small plane dot that travels along the arc
            const planeDotGeo = new THREE.SphereGeometry(1, 6, 6);
            const planeDotMat = new THREE.MeshBasicMaterial({
                color: 0xff9f1c,
                transparent: true,
                opacity: 0.9,
                blending: THREE.AdditiveBlending
            });
            const planeDot = new THREE.Mesh(planeDotGeo, planeDotMat);
            planeDot.visible = false;
            this.globeGroup.add(planeDot);
            
            this.arcs.push({
                line,
                geometry,
                curve,
                points,
                planeDot,
                drawCount: 0,
                totalPoints: points.length,
                speed: 0.3 + Math.random() * 0.4,
                delay: routeIndex * 0.8,
                phase: 0
            });
        });
    }

    createFloatingElements() {
        // Floating compass circle (decorative)
        const compassGroup = new THREE.Group();
        const compassRingGeo = new THREE.TorusGeometry(15, 0.3, 8, 32);
        const compassRingMat = new THREE.MeshBasicMaterial({
            color: 0xff5a00,
            transparent: true,
            opacity: 0.15,
            blending: THREE.AdditiveBlending
        });
        const compassRing = new THREE.Mesh(compassRingGeo, compassRingMat);
        compassGroup.add(compassRing);
        
        // N-S line
        const nsGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, -14, 0),
            new THREE.Vector3(0, 14, 0)
        ]);
        const nsMat = new THREE.LineBasicMaterial({ color: 0xff5a00, transparent: true, opacity: 0.1 });
        compassGroup.add(new THREE.Line(nsGeo, nsMat));
        
        compassGroup.position.set(150, 80, -50);
        compassGroup.rotation.x = Math.PI / 4;
        this.compassGroup = compassGroup;
        this.scene.add(compassGroup);
        
        // Floating orbit rings
        for (let i = 0; i < 2; i++) {
            const orbitGeo = new THREE.TorusGeometry(this.globeRadius + 15 + i * 20, 0.2, 8, 64);
            const orbitMat = new THREE.MeshBasicMaterial({
                color: i === 0 ? 0xff5a00 : 0xff9f1c,
                transparent: true,
                opacity: 0.08,
                blending: THREE.AdditiveBlending
            });
            const orbit = new THREE.Mesh(orbitGeo, orbitMat);
            orbit.rotation.x = Math.PI / 2 + (i * 0.3);
            orbit.rotation.y = i * 0.5;
            this.globeGroup.add(orbit);
        }
    }

    setupEventListeners() {
        // Mouse parallax
        this.container.addEventListener('mousemove', (e) => {
            const rect = this.container.getBoundingClientRect();
            this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        });
        
        // Resize
        this.resizeObserver = new ResizeObserver(() => {
            this.width = this.container.clientWidth;
            this.height = this.container.clientHeight;
            this.camera.aspect = this.width / this.height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.width, this.height);
        });
        this.resizeObserver.observe(this.container);
        
        // Visibility (pause when offscreen)
        this.intersectionObserver = new IntersectionObserver(
            ([entry]) => { this.isVisible = entry.isIntersecting; },
            { threshold: 0.1 }
        );
        this.intersectionObserver.observe(this.container);
        
        // Page visibility
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.isVisible = false;
            } else {
                this.isVisible = true;
            }
        });
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        if (!this.isVisible) return;
        
        this.time += 0.01;
        
        // Slow auto-rotation + mouse parallax
        const parallaxX = this.mouse.y * 0.05;
        const parallaxY = this.mouse.x * 0.1;
        
        if (this.isTargeting) {
            this.globeGroup.rotation.y += (this.targetEulerY + parallaxY - this.globeGroup.rotation.y) * 0.05;
            this.globeGroup.rotation.x += (this.targetEulerX + parallaxX - this.globeGroup.rotation.x) * 0.05;
            this.targetRotation.y = this.globeGroup.rotation.y;
        } else {
            this.targetRotation.y += 0.001;
            this.globeGroup.rotation.y += (this.targetRotation.y + parallaxY - this.globeGroup.rotation.y) * 0.02;
            this.globeGroup.rotation.x += (0.15 + parallaxX - this.globeGroup.rotation.x) * 0.02;
        }
        
        // Update globe shader time
        if (this.globe.material.uniforms) {
            this.globe.material.uniforms.time.value = this.time;
        }
        
        // Animate flight arcs
        this.arcs.forEach((arc, i) => {
            arc.phase += arc.speed * 0.02;
            
            if (arc.phase < arc.delay * 0.02) return;
            
            const progress = ((arc.phase - arc.delay * 0.02) % 2.5) / 2.5;
            
            if (progress < 0.7) {
                // Drawing phase
                const drawProgress = progress / 0.7;
                const count = Math.floor(drawProgress * arc.totalPoints);
                arc.geometry.setDrawRange(0, count);
                
                // Move plane dot
                const t = drawProgress;
                const pos = arc.curve.getPoint(t);
                arc.planeDot.position.copy(pos);
                arc.planeDot.visible = true;
                arc.planeDot.material.opacity = 0.9;
            } else if (progress < 0.85) {
                // Hold phase
                arc.geometry.setDrawRange(0, arc.totalPoints);
                arc.planeDot.visible = true;
                const pos = arc.curve.getPoint(1);
                arc.planeDot.position.copy(pos);
            } else {
                // Fade out phase
                const fadeProgress = (progress - 0.85) / 0.15;
                arc.line.material.opacity = 0.6 * (1 - fadeProgress);
                arc.planeDot.material.opacity = (1 - fadeProgress);
                
                if (fadeProgress >= 1) {
                    arc.geometry.setDrawRange(0, 0);
                    arc.planeDot.visible = false;
                    arc.line.material.opacity = 0.6;
                }
            }
        });
        
        // Rotate starfield slowly
        this.stars.rotation.y += 0.0001;
        this.stars.rotation.x += 0.00005;
        
        // Animate compass
        this.compassGroup.rotation.z += 0.003;
        this.compassGroup.position.y = 80 + Math.sin(this.time * 0.5) * 10;
        
        // Render
        this.renderer.render(this.scene, this.camera);
    }

    spinToCoordinates(lat, lon, name = '') {
        this.isTargeting = true;
        const radLat = lat * (Math.PI / 180);
        const radLon = lon * (Math.PI / 180);
        
        this.targetEulerX = radLat * 0.55;
        this.targetEulerY = -radLon - Math.PI / 2;
        
        const currentY = this.globeGroup.rotation.y;
        const diffY = ((this.targetEulerY - currentY + Math.PI) % (Math.PI * 2)) - Math.PI;
        this.targetEulerY = currentY + diffY;
        
        const targetPos = this.latLonToVector3(lat, lon, this.globeRadius + 1);
        if (this.focusRing) {
            this.globeGroup.remove(this.focusRing);
        }
        
        const ringGeo = new THREE.RingGeometry(3, 7, 32);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0x00f2fe,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending
        });
        this.focusRing = new THREE.Mesh(ringGeo, ringMat);
        this.focusRing.position.copy(targetPos);
        this.focusRing.lookAt(new THREE.Vector3(0, 0, 0));
        this.globeGroup.add(this.focusRing);
        
        if (window.gsap) {
            // Cinematic camera zoom-out/in animation
            const startZ = this.isMobile ? 320 : 280;
            const peakZ = this.isMobile ? 385 : 345;
            window.gsap.to(this.camera.position, {
                z: peakZ,
                duration: 0.75,
                yoyo: true,
                repeat: 1,
                ease: 'power2.inOut',
                onComplete: () => {
                    // Ensure camera Z returns to original state
                    this.camera.position.z = startZ;
                }
            });

            window.gsap.fromTo(this.focusRing.scale, 
                { x: 0.1, y: 0.1, z: 0.1 }, 
                { x: 2.2, y: 2.2, z: 2.2, duration: 1.2, repeat: 1, ease: 'power2.out' }
            );
            window.gsap.fromTo(this.focusRing.material, 
                { opacity: 0.9 }, 
                { opacity: 0, duration: 1.2, repeat: 1, ease: 'power2.out', onComplete: () => {
                    if (this.focusRing) {
                        this.globeGroup.remove(this.focusRing);
                        this.focusRing = null;
                    }
                    this.isTargeting = false;
                }}
            );
        } else {
            setTimeout(() => {
                if (this.focusRing) {
                    this.globeGroup.remove(this.focusRing);
                    this.focusRing = null;
                }
                this.isTargeting = false;
            }, 2400);
        }
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
        
        // Dispose geometries and materials
        this.scene.traverse((child) => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(m => m.dispose());
                } else {
                    child.material.dispose();
                }
            }
        });
        
        this.renderer.dispose();
        
        if (this.renderer.domElement && this.renderer.domElement.parentNode) {
            this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
        }
    }
}
