// ========================================================
// 神秘塔罗 Mystic Tarot · Celestial Astrolabe Space
// Contemporary Mysticism × Luxury Editorial 3D Experience
// Built with Three.js (Procedural Astrolabe & Celestial Physics)
// ========================================================

(function () {
    'use strict';

    if (typeof THREE === 'undefined') {
        console.warn('Three.js is not loaded. Celestial Astrolabe will not render.');
        return;
    }

    // ---- Color Palette (Luxury Champagne & Deep Cosmic Void) ----
    const COLORS = {
        bgDeep: 0x020106,
        goldPrimary: 0xc5a467,
        goldChampagne: 0xdfc58d,
        goldDark: 0x7a5e28,
        goldBronze: 0x4e3a18,
        ivoryWarm: 0xf5eedc,
        violetGlow: 0x160d2b,
        starWhite: 0xfffcf5,
        starWarm: 0xf7e2be,
        starViolet: 0xc4b5ed
    };

    // ---- Engine State ----
    const engine = {
        container: null,
        canvas: null,
        scene: null,
        camera: null,
        renderer: null,
        clock: new THREE.Clock(),

        // Mouse & Interaction
        mouse: { x: 0, y: 0, targetX: 0, targetY: 0, ndcX: 0, ndcY: 0 },
        scrollProgress: 0,
        targetScrollProgress: 0,
        isReducedMotion: false,
        isMobile: false,

        // State Machine: 'idle', 'aligning', 'divination'
        mode: 'idle',
        alignProgress: 0,

        // 3D Objects
        astrolabeGroup: null,
        outerMaterRing: null,
        zodiacRing: null,
        reteGridGroup: null,
        innerDialRings: [],
        alidadePointer: null,
        centralJewel: null,

        // Milky Way & Starfield Systems
        milkyWayMesh: null,
        starfield: null,
        starPositions: null,
        starOriginals: null,
        dustParticles: null,
        dustData: [],

        // Ripple & Constellation Resonance
        ripples: [],
        constellationLines: null,
        constellationTimer: 0
    };

    // ---- Initialization ----
    document.addEventListener('DOMContentLoaded', () => {
        initCelestialSpace();
    });

    function initCelestialSpace() {
        engine.canvas = document.getElementById('celestial-canvas');
        if (!engine.canvas) {
            engine.canvas = document.createElement('canvas');
            engine.canvas.id = 'celestial-canvas';
            engine.canvas.className = 'celestial-canvas';
            document.body.insertBefore(engine.canvas, document.body.firstChild);
        }

        // Reduced motion check
        const mediaReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
        engine.isReducedMotion = mediaReduced.matches;
        mediaReduced.addEventListener('change', e => { engine.isReducedMotion = e.matches; });

        // Mobile check
        engine.isMobile = window.innerWidth <= 768;

        // Scene
        engine.scene = new THREE.Scene();
        engine.scene.fog = new THREE.FogExp2(COLORS.bgDeep, 0.012);

        // Camera
        const aspect = window.innerWidth / window.innerHeight;
        engine.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
        updateCameraPosition();

        // Renderer
        const dpr = Math.min(window.devicePixelRatio || 1, engine.isMobile ? 1.5 : 2);
        engine.renderer = new THREE.WebGLRenderer({
            canvas: engine.canvas,
            antialias: !engine.isMobile,
            alpha: true,
            powerPreference: 'high-performance'
        });
        engine.renderer.setSize(window.innerWidth, window.innerHeight);
        engine.renderer.setPixelRatio(dpr);
        engine.renderer.setClearColor(COLORS.bgDeep, 1);

        // Build 3D Deep Space World
        createMilkyWayBackdrop();
        createSpatialStarfield();
        createAstrolabe();
        createDustMotes();
        createConstellationSystem();

        // Bind Listeners
        bindEvents();

        // Start Render Loop
        requestAnimationFrame(renderLoop);

        // Expose API globally
        window.CelestialSpace = {
            triggerCosmicAlignment: triggerCosmicAlignment,
            setMode: setMode,
            engine: engine
        };
    }

    function updateCameraPosition() {
        if (!engine.camera) return;
        if (engine.isMobile) {
            engine.camera.position.set(0, 0.5, 14.5);
            engine.camera.fov = 52;
        } else {
            engine.camera.position.set(0, 0, 10.5);
            engine.camera.fov = 45;
        }
        engine.camera.updateProjectionMatrix();
    }

    // ========================================================
    // ASTROLABE 3D CONSTRUCTION (古典星象仪结构 - 哑光古典蚀刻)
    // ========================================================
    function createAstrolabe() {
        const root = new THREE.Group();
        engine.astrolabeGroup = root;

        // Place on right side for luxury editorial desktop layout
        if (engine.isMobile) {
            root.position.set(0, 1.2, -1.2);
            root.scale.set(0.68, 0.68, 0.68);
        } else {
            root.position.set(2.8, 0.1, -0.4);
            root.scale.set(0.96, 0.96, 0.96);
        }

        // Initial Astronomical Tilts (Pitch & Ecliptic lean)
        root.rotation.x = 0.28;
        root.rotation.y = -0.38;
        root.rotation.z = 0.08;

        // 1. Outer Mater Ring (子午仪外环刻度盘)
        const outerRadius = 3.6;
        const materGeo = new THREE.RingGeometry(outerRadius - 0.28, outerRadius, 96);
        const materTex = createMaterTexture();
        const materMat = new THREE.MeshBasicMaterial({
            map: materTex,
            transparent: true,
            side: THREE.DoubleSide,
            color: COLORS.goldChampagne,
            opacity: 0.48
        });
        const materMesh = new THREE.Mesh(materGeo, materMat);
        root.add(materMesh);
        engine.outerMaterRing = materMesh;

        // Brass Hairline Borders
        const borderMat = new THREE.LineBasicMaterial({ color: COLORS.goldPrimary, transparent: true, opacity: 0.42 });
        const outerCircle = createHairlineCircle(outerRadius, borderMat);
        const innerCircle = createHairlineCircle(outerRadius - 0.28, borderMat);
        root.add(outerCircle);
        root.add(innerCircle);

        // 2. Zodiac Ecliptic Ring (黄道十二宫环 - 倾斜 23.5 度)
        const zodiacGroup = new THREE.Group();
        zodiacGroup.rotation.x = 0.41; // ~23.5 deg obliquity of ecliptic
        const zodiacRadius = 2.95;
        const zodiacGeo = new THREE.RingGeometry(zodiacRadius - 0.32, zodiacRadius, 84);
        const zodiacTex = createZodiacTexture();
        const zodiacMat = new THREE.MeshBasicMaterial({
            map: zodiacTex,
            transparent: true,
            side: THREE.DoubleSide,
            color: COLORS.goldChampagne,
            opacity: 0.45
        });
        const zodiacMesh = new THREE.Mesh(zodiacGeo, zodiacMat);
        zodiacGroup.add(zodiacMesh);

        const zBorder1 = createHairlineCircle(zodiacRadius, borderMat);
        const zBorder2 = createHairlineCircle(zodiacRadius - 0.32, borderMat);
        zodiacGroup.add(zBorder1);
        zodiacGroup.add(zBorder2);

        root.add(zodiacGroup);
        engine.zodiacRing = zodiacGroup;

        // 3. Armillary Rete (天球赤道与坐标镂空骨架)
        const reteGroup = new THREE.Group();
        const reteMat = new THREE.LineBasicMaterial({ color: COLORS.goldDark, transparent: true, opacity: 0.28 });

        // Concentric Coordinate Arcs
        [2.35, 1.8, 1.25, 0.75].forEach((rad) => {
            const line = createHairlineCircle(rad, reteMat);
            reteGroup.add(line);
        });

        // Diametrical & Quadrant Filigree Spokes
        const numSpokes = 16;
        const spokePoints = [];
        for (let i = 0; i < numSpokes; i++) {
            const angle = (i / numSpokes) * Math.PI * 2;
            const x1 = Math.cos(angle) * 0.75;
            const y1 = Math.sin(angle) * 0.75;
            const x2 = Math.cos(angle) * 3.3;
            const y2 = Math.sin(angle) * 3.3;
            spokePoints.push(new THREE.Vector3(x1, y1, 0), new THREE.Vector3(x2, y2, 0));
        }
        const spokeGeo = new THREE.BufferGeometry().setFromPoints(spokePoints);
        const spokeLines = new THREE.LineSegments(spokeGeo, reteMat);
        reteGroup.add(spokeLines);

        // Curved Celestial Coordinate Arcs (Almucantars)
        for (let i = -2; i <= 2; i++) {
            if (i === 0) continue;
            const arcRadius = 1.6 + Math.abs(i) * 0.45;
            const arcPoints = [];
            for (let t = -Math.PI * 0.75; t <= Math.PI * 0.75; t += 0.05) {
                const px = Math.cos(t) * arcRadius + (i * 0.4);
                const py = Math.sin(t) * arcRadius;
                if (Math.hypot(px, py) <= 3.3) {
                    arcPoints.push(new THREE.Vector3(px, py, (i * 0.05)));
                }
            }
            if (arcPoints.length > 2) {
                const arcGeo = new THREE.BufferGeometry().setFromPoints(arcPoints);
                reteGroup.add(new THREE.Line(arcGeo, reteMat));
            }
        }

        root.add(reteGroup);
        engine.reteGridGroup = reteGroup;

        // 4. Sacred Geometry Inner Rotating Dials (内盘神圣同心环)
        const dialRadii = [2.15, 1.55, 0.95];
        engine.innerDialRings = dialRadii.map((rad, idx) => {
            const dialG = new THREE.Group();
            const ringG = createHairlineCircle(rad, new THREE.LineBasicMaterial({
                color: idx === 0 ? COLORS.goldChampagne : COLORS.goldDark,
                transparent: true,
                opacity: 0.35
            }));
            dialG.add(ringG);

            // Add inscribed polygon (Hexagram or Octagram)
            const sides = idx === 0 ? 12 : (idx === 1 ? 8 : 6);
            const polyPoints = [];
            for (let s = 0; s <= sides; s++) {
                const a = (s / sides) * Math.PI * 2;
                polyPoints.push(new THREE.Vector3(Math.cos(a) * rad, Math.sin(a) * rad, 0));
            }
            const polyGeo = new THREE.BufferGeometry().setFromPoints(polyPoints);
            const polyLine = new THREE.Line(polyGeo, new THREE.LineBasicMaterial({
                color: COLORS.goldBronze,
                transparent: true,
                opacity: 0.25
            }));
            dialG.add(polyLine);

            root.add(dialG);
            return {
                group: dialG,
                speed: (idx % 2 === 0 ? 1 : -1) * (0.0006 + idx * 0.0004)
            };
        });

        // 5. Alidade Pointer (游标准星规尺)
        const alidadeG = new THREE.Group();
        const aliLength = 3.55;
        const pointerPoints = [
            new THREE.Vector3(-aliLength, 0, 0.02),
            new THREE.Vector3(-0.35, 0.08, 0.02),
            new THREE.Vector3(0, 0.18, 0.02),
            new THREE.Vector3(0.35, 0.08, 0.02),
            new THREE.Vector3(aliLength, 0, 0.02),
            new THREE.Vector3(0.35, -0.08, 0.02),
            new THREE.Vector3(0, -0.18, 0.02),
            new THREE.Vector3(-0.35, -0.08, 0.02),
            new THREE.Vector3(-aliLength, 0, 0.02)
        ];
        const aliGeo = new THREE.BufferGeometry().setFromPoints(pointerPoints);
        const aliLine = new THREE.Line(aliGeo, new THREE.LineBasicMaterial({
            color: COLORS.ivoryWarm,
            transparent: true,
            opacity: 0.52
        }));
        alidadeG.add(aliLine);

        // Sight Pinules at Pointer Ends
        [-aliLength + 0.3, aliLength - 0.3].forEach(xPos => {
            const pinG = createHairlineCircle(0.12, borderMat);
            pinG.position.set(xPos, 0, 0.02);
            alidadeG.add(pinG);
        });

        root.add(alidadeG);
        engine.alidadePointer = alidadeG;

        // 6. Central Brass Boss & Axle (中心黄铜宝核)
        const centerBossGeo = new THREE.CircleGeometry(0.24, 32);
        const centerBossMat = new THREE.MeshBasicMaterial({
            color: COLORS.goldDark,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });
        const centerBoss = new THREE.Mesh(centerBossGeo, centerBossMat);
        centerBoss.position.z = 0.03;
        root.add(centerBoss);

        const jewelGeo = new THREE.CircleGeometry(0.12, 32);
        const jewelMat = new THREE.MeshBasicMaterial({
            color: COLORS.ivoryWarm,
            transparent: true,
            opacity: 0.75,
            side: THREE.DoubleSide
        });
        const jewel = new THREE.Mesh(jewelGeo, jewelMat);
        jewel.position.z = 0.04;
        root.add(jewel);
        engine.centralJewel = jewel;

        engine.scene.add(root);
    }

    function createHairlineCircle(radius, material, segments = 84) {
        const points = [];
        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            points.push(new THREE.Vector3(Math.cos(theta) * radius, Math.sin(theta) * radius, 0));
        }
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        return new THREE.Line(geo, material);
    }

    // Canvas Texture Generators for Engraved Astrolabe Markings
    function createMaterTexture() {
        const size = 1024;
        const cv = document.createElement('canvas');
        cv.width = size;
        cv.height = size;
        const ctx = cv.getContext('2d');
        const cx = size / 2;
        const cy = size / 2;

        ctx.clearRect(0, 0, size, size);
        ctx.strokeStyle = '#c5a467';
        ctx.fillStyle = '#e2d7c0';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Outer 360 degree ticks
        const rOuter = size * 0.49;
        const rInner1 = size * 0.46;
        const rInner2 = size * 0.44;

        for (let i = 0; i < 360; i++) {
            const rad = (i * Math.PI) / 180;
            const cos = Math.cos(rad);
            const sin = Math.sin(rad);

            let rStart = (i % 10 === 0) ? rInner2 : ((i % 5 === 0) ? rInner1 : size * 0.475);
            ctx.lineWidth = (i % 10 === 0) ? 2.0 : 0.9;

            ctx.beginPath();
            ctx.moveTo(cx + cos * rStart, cy + sin * rStart);
            ctx.lineTo(cx + cos * rOuter, cy + sin * rOuter);
            ctx.stroke();

            // Roman numerals every 30 degrees (XII, I, II, III...)
            if (i % 30 === 0) {
                const hour = (i / 30 + 3) % 12 || 12;
                const romanMap = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
                const roman = romanMap[hour % 12];
                const textR = size * 0.415;
                ctx.font = '600 18px "Cinzel", "Times New Roman", serif';
                ctx.fillText(roman, cx + Math.cos(rad) * textR, cy + Math.sin(rad) * textR);
            }
        }

        const tex = new THREE.CanvasTexture(cv);
        tex.anisotropy = 4;
        return tex;
    }

    function createZodiacTexture() {
        const size = 1024;
        const cv = document.createElement('canvas');
        cv.width = size;
        cv.height = size;
        const ctx = cv.getContext('2d');
        const cx = size / 2;
        const cy = size / 2;

        ctx.clearRect(0, 0, size, size);
        ctx.strokeStyle = '#b39356';
        ctx.fillStyle = '#e5dbcb';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const symbols = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
        const rZodiac = size * 0.44;

        for (let i = 0; i < 12; i++) {
            const a = (i / 12) * Math.PI * 2;
            const cos = Math.cos(a);
            const sin = Math.sin(a);

            // Dividing graduation lines
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(cx + cos * (size * 0.38), cy + sin * (size * 0.38));
            ctx.lineTo(cx + cos * (size * 0.49), cy + sin * (size * 0.49));
            ctx.stroke();

            // Zodiac symbol
            const symAngle = a + Math.PI / 12;
            const sx = cx + Math.cos(symAngle) * rZodiac;
            const sy = cy + Math.sin(symAngle) * rZodiac;

            ctx.font = '22px serif';
            ctx.fillText(symbols[i], sx, sy);
        }

        const tex = new THREE.CanvasTexture(cv);
        tex.anisotropy = 4;
        return tex;
    }

    // ========================================================
    // AUTHENTIC MILKY WAY GALAXY SYSTEM (真实欧洲南方天文台 ESO 银河系天球全景)
    // ========================================================
    function createMilkyWayBackdrop() {
        // 1. Inverted Celestial Sky Sphere surrounding the whole 3D world
        const sphereRadius = 95;
        const sphereGeo = new THREE.SphereGeometry(sphereRadius, 64, 40);
        sphereGeo.scale(-1, 1, 1); // Invert normals to view from inside

        // Material with tuned opacity & tone so typography is high-contrast and crystal clear
        const sphereMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.70,
            depthWrite: false
        });

        const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);

        // Astronomical alignment:
        // Position the luminous galactic core (Sagittarius region) toward the upper-right (behind Astrolabe)
        // Tilt the Galactic plane across the sky
        sphereMesh.rotation.x = 0.28;
        sphereMesh.rotation.y = -Math.PI * 0.48;
        sphereMesh.rotation.z = 0.38;

        engine.scene.add(sphereMesh);
        engine.milkyWayMesh = sphereMesh;

        // 2. Load authentic ESO / Serge Brunier GigaGalaxy 360 real photograph
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load('images/milkyway-galaxy.jpg', function (tex) {
            tex.minFilter = THREE.LinearFilter;
            tex.magFilter = THREE.LinearFilter;
            tex.generateMipmaps = false;
            sphereMat.map = tex;
            sphereMat.needsUpdate = true;
        }, undefined, function (err) {
            console.warn('Real Milky Way texture load issue:', err);
        });
    }

    // ========================================================
    // SPATIAL STARFIELD (深空星系 - 低对比度与柔和微光)
    // ========================================================
    function createSpatialStarfield() {
        const count = engine.isMobile ? 700 : 1400;
        const positions = new Float32Array(count * 3);
        const originalPositions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        const cWhite = new THREE.Color(COLORS.starWhite);
        const cWarm = new THREE.Color(COLORS.starWarm);
        const cViolet = new THREE.Color(COLORS.starViolet);

        for (let i = 0; i < count; i++) {
            const idx = i * 3;
            const x = (Math.random() - 0.5) * 48;
            const y = (Math.random() - 0.5) * 34;
            const z = -65 + Math.random() * 68;

            positions[idx] = x;
            positions[idx + 1] = y;
            positions[idx + 2] = z;

            originalPositions[idx] = x;
            originalPositions[idx + 1] = y;
            originalPositions[idx + 2] = z;

            const randColor = Math.random();
            let c = cWhite;
            if (randColor < 0.4) c = cWarm;
            else if (randColor > 0.85) c = cViolet;

            colors[idx] = c.r;
            colors[idx + 1] = c.g;
            colors[idx + 2] = c.b;

            // Delicate pinpoint star sizes
            sizes[i] = 0.8 + Math.random() * 1.4;
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        // Soft Point Material with lower opacity
        const starMat = new THREE.PointsMaterial({
            size: 1.4,
            vertexColors: true,
            transparent: true,
            opacity: 0.45,
            sizeAttenuation: true
        });

        const points = new THREE.Points(geo, starMat);
        engine.scene.add(points);

        engine.starfield = points;
        engine.starPositions = positions;
        engine.starOriginals = originalPositions;
    }

    // ========================================================
    // FOREGROUND DUST MOTES (柔和微光浮尘)
    // ========================================================
    function createDustMotes() {
        const count = engine.isMobile ? 20 : 45;
        const pos = new Float32Array(count * 3);
        const geo = new THREE.BufferGeometry();
        engine.dustData = [];

        for (let i = 0; i < count; i++) {
            const idx = i * 3;
            const x = (Math.random() - 0.5) * 18;
            const y = (Math.random() - 0.5) * 12;
            const z = 1.0 + Math.random() * 5.0;

            pos[idx] = x;
            pos[idx + 1] = y;
            pos[idx + 2] = z;

            engine.dustData.push({
                baseX: x, baseY: y, baseZ: z,
                vx: 0, vy: 0,
                speed: 0.0015 + Math.random() * 0.003,
                wobble: Math.random() * Math.PI * 2
            });
        }

        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({
            color: COLORS.goldChampagne,
            size: 1.2,
            transparent: true,
            opacity: 0.28,
            sizeAttenuation: true
        });

        const dust = new THREE.Points(geo, mat);
        engine.scene.add(dust);
        engine.dustParticles = dust;
    }

    // ========================================================
    // CONSTELLATION & RIPPLE RESONANCE (点击波纹与星座共鸣)
    // ========================================================
    function createConstellationSystem() {
        const maxLines = 40;
        const linePositions = new Float32Array(maxLines * 6);
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));

        const mat = new THREE.LineBasicMaterial({
            color: COLORS.goldChampagne,
            transparent: true,
            opacity: 0.0
        });

        const lineSegments = new THREE.LineSegments(geo, mat);
        engine.scene.add(lineSegments);
        engine.constellationLines = lineSegments;
    }

    function triggerClickResonance(screenX, screenY) {
        // Map 2D click to 3D Plane
        const ndcX = (screenX / window.innerWidth) * 2 - 1;
        const ndcY = -(screenY / window.innerHeight) * 2 + 1;

        const ray = new THREE.Raycaster();
        ray.setFromCamera(new THREE.Vector2(ndcX, ndcY), engine.camera);

        const targetPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        const hitPoint = new THREE.Vector3();
        ray.ray.intersectPlane(targetPlane, hitPoint);

        // 1. Create Delicate Expanding Golden Ripple
        const rippleRing = createHairlineCircle(0.1, new THREE.LineBasicMaterial({
            color: COLORS.goldChampagne,
            transparent: true,
            opacity: 0.95
        }), 64);
        rippleRing.position.copy(hitPoint);
        engine.scene.add(rippleRing);

        engine.ripples.push({
            mesh: rippleRing,
            radius: 0.1,
            maxRadius: 4.8,
            opacity: 0.95
        });

        // 2. Weave Constellation Connections to Nearest Stars
        if (engine.starPositions && engine.constellationLines) {
            const linePos = engine.constellationLines.geometry.attributes.position.array;
            let lineIdx = 0;
            const maxConnections = 12;
            const matchedStars = [];

            const totalStars = engine.starPositions.length / 3;
            for (let i = 0; i < totalStars; i++) {
                const sx = engine.starPositions[i * 3];
                const sy = engine.starPositions[i * 3 + 1];
                const sz = engine.starPositions[i * 3 + 2];

                // Screen-space proximity
                const dist = Math.hypot(sx - hitPoint.x, sy - hitPoint.y);
                if (dist < 4.2 && sz > -30) {
                    matchedStars.push(new THREE.Vector3(sx, sy, sz));
                    if (matchedStars.length >= 8) break;
                }
            }

            // Interconnect neighboring stars with geometric lines
            for (let i = 0; i < matchedStars.length; i++) {
                for (let j = i + 1; j < matchedStars.length; j++) {
                    if (lineIdx >= maxConnections * 6) break;
                    const p1 = matchedStars[i];
                    const p2 = matchedStars[j];
                    if (p1.distanceTo(p2) < 3.8) {
                        linePos[lineIdx++] = p1.x;
                        linePos[lineIdx++] = p1.y;
                        linePos[lineIdx++] = p1.z;
                        linePos[lineIdx++] = p2.x;
                        linePos[lineIdx++] = p2.y;
                        linePos[lineIdx++] = p2.z;
                    }
                }
            }

            // Pad unused lines
            while (lineIdx < linePos.length) {
                linePos[lineIdx++] = 0;
            }

            engine.constellationLines.geometry.attributes.position.needsUpdate = true;
            engine.constellationLines.material.opacity = 0.85;
            engine.constellationTimer = 1.0;
        }
    }

    // ========================================================
    // COSMIC ALIGNMENT TRANSITION (开始占卜时的星仪聚合反应)
    // ========================================================
    function triggerCosmicAlignment(callback) {
        if (engine.mode === 'aligning') return;
        engine.mode = 'aligning';
        engine.alignProgress = 0;

        const startTime = performance.now();
        const duration = 1200; // ms

        function step(now) {
            const elapsed = now - startTime;
            const p = Math.min(1.0, elapsed / duration);
            engine.alignProgress = p;

            if (p < 1.0) {
                requestAnimationFrame(step);
            } else {
                engine.mode = 'divination';
                if (typeof callback === 'function') callback();
            }
        }
        requestAnimationFrame(step);
    }

    function setMode(newMode) {
        engine.mode = newMode;
    }

    // ========================================================
    // MAIN RENDER LOOP & PHYSICS SIMULATION
    // ========================================================
    function renderLoop() {
        requestAnimationFrame(renderLoop);

        const delta = engine.clock.getDelta();
        const time = engine.clock.getElapsedTime();

        // 1. Mouse Damping Interpolation (阻尼平滑插值)
        const lerpFactor = engine.isReducedMotion ? 0.01 : 0.045;
        engine.mouse.x += (engine.mouse.targetX - engine.mouse.x) * lerpFactor;
        engine.mouse.y += (engine.mouse.targetY - engine.mouse.y) * lerpFactor;

        // Scroll Interpolation
        engine.scrollProgress += (engine.targetScrollProgress - engine.scrollProgress) * 0.05;

        // Authentic Milky Way Celestial Sphere Motion (Real Cosmic Parallax)
        if (engine.milkyWayMesh) {
            engine.milkyWayMesh.rotation.y -= 0.0001;
            engine.milkyWayMesh.rotation.x = 0.28 + (-engine.mouse.y * 0.05);
            engine.milkyWayMesh.rotation.z = 0.38 + (engine.mouse.x * 0.05) + (engine.scrollProgress * 0.2);
        }

        // 2. Astrolabe Rotation & Parallax
        if (engine.astrolabeGroup) {
            const astro = engine.astrolabeGroup;

            if (engine.mode === 'idle') {
                // Harmonic Differential Idle Rotation
                if (engine.outerMaterRing) engine.outerMaterRing.rotation.z += 0.0006;
                if (engine.zodiacRing) engine.zodiacRing.rotation.z -= 0.0011;
                if (engine.reteGridGroup) engine.reteGridGroup.rotation.z += 0.0003;
                if (engine.alidadePointer) {
                    engine.alidadePointer.rotation.z = Math.sin(time * 0.45) * 0.55 + (time * 0.05);
                }

                engine.innerDialRings.forEach(d => {
                    d.group.rotation.z += d.speed;
                });

                // Subtle gyroscopic precession wobble
                const wobbleX = Math.sin(time * 0.35) * 0.03;
                const wobbleY = Math.cos(time * 0.28) * 0.03;

                // 3D Spatial Tilt driven by Mouse (鼠标空间倾斜)
                astro.rotation.x = 0.28 + wobbleX + (-engine.mouse.y * 0.35);
                astro.rotation.y = -0.38 + wobbleY + (engine.mouse.x * 0.45);
                astro.rotation.z = 0.08 + (engine.mouse.x * 0.15) + (engine.scrollProgress * 0.8);

                // Spatial Parallax Offset
                const targetBaseX = engine.isMobile ? 0 : 2.8;
                const targetBaseY = engine.isMobile ? 1.2 : 0.1;
                astro.position.x = targetBaseX + (engine.mouse.x * 0.35) - (engine.scrollProgress * 0.9);
                astro.position.y = targetBaseY + (engine.mouse.y * 0.3) + (engine.scrollProgress * 0.4);

            } else if (engine.mode === 'aligning') {
                // High-precision synchronization spin towards cosmic alignment
                const ease = Math.sin((engine.alignProgress * Math.PI) / 2);
                if (engine.outerMaterRing) engine.outerMaterRing.rotation.z += 0.05 * (1 - ease * 0.8);
                if (engine.zodiacRing) engine.zodiacRing.rotation.z -= 0.07 * (1 - ease * 0.8);
                if (engine.alidadePointer) engine.alidadePointer.rotation.z += 0.09 * (1 - ease * 0.8);

                // Scale & centering focus
                const currentScale = (engine.isMobile ? 0.72 : 1.0) * (1.0 + ease * 0.15);
                astro.scale.set(currentScale, currentScale, currentScale);

                // Central jewel pulse
                if (engine.centralJewel) {
                    const pulse = 1.0 + Math.sin(engine.alignProgress * Math.PI * 4) * 0.6;
                    engine.centralJewel.scale.set(pulse, pulse, pulse);
                }

            } else if (engine.mode === 'divination') {
                // Majestic slow backdrop state
                if (engine.outerMaterRing) engine.outerMaterRing.rotation.z += 0.0003;
                if (engine.zodiacRing) engine.zodiacRing.rotation.z -= 0.0005;
                if (engine.alidadePointer) engine.alidadePointer.rotation.z += 0.0002;

                astro.rotation.x = 0.22 + (-engine.mouse.y * 0.15);
                astro.rotation.y = -0.25 + (engine.mouse.x * 0.2);
            }
        }

        // 3. Deep Starfield Parallax & Cosmic Pull
        if (engine.starfield && engine.starPositions && engine.starOriginals) {
            const pos = engine.starPositions;
            const orig = engine.starOriginals;
            const total = pos.length / 3;

            const pullStrength = (engine.mode === 'aligning') ? (engine.alignProgress * 0.65) : 0;

            for (let i = 0; i < total; i++) {
                const idx = i * 3;
                // Idle gentle drift
                const ox = orig[idx];
                const oy = orig[idx + 1];
                const oz = orig[idx + 2];

                // Mouse parallax: deeper stars move less (scale inversely with depth)
                const depthFactor = (oz + 80) / 100;
                const px = ox - (engine.mouse.x * depthFactor * 1.8);
                const py = oy - (engine.mouse.y * depthFactor * 1.5);

                // Gravitational pull toward astrolabe center when aligning
                if (pullStrength > 0) {
                    pos[idx] += (px * (1 - pullStrength) - pos[idx]) * 0.1;
                    pos[idx + 1] += (py * (1 - pullStrength) - pos[idx + 1]) * 0.1;
                } else {
                    pos[idx] = px;
                    pos[idx + 1] = py;
                }
            }
            engine.starfield.geometry.attributes.position.needsUpdate = true;
        }

        // Parallax & Drift for Realistic Milky Way Backdrop
        if (engine.milkyWayMesh) {
            engine.milkyWayMesh.position.x = -engine.mouse.x * 1.6;
            engine.milkyWayMesh.position.y = -engine.mouse.y * 1.1;
            engine.milkyWayMesh.rotation.z = -0.52 + (-engine.mouse.x * 0.025);
        }

        // 4. Foreground Dust Particles & Mouse Repulsion
        if (engine.dustParticles && engine.dustData.length) {
            const pos = engine.dustParticles.geometry.attributes.position.array;
            const mouseWorldX = engine.mouse.x * 8.0;
            const mouseWorldY = engine.mouse.y * 5.0;

            for (let i = 0; i < engine.dustData.length; i++) {
                const d = engine.dustData[i];
                const idx = i * 3;

                // Drift motion
                d.wobble += d.speed;
                const targetX = d.baseX + Math.sin(d.wobble) * 0.6;
                const targetY = d.baseY + Math.cos(d.wobble * 0.8) * 0.6;

                // Proximity repulsion from mouse
                const dx = pos[idx] - mouseWorldX;
                const dy = pos[idx + 1] - mouseWorldY;
                const dist = Math.hypot(dx, dy);

                if (dist < 2.5 && !engine.isReducedMotion) {
                    const force = (2.5 - dist) * 0.02;
                    d.vx += (dx / dist) * force;
                    d.vy += (dy / dist) * force;
                }

                // Apply velocity with damping
                d.vx *= 0.92;
                d.vy *= 0.92;

                pos[idx] += (targetX + d.vx - pos[idx]) * 0.05;
                pos[idx + 1] += (targetY + d.vy - pos[idx + 1]) * 0.05;
            }
            engine.dustParticles.geometry.attributes.position.needsUpdate = true;
        }

        // 5. Click Ripples Update
        for (let r = engine.ripples.length - 1; r >= 0; r--) {
            const rip = engine.ripples[r];
            rip.radius += (rip.maxRadius - rip.radius) * 0.065;
            rip.opacity *= 0.94;

            rip.mesh.scale.set(rip.radius, rip.radius, 1);
            rip.mesh.material.opacity = rip.opacity;

            if (rip.opacity < 0.02) {
                engine.scene.remove(rip.mesh);
                rip.mesh.geometry.dispose();
                rip.mesh.material.dispose();
                engine.ripples.splice(r, 1);
            }
        }

        // 6. Constellation Lines Decay
        if (engine.constellationTimer > 0) {
            engine.constellationTimer -= delta * 0.65;
            if (engine.constellationLines) {
                engine.constellationLines.material.opacity = Math.max(0, engine.constellationTimer * 0.8);
            }
        }

        // Render Frame
        engine.renderer.render(engine.scene, engine.camera);
    }

    // ========================================================
    // EVENT LISTENERS & RESIZE (响应式与视口控制)
    // ========================================================
    function bindEvents() {
        // Mouse Move
        window.addEventListener('mousemove', e => {
            engine.mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
            engine.mouse.targetY = (e.clientY / window.innerHeight) * 2 - 1;
            engine.mouse.ndcX = e.clientX;
            engine.mouse.ndcY = e.clientY;
        }, { passive: true });

        // Touch Move (Mobile Support)
        window.addEventListener('touchmove', e => {
            if (e.touches.length > 0) {
                const t = e.touches[0];
                engine.mouse.targetX = (t.clientX / window.innerWidth) * 2 - 1;
                engine.mouse.targetY = (t.clientY / window.innerHeight) * 2 - 1;
            }
        }, { passive: true });

        // Click / Touch Resonance
        window.addEventListener('pointerdown', e => {
            // Don't trigger if clicking on interactive UI buttons or modals
            const target = e.target;
            if (target.closest('button') || target.closest('input') || target.closest('textarea') ||
                target.closest('.modal-content') || target.closest('.nav-brand') || target.closest('.nav-links') ||
                target.closest('.spread-card') || target.closest('.tarot-card')) {
                return;
            }
            triggerClickResonance(e.clientX, e.clientY);
        });

        // Scroll
        window.addEventListener('scroll', () => {
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            if (maxScroll > 0) {
                engine.targetScrollProgress = Math.min(1.0, Math.max(0, window.scrollY / maxScroll));
            }
        }, { passive: true });

        // Resize
        window.addEventListener('resize', onResize);
    }

    function onResize() {
        engine.isMobile = window.innerWidth <= 768;
        if (!engine.renderer || !engine.camera) return;

        engine.camera.aspect = window.innerWidth / window.innerHeight;
        updateCameraPosition();

        if (engine.astrolabeGroup) {
            if (engine.isMobile) {
                engine.astrolabeGroup.position.set(0, 1.2, -1.0);
                engine.astrolabeGroup.scale.set(0.72, 0.72, 0.72);
            } else {
                engine.astrolabeGroup.position.set(2.8, 0.1, 0);
                engine.astrolabeGroup.scale.set(1.0, 1.0, 1.0);
            }
        }

        const dpr = Math.min(window.devicePixelRatio || 1, engine.isMobile ? 1.5 : 2);
        engine.renderer.setSize(window.innerWidth, window.innerHeight);
        engine.renderer.setPixelRatio(dpr);
    }

})();
