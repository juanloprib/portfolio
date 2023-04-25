import * as THREE from 'three';
import Stats from 'stats.js';

class ThreeD {

    #canvas;
    #scene;
    #renderer;
    #stats;
    #clock;
    #totalLoads = 0;
    #loadedElements = 0;
    #cameras = [];
    #lights = [];
    #mixers = [];
    
    constructor(settings) {
        this.#setupCanvas(settings);
        this.#setupScene();
        this.#setupBG(settings);
        this.#setupRenderer(settings);
        this.#setupClock();
    }


    // public methods


    showStats(show, panel = 0) {
        if (show) {
            this.#stats = new Stats();
            this.#stats.showPanel(panel);
            document.body.appendChild(this.#stats.dom);
            return this.#stats;
        }
        if (this.#stats) {
            document.body.removeChild(this.#stats.dom);
            this.#stats = null;
        }
        return false;
    }

    addCamera(settings) {
        const {
            fov = 75,
            aspect = window.innerWidth / window.innerHeight,
            near = 0.1,
            far = 1000,
            position = { x: 0, y: 0, z: 5 },
            minZ = 1,
            maxZ = 10
        } = settings;
        const camera = new THREE.PerspectiveCamera(
            fov,
            aspect,
            near,
            far
        );
        camera.position.set(
            position.x,
            position.y,
            position.z
        );
        camera.minZ = minZ;
        camera.maxZ = maxZ;
        this.#scene.add(camera);
        this.#cameras.push(camera);
        return camera;
    }

    addLight(settings) {
        const {
            color = 0xffffff,
            intensity = 1,
            position = { x: -3, y: 2, z: 4 }
        } = settings;
        const light = new THREE.DirectionalLight(color, intensity);
        light.target = this.#scene;
        light.position.set(
            position.x,
            position.y,
            position.z
        );
        light.castShadow = true;
        light.shadow.mapSize.width = 2048 * 2;
        light.shadow.mapSize.height = 2048 * 2;
        this.#scene.add(light);
        this.#lights.push(light);
        return light;
    }

    animate(cb = () => {}) {
        if (this.#stats) {
            this.#stats.begin();
        }
        if (typeof cb === 'function') {
            cb();
        }
        if (this.#mixers.length) {
            for(let i = 0; i < this.#mixers.length; i++) {
                this.#mixers[i].update(this.#clock.getDelta());
            }
        }
        this.#renderer.render(this.#scene, this.#cameras[0]);
        if (this.#stats) {
            this.#stats.end();
        }
        requestAnimationFrame(this.animate.bind(this));
    }

    activateWheelZoom(camera, z) {
        this.#canvas.addEventListener('wheel', (event) => {
            const { deltaY } = event;
            this.cameraZ(camera, deltaY * z);
        });
    }

    cameraZ(camera, z) {
        const pos = camera.position.z;
        const newPos = pos + z;
        if (newPos < camera.maxZ && newPos > camera.minZ) {
            camera.position.z = newPos;
        }
    }

