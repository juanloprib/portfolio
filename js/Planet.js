// three js
import * as THREE from 'three';
import ThreeD from './ThreeD.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// background
import stars from '../images/bg.jpg';

// astronaut
import astronaut from '../3d/astronaut/astronaut.gltf';

// marble material
import marbleColor from '../images/marble/color.jpg';
import marbleAmbient from '../images/marble/ambient.jpg';
import marbleNormal from '../images/marble/normal.jpg';
import marbleDisplacement from '../images/marble/displacement.png';
import marbleRoughness from '../images/marble/roughness.jpg';

// sand material
import sandColor from '../images/sand/color-min.jpg';
import sandAmbient from '../images/sand/ambient-min.jpg';
import sandNormal from '../images/sand/normal-min.jpg';
import sandDisplacement from '../images/sand/displacement-min.jpg';
import sandMetal from '../images/sand/specularity.png';

// helpers
import touchDistance from './helpers/touchDistance.js';


class Planet extends ThreeD {

    #canvas;
    #scene;
    #raycaster;
    #isDragging;
    #lastMouseX;
    #lastMouseY;
    #lastRotationX;
    #lastRotationY;
    #pinchDistance;
    #camera;
    #planet;
    #planetRadius = 1;
    #satellites = [];
    #astronaut;
    
    
    constructor(settings) {
        settings.bgImage = stars;
        super(settings);
        this.#canvas = this.getCanvas();
        this.#scene = this.getScene();
        this.#raycaster = new THREE.Raycaster();
        this.#createPlanet(settings);
    }


    // public methods


    addSatellites(settings) {

        const radius = this.#planetRadius;
        const {
            satellites = [],
            planetRadius = radius,
            minDistance = 0.2,
            geometry = new THREE.BoxGeometry(
                0.05,
                0.05,
                0.05
            ),
            rotate = true,
            iconSize = 0.1,
            iconPosition = [0, 0.16, 0]
        } = settings;

        // material
        const satelliteMaterial = this.#getMarbleMaterial();
        const satellite = new THREE.Mesh(geometry, satelliteMaterial);
        satellite.castShadow = true;
        satellite.receiveShadow = true;

        // position instances on the surface of the planet randomly
        for (let i = 0; i < satellites.length; i++) {
            const satelliteInstance = satellite.clone();

            // position the satellite
            const randomPoint = ThreeD.sphereRandomPointNotClose({
                sphereRadius: planetRadius,
                minDistance,
                objects: this.#satellites
            });

            // rotate the satellites (useful for non-spherical objects)
            if (rotate) {
                const normal = new THREE.Vector3().copy(randomPoint).normalize();
                const rotation = new THREE.Matrix4().lookAt(
                    new THREE.Vector3(),
                    normal,
                    satellite.up
                );
                satelliteInstance.quaternion.setFromRotationMatrix(rotation);
            }

            // position the satellite
            satelliteInstance.position.copy(randomPoint);
            this.#satellites.push(satelliteInstance);
            this.#planet.add(satelliteInstance);

            // add satellite icon
            const iconTexture = new THREE.TextureLoader().load(
                satellites[i].icon
            );
            const iconMaterial = new THREE.SpriteMaterial({
                map: iconTexture
            });
            const icon = new THREE.Sprite(iconMaterial);
            icon.scale.set(
                iconSize,
                iconSize,
                iconSize
            );
            icon.position.set(
                iconPosition[0],
                iconPosition[1],
                iconPosition[2]
            );
            satelliteInstance.add(icon);

            // add custom data to the satellite instance
            satelliteInstance.customData = {
                id: i,
                ...satellites[i]
            };

        }

        return this.#satellites;

    }

    addAstronaut(settings) {

        const {
            minDistance = 0.1,
            planetRadius = this.#planetRadius
        } = settings;

        // load astronaut
        this.addToTotalLoads(1);
        const loader = new GLTFLoader();
        loader.load(
            astronaut,
            (object) => {

                // scale
                const scale = 0.06;
                object.scene.scale.set(scale, scale, scale);

                // position
                const randomPoint = ThreeD.sphereRandomPointNotClose({
                    sphereRadius: planetRadius,
                    minDistance,
                    objects: this.#satellites
                });
                object.scene.position.copy(randomPoint);
                const direction = new THREE.Vector3()
                    .copy(randomPoint)
                    .normalize()
                    .negate();
                object.scene.lookAt(direction);
                let angleInDegrees = -90;
                let angleInRadians = angleInDegrees * (Math.PI / 180);
                object.scene.rotateOnAxis(
                    new THREE.Vector3(1, 0, 0), angleInRadians
                );
                angleInDegrees = 180;
                angleInRadians = angleInDegrees * (Math.PI / 180);
                object.scene.rotateOnAxis(
                    new THREE.Vector3(0, 1, 0), angleInRadians
                );
                this.#planet.add(object.scene);

                // cast and receive shadows
                object.scene.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                // add emmisive light
                object.scene.traverse((child) => {
                    if (child.isMesh && child.name !== 'Glass') {
                        child.material.emissive = new THREE.Color(0xFFFFFF);
                        child.material.emissiveIntensity = 0.15;
                    }
                });
                
                // add animation
                const mixer = new THREE.AnimationMixer(object.scene);
                const action = mixer.clipAction(object.animations[0]);
                this.addMixer(mixer);
                action.play();

                // set astronaut
                this.#astronaut = object.scene;

                // inform that astronaut has been loaded
                this.elementLoaded();

            },
            undefined,
            (error) => {
                console.error(error);
            }
        );
    }

    animate(cb = () => {}) {
        super.animate(() => {
            this.#planet.rotation.y += 0.001;
            if (typeof cb === 'function') {
                cb();
            }
        });
    }

    activateDrag() {
        this.#canvas.addEventListener('mousedown', this.#onDragDown.bind(this));
        this.#canvas.addEventListener('mouseup', this.#onDragUp.bind(this));
        this.#canvas.addEventListener('mousemove', this.#onDragMove.bind(this));
        this.#canvas.addEventListener('touchstart', this.#onDragDown.bind(this));
        this.#canvas.addEventListener('touchend', this.#onDragUp.bind(this));
        this.#canvas.addEventListener('touchmove', this.#onDragMove.bind(this));
    }

    testSatelliteContact(camera, mouse, maxDistance) {
        const distance = this.#planet.position.distanceTo(camera.position);
        maxDistance = maxDistance + distance;
        this.#raycaster.setFromCamera(mouse, camera);
        const intersects = this.#raycaster.intersectObjects(
            this.#satellites
        );
        if (intersects.length > 0) {
            if (intersects[0].distance < maxDistance) {
                return intersects[0].object.customData;
            }
        }
        return false;
    }

    testAstronautContact(camera, mouse, maxDistance) {
        const distance = this.#planet.position.distanceTo(camera.position);
        maxDistance = maxDistance + distance;
        this.#raycaster.setFromCamera(mouse, camera);
        const intersects = this.#raycaster.intersectObjects(
            [this.#astronaut]
        );
        if (intersects.length > 0) {
            if (intersects[0].distance < maxDistance) {
                return true;
            }
        }
        return false;
    }
        

    satelliteClicked(settings) {
        const {
            satelliteID,
            color = 0xFFFFFF,
            intensity = 0.5,
            metalness = 0.2
        } = settings;
        const satellite = this.#satellites[satelliteID];
        const material = satellite.material.clone();
        satellite.material = material;
        satellite.material.emissive.set(color);
        satellite.material.emissiveIntensity = intensity;
        satellite.material.metalness = metalness;
    }

    setMainCamera(camera) {
        this.#camera = camera;
    }


    // private methods


    #createPlanet(settings) {
        const {
            radius = this.#planetRadius,
            widthSegments = 64,
            heightSegments = 64
        } = settings;
        const geometry = new THREE.SphereGeometry(
            radius,
            widthSegments,
            heightSegments
        );
        const material = this.#getSandMaterial();
        this.#planet = new THREE.Mesh(geometry, material);
        this.#planet.castShadow = true;
        this.#planet.receiveShadow = true;
        this.#scene.add(this.#planet);
        return this.#planet;
    }

    #getSandMaterial() {
        const repeat = {x: 5, y: 5};
        return this.createStandardMaterial({
            map: sandColor,
            mapRepeat: repeat,
            aoMap: sandAmbient,
            aoRepeat: repeat,
            normalMap: sandNormal,
            normalRepeat: repeat,
            metalnessMap: sandMetal,
            metalnessRepeat: repeat,
            displacementMap: sandDisplacement,
            displacementRepeat: repeat,
            displacementScale: 0.01,
            aoMapIntensity: 0,
            roughness: 0.5,
            metalness: 0,
            emissive: 0x9781C1,
            emissiveIntensity: 0.1
        });
    }

    #getMarbleMaterial() {
        return this.createStandardMaterial({
            map: marbleColor,
            aoMap: marbleAmbient,
            normalMap: marbleNormal,
            roughnessMap: marbleRoughness,
            displacementMap: marbleDisplacement,
            displacementScale: 0.01,
            aoMapIntensity: 0,
            roughness: 0.5,
            metalness: 0,
            emissive: 0x9A6EFD,
            emissiveIntensity: 0.4
        });
    }

    #onDragDown(event) {
        // drag to rotate planet
        this.#isDragging = true;
        this.#lastMouseX = event.clientX;
        this.#lastMouseY = event.clientY;
        if (event.touches && event.touches.length > 0) {
            this.#lastMouseX = event.touches[0].clientX;
            this.#lastMouseY = event.touches[0].clientY;
        }
        this.#lastRotationX = this.#planet.rotation.x;
        this.#lastRotationY = this.#planet.rotation.y;
        // pinch to zoom
        if (event.touches && event.touches.length === 2) {
            this.#pinchDistance = touchDistance(
                event.touches[0],
                event.touches[1]
            );
        }
    }

    #onDragUp() {
        this.#isDragging = false;
        this.#pinchDistance = null;
    }

    #onDragMove(event) {

        // pinch to zoom
        if (event.touches && event.touches.length === 2) {
            const currentDistance = touchDistance(
                event.touches[0],
                event.touches[1]
            );
            const deltaDistance = currentDistance - this.#pinchDistance;
            this.cameraZ(this.#camera, -deltaDistance * 0.005);
            this.#pinchDistance = currentDistance;

        // drag to move planet
        } else if (this.#isDragging) {
            let deltaX = event.clientX - this.#lastMouseX;
            let deltaY = event.clientY - this.#lastMouseY;
            if (event.touches && event.touches.length > 0) {
                deltaX = event.touches[0].clientX - this.#lastMouseX;
                deltaY = event.touches[0].clientY - this.#lastMouseY;
            }
            this.#planet.rotation.x = this.#lastRotationX + deltaY * 0.004;
            this.#planet.rotation.y = this.#lastRotationY + deltaX * 0.004;
        }

    }


}

export default Planet;