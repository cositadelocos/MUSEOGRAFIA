// --- ESCENA 1: MUSEO ESPACIAL ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505);
scene.fog = new THREE.Fog(0x050505, 10, 60); // Ajuste de niebla para ver más lejos

const aspect = window.innerWidth / window.innerHeight;
const d = 12;
const camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
camera.position.set(20, 20, 20);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('container').appendChild(renderer.domElement);

// ILUMINACIÓN ESPACIAL POTENTE
// HemisphereLight para dar un tono base más natural sin aplanar las sombras
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
scene.add(hemiLight);

const ambient1 = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambient1);

const mainLight1 = new THREE.DirectionalLight(0xffffff, 1.2); // Más potencia
mainLight1.position.set(10, 25, 10);
mainLight1.castShadow = true;
mainLight1.shadow.mapSize.set(2048, 2048);
scene.add(mainLight1);

// Luz de relleno focalizada
const pointLight = new THREE.PointLight(0x00f3ff, 1, 30);
pointLight.position.set(0, 10, 0);
scene.add(pointLight);

// Campo de estrellas más brillante
const starsGeo = new THREE.BufferGeometry();
const starsCount = 1500;
const posArray = new Float32Array(starsCount * 3);
for (let i = 0; i < starsCount * 3; i++) posArray[i] = (Math.random() - 0.5) * 120;
starsGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const starsMat = new THREE.PointsMaterial({ size: 0.15, color: 0xffffff, transparent: true, opacity: 0.8 });
const starsMesh = new THREE.Points(starsGeo, starsMat);
scene.add(starsMesh);

// --- ESCENA 2: SALA DE DETALLE ESPACIAL ---
const sceneDetail = new THREE.Scene();
sceneDetail.background = new THREE.Color(0x020202);
sceneDetail.fog = new THREE.Fog(0x020202, 5, 25);

const cameraDetail = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
cameraDetail.position.set(0, 2.5, 9);
cameraDetail.lookAt(0, 2.5, 0);

// ILUMINACIÓN SALA DETALLE
const lightDetail1 = new THREE.SpotLight(0x00f3ff, 5); // Mucha más intensidad
lightDetail1.position.set(5, 10, 5);
lightDetail1.angle = 0.5;
lightDetail1.penumbra = 0.5;
sceneDetail.add(lightDetail1);
sceneDetail.add(new THREE.AmbientLight(0xffffff, 0.5));

// --- ELEMENTOS DEL MUSEO ---
const baseGeo = new THREE.BoxGeometry(18, 0.4, 18);
const baseMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.2,
    metalness: 0
});
const floor = new THREE.Mesh(baseGeo, baseMat);
floor.receiveShadow = true;
scene.add(floor);

const stationsData = [
    { title: "Materiales y tecnologías", text: "Explora los componentes físicos y técnicos de la prenda.", x: -6, z: 6, color: 0xaaaaaa, type: 'materials', detailId: 'modulo-1-detail' },
    { title: "Técnicas de confección", text: "Sistemas constructivos y métodos de sastrería.", x: -6, z: -6, color: 0x00f3ff, type: 'cube', detailId: 'modulo-2-detail' },
    { title: "Forma, función y contexto", text: "Análisis sociocultural y simbólico del traje.", x: 6, z: -6, color: 0x888888, type: 'sphere', detailId: 'modulo-3-detail' },
    { title: "Lectura museográfica del traje", text: "Investigación sobre la representación institucional.", x: 6, z: 6, color: 0xffffff, type: 'torus', detailId: 'modulo-4-detail' },
    { title: "Pieza Central", text: "Traje completo de Francisco José de Caldas.", x: 0, z: 0, color: 0x333333, type: 'monolith', detailId: 'modulo-central-detail' }
];

const stations = [];
let loader = null;
if (typeof THREE.GLTFLoader !== 'undefined') loader = new THREE.GLTFLoader();

let modelDetailRoom = null;

stationsData.forEach(data => {
    const group = new THREE.Group();
    group.position.set(data.x, 0, data.z);

    const pedestalMat = new THREE.MeshStandardMaterial({ color: 0xf0f0f0, metalness: 0.2, roughness: 0.1 });
    const pedestal = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.8, 1.2), pedestalMat);
    pedestal.position.y = 0.9;
    pedestal.castShadow = true;
    group.add(pedestal);

    const baseLight = new THREE.Mesh(
        new THREE.CylinderGeometry(0.7, 0.7, 0.05, 32),
        new THREE.MeshStandardMaterial({ color: 0x00f3ff, emissive: 0x00f3ff, emissiveIntensity: 0 })
    );
    baseLight.position.y = 1.81;
    group.add(baseLight);

    const createFallback = () => {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 0.8), new THREE.MeshStandardMaterial({ color: 0x444444, emissive: 0x00f3ff, emissiveIntensity: 0.5 }));
        mesh.position.y = 2.4;
        mesh.castShadow = true;
        group.add(mesh);
        group.userData.art = mesh;
    };

    if (data.type === 'monolith' && loader) {
        loader.load('trajep.glb', (gltf) => {
            const model = gltf.scene;

            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            model.position.x = -center.x;
            model.position.z = -center.z;
            model.position.y = -box.min.y;
            const targetHeight = 3.5;
            const s = targetHeight / size.y;
            model.scale.set(s, s, s);
            model.position.y = 1.9;

            model.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
            group.add(model);
            group.userData.art = model;

            const modelClone = gltf.scene.clone();
            const box2 = new THREE.Box3().setFromObject(modelClone);
            const size2 = box2.getSize(new THREE.Vector3());
            const s2 = 4.5 / size2.y;
            modelClone.scale.set(s2, s2, s2);
            modelClone.position.set(0, 0.5, 0);
            sceneDetail.add(modelClone);
            modelDetailRoom = modelClone;
        }, undefined, () => createFallback());
    } else {
        createFallback();
    }

    group.userData = {
        ...group.userData,
        title: data.title,
        text: data.text,
        baseLight: baseLight,
        isCentral: data.type === 'monolith',
        hasDetail: true,
        detailId: data.detailId
    };
    scene.add(group);
    stations.push(group);
});

// PERSONAJE
const playerGroup = new THREE.Group();
const playerBody = new THREE.Mesh(new THREE.CapsuleGeometry(0.35, 0.6, 4, 16), new THREE.MeshStandardMaterial({ color: 0xff6666, emissive: 0xff6666, emissiveIntensity: 1 }));
playerBody.position.y = 0.65;
playerGroup.add(playerBody);
playerGroup.position.set(0, 0, 8);
scene.add(playerGroup);

let currentMode = 'MUSEUM';
const keys = {};
window.addEventListener('keydown', (e) => keys[e.code] = true);
window.addEventListener('keyup', (e) => keys[e.code] = false);

const btnView = document.getElementById('btn-view');
const btnBack = document.getElementById('btn-back');
const fadeOverlay = document.getElementById('fade-overlay');

let activeDetailId = null;

btnView.onclick = () => {
    if (activeDetailId) switchScene(activeDetailId);
};
btnBack.onclick = () => switchScene('MUSEUM');

// --- LÓGICA DE LA PANTALLA DE INICIO (LANDING PAGE) ---
const landingPage = document.getElementById('landing-page');
const btnStart = document.getElementById('btn-start');
const btnHow = document.getElementById('btn-how');
const navModal = document.getElementById('nav-modal');
const btnCloseModal = document.getElementById('btn-close-modal');

// Comenzar el recorrido
btnStart.onclick = () => {
    landingPage.classList.add('hidden');
    // Reiniciar posición por si acaso
    playerGroup.position.set(0, 0, 8);
};

// Mostrar cómo navegar
btnHow.onclick = () => {
    navModal.classList.remove('hidden');
};

// Cerrar modal
btnCloseModal.onclick = () => {
    navModal.classList.add('hidden');
};

function switchScene(targetId) {
    fadeOverlay.classList.add('active');
    setTimeout(() => {
        // Ocultar todos los paneles
        document.querySelectorAll('.detail-panel').forEach(p => p.classList.add('hidden'));

        if (targetId && targetId !== 'MUSEUM') {
            currentMode = 'DETAIL_ROOM';
            btnBack.classList.remove('hidden');
            document.getElementById('btn-viewer-link').classList.add('hidden'); // Ocultar visor 3D en módulos
            const targetPanel = document.getElementById(targetId);
            if (targetPanel) targetPanel.classList.remove('hidden');

            document.getElementById('info-overlay').classList.add('hidden');
            document.getElementById('view-prompt').classList.add('hidden');
        } else {
            currentMode = 'MUSEUM';
            btnBack.classList.add('hidden');
            document.getElementById('btn-viewer-link').classList.remove('hidden'); // Mostrar visor 3D en sala principal
        }
        fadeOverlay.classList.remove('active');
    }, 600);
}

function update() {
    if (currentMode === 'MUSEUM') {
        let dx = 0, dz = 0;
        if (keys['ArrowUp'] || keys['KeyW']) dz -= 0.12;
        if (keys['ArrowDown'] || keys['KeyS']) dz += 0.12;
        if (keys['ArrowLeft'] || keys['KeyA']) dx -= 0.12;
        if (keys['ArrowRight'] || keys['KeyD']) dx += 0.12;

        playerGroup.position.x = Math.max(-8.5, Math.min(8.5, playerGroup.position.x + dx));
        playerGroup.position.z = Math.max(-8.5, Math.min(8.5, playerGroup.position.z + dz));

        const rainbowHue = (Date.now() % 5000) / 5000; // Ciclo de 5 segundos
        const rainbowColor = new THREE.Color().setHSL(rainbowHue, 1, 0.5);

        let nearAny = false, nearCenter = false;
        stations.forEach(s => {
            const dist = new THREE.Vector2(playerGroup.position.x, playerGroup.position.z).distanceTo(new THREE.Vector2(s.position.x, s.position.z));
            if (dist < 2.5) {
                nearAny = true;
                if (s.userData.hasDetail) {
                    nearCenter = true; // reusing this flag to show VER button
                    activeDetailId = s.userData.detailId;
                }
                document.getElementById('station-title').innerText = s.userData.title;
                document.getElementById('station-text').innerText = s.userData.text;

                // Brillo Arcoíris Dinámico
                s.userData.baseLight.material.emissiveIntensity = THREE.MathUtils.lerp(s.userData.baseLight.material.emissiveIntensity, 4, 0.1);
                s.userData.baseLight.material.emissive.lerp(rainbowColor, 0.1);

                // Sincronizar jugador
                playerBody.material.emissive.lerp(rainbowColor, 0.1);

                // Cambiar color del objeto que gira (cubito/arte)
                if (s.userData.art) {
                    s.userData.art.rotation.y += 0.02;
                    s.userData.art.traverse(child => {
                        if (child.isMesh && child.material.emissive) {
                            child.material.emissive.lerp(rainbowColor, 0.1);
                        }
                    });
                }
            } else {
                s.userData.baseLight.material.emissiveIntensity = THREE.MathUtils.lerp(s.userData.baseLight.material.emissiveIntensity, 0, 0.1);

                // Resetear color del objeto cuando el jugador se aleja
                if (s.userData.art) {
                    s.userData.art.traverse(child => {
                        if (child.isMesh && child.material.emissive) {
                            // Volver al rojito original (o negro si es central)
                            const baseEmissive = s.userData.isCentral ? new THREE.Color(0x000000) : new THREE.Color(0xff6666);
                            child.material.emissive.lerp(baseEmissive, 0.05);
                        }
                    });
                }
            }
        });

        // Si no está cerca de nada, el jugador vuelve a su color rojito original suavemente
        if (!nearAny) {
            playerBody.material.emissive.lerp(new THREE.Color(0xff6666), 0.05);
        }

        if (nearAny) document.getElementById('info-overlay').classList.remove('hidden');
        else document.getElementById('info-overlay').classList.add('hidden');
        if (nearCenter) document.getElementById('view-prompt').classList.remove('hidden');
        else document.getElementById('view-prompt').classList.add('hidden');

    } else {
        if (modelDetailRoom) modelDetailRoom.rotation.y += 0.01;
    }
}

function animate() {
    requestAnimationFrame(animate);
    update();
    renderer.render(currentMode === 'MUSEUM' ? scene : sceneDetail, currentMode === 'MUSEUM' ? camera : cameraDetail);
}

window.addEventListener('resize', () => {
    const a = window.innerWidth / window.innerHeight;
    camera.left = -d * a; camera.right = d * a; camera.updateProjectionMatrix();
    cameraDetail.aspect = a; cameraDetail.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Inicialización: Asegurar que todo esté oculto
document.querySelectorAll('.detail-panel').forEach(p => p.classList.add('hidden'));

// Interacción de Tarjetas de Tecnología (Glow que sigue al mouse)
document.addEventListener('mousemove', (e) => {
    document.querySelectorAll('.tech-card, .confeccion-card, .tech-chip').forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mouse-x', `${x}%`);
        card.style.setProperty('--mouse-y', `${y}%`);
    });
});

// Selector de Módulo 3 (Efecto Negativo)
const mod3Panel = document.getElementById('modulo-3-detail');
if (mod3Panel) {
    mod3Panel.addEventListener('scroll', () => {
        const scrollPercent = mod3Panel.scrollTop / (mod3Panel.scrollHeight - mod3Panel.clientHeight);
        if (scrollPercent > 0.45) {
            mod3Panel.classList.add('inverted-theme');
        } else {
            mod3Panel.classList.remove('inverted-theme');
        }
    });
}

// Selector de Módulo 4
const mod4Panel = document.getElementById('modulo-4-detail');
const hViewport = mod4Panel ? mod4Panel.querySelector('.h-scroll-viewport') : null;

// Convertir Scroll Vertical a Horizontal en Módulo 4 + Color Shift
if (mod4Panel && hViewport) {
    mod4Panel.addEventListener('wheel', (e) => {
        e.preventDefault();
        hViewport.scrollLeft += e.deltaY;

        // Lógica de Color Shift
        const maxScroll = hViewport.scrollWidth - hViewport.clientWidth;
        const scrollPercent = hViewport.scrollLeft / maxScroll;

        // Mapear scroll a hue (0 a 360 grados) o colores específicos
        // Vamos a usar una transición entre Azul -> Violeta -> Rosa -> Verde
        const hue = 180 + (scrollPercent * 180); // Empieza en cian (180)
        mod4Panel.style.setProperty('--mod4-color', `hsl(${hue}, 100%, 50%)`);

        // Cambiar fondo ligeramente
        const bgOpacity = 0.95 + (scrollPercent * 0.05);
        mod4Panel.style.background = `rgba(0, 0, 0, ${bgOpacity})`;
    }, { passive: false });
}

animate();