    resize(width, height) {
        this.#canvas.width = width;
        this.#canvas.height = height;
        this.#cameras.forEach(camera => {
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        });
        this.#renderer.setSize(
            width,
            height
        );
    }

    // before loading elements:
    // use this to increment the total number of elements to load
    // then listen for the 'allElementsLoaded' event
    addToTotalLoads(elementsNumber) {
        this.#totalLoads += elementsNumber;
    }

    // call this method when an element is loaded
    elementLoaded() {
        if (this.#totalLoads === 0) {
            return;
        }
        this.#loadedElements++;
        if (this.#loadedElements >= this.#totalLoads) {
            const event = new CustomEvent('allElementsLoaded');
            this.#canvas.dispatchEvent(event);
        }
    }

    createStandardMaterial(settings) {

        let {
            map = null,
            mapRepeat = null,
            aoMap = null,
            aoRepeat = null,
            aoMapIntensity = 1,
            normalMap = null,
            normalRepeat = null,
            normalScale = new THREE.Vector2(1, 1),
            metalnessMap = null,
            metalnessRepeat = null,
            metalness = 1,
            roughnessMap = null,
            roughnessRepeat = null,
            roughness = 1,
            displacementMap = null,
            displacementRepeat = null,
            displacementScale = 1,
            emissive = 0xFFFFFF,
            emissiveIntensity = 0
        } = settings;

        if (map) {
            this.addToTotalLoads(1);
            map = new THREE.TextureLoader()
                .load(
                    map,
                    this.elementLoaded.bind(this)
                );
            if (mapRepeat) {
                map.wrapS = THREE.RepeatWrapping;
                map.wrapT = THREE.RepeatWrapping;
                map.repeat.set(mapRepeat.x, mapRepeat.y);
            }
        }
        if (aoMap) {
            this.addToTotalLoads(1);
            aoMap = new THREE.TextureLoader()
                .load(
                    aoMap,
                    this.elementLoaded.bind(this)
                );
            if (aoRepeat) {
                aoMap.wrapS = THREE.RepeatWrapping;
                aoMap.wrapT = THREE.RepeatWrapping;
                aoMap.repeat.set(aoRepeat.x, aoRepeat.y);
            }
        }
        if (normalMap) {
            this.addToTotalLoads(1);
            normalMap = new THREE.TextureLoader()
                .load(
                    normalMap,
                    this.elementLoaded.bind(this)
                );
            if (normalRepeat) {
                normalMap.wrapS = THREE.RepeatWrapping;
                normalMap.wrapT = THREE.RepeatWrapping;
                normalMap.repeat.set(normalRepeat.x, normalRepeat.y);
            }
        }
        if (metalnessMap) {
            this.addToTotalLoads(1);
            metalnessMap = new THREE.TextureLoader()
                .load(
                    metalnessMap,
                    this.elementLoaded.bind(this)
                );
            if (metalnessRepeat) {
                metalnessMap.wrapS = THREE.RepeatWrapping;
                metalnessMap.wrapT = THREE.RepeatWrapping;
                metalnessMap.repeat.set(metalnessRepeat.x, metalnessRepeat.y);
            }
        }
        if (roughnessMap) {
            this.addToTotalLoads(1);
            roughnessMap = new THREE.TextureLoader()
                .load(
                    roughnessMap,
                    this.elementLoaded.bind(this)
                );
            if (roughnessRepeat) {
                roughnessMap.wrapS = THREE.RepeatWrapping;
                roughnessMap.wrapT = THREE.RepeatWrapping;
                roughnessMap.repeat.set(roughnessRepeat.x, roughnessRepeat.y);
            }
        }
        if (displacementMap) {
            this.addToTotalLoads(1);
            displacementMap = new THREE.TextureLoader()
                .load(
                    displacementMap,
                    this.elementLoaded.bind(this)
                );
            displacementMap.wrapS = THREE.RepeatWrapping;
            displacementMap.wrapT = THREE.RepeatWrapping;
            displacementMap.repeat.set(5, 5);
        }

        return new THREE.MeshStandardMaterial({
            map,
            aoMap,
            aoMapIntensity,
            normalMap,
            normalScale,
            metalnessMap,
            metalness,
            roughnessMap,
            roughness,
            displacementMap,
            displacementScale,
            emissive,
            emissiveIntensity
        });

    }

    addMixer(mixer) {
        this.#mixers.push(mixer);
    }

    getMousePosition(event) {
        const mouse = new THREE.Vector2();
        const canvasSizeFix = new THREE.Vector2(
            this.#canvas.width / window.devicePixelRatio,
            this.#canvas.height / window.devicePixelRatio
        );
        mouse.x = (event.clientX / canvasSizeFix.x) * 2 - 1;
        mouse.y = -(event.clientY / canvasSizeFix.y) * 2 + 1;
        return mouse;
    }

    getCanvas() {
        return this.#canvas;
    }

    getScene() {
        return this.#scene;
    }

    getRenderer() {
        return this.#renderer;
    }


    // private methods


    #setupBG(settings) {
        if (settings.bgImage) {
            this.addToTotalLoads(1);
            const bgImage = new THREE.TextureLoader()
                .load(
                    settings.bgImage,
                    this.elementLoaded.bind(this)
                );
            this.#scene.background = bgImage;
        }
        if (settings.bgColor) {
            const bgColor = new THREE.Color(settings.bgColor);
            this.#scene.background = bgColor;
        }
    }

    #setupCanvas(settings) {
        const {
            backgroundColor = '#000000',
            parent = document.body,
            width = window.innerWidth,
            height = window.innerHeight,
        } = settings;
        this.#canvas = document.createElement('canvas');
        parent.appendChild(this.#canvas);
        this.#canvas.width = width,
        this.#canvas.height = height;
        this.#canvas.style.backgroundColor = backgroundColor;
    }

    #setupScene() {
        this.#scene = new THREE.Scene();
    }

    #setupRenderer(settings) {

        const {
            width = window.innerWidth,
            height = window.innerHeight,
            backgroundColor = '#000000',
            antialias = true,
        } = settings;

        this.#renderer = new THREE.WebGLRenderer({
            canvas: this.#canvas,
            antialias
        });
        this.#renderer.setClearColor(backgroundColor);
        this.#renderer.setPixelRatio(window.devicePixelRatio);
        this.#renderer.setSize(
            width,
            height
        );

        this.#renderer.shadowMap.enabled = true;
        this.#renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
    }

    #setupClock() {
        this.#clock = new THREE.Clock();
    }


    // static methods


    static getCubeGeometry(settings) {
        const {
            cubeWidth = 0.05,
            cubeHeight = 0.05,
            cubeDepth = 0.05
        } = settings;
        return new THREE.BoxGeometry(
            cubeWidth,
            cubeHeight,
            cubeDepth
        );
    }

    static getSphereGeometry(settings) {
        const {
            radius = 0.05,
            widthSegments = 8,
            heightSegments = 8
        } = settings;
        return new THREE.SphereGeometry(
            radius,
            widthSegments,
            heightSegments
        );
    }

    static getRandomPointOnSphere(radius) {
        const point = new THREE.Vector3();
        const phi = Math.random() * Math.PI * 2;
        const theta = Math.random() * Math.PI;
        point.x = radius * Math.sin(theta) * Math.cos(phi);
        point.y = radius * Math.sin(theta) * Math.sin(phi);
        point.z = radius * Math.cos(theta);
        return point;
    }

    static sphereRandomPointNotClose(settings) {
        const {
            sphereRadius = 1,
            minDistance = 0.2,
            objects = []
        } = settings;
        let randomPoint;
        let tooClose = true;
        while (tooClose) {
            randomPoint = ThreeD.getRandomPointOnSphere(
                sphereRadius
            );
            tooClose = false;
            for (let i = 0; i < objects.length; i++) {
                const distance = randomPoint.distanceTo(
                    objects[i].position
                );
                if (distance < minDistance) {
                    tooClose = true;
                    break;
                }
            }
        }
        return randomPoint;
    }


}

export default ThreeD;