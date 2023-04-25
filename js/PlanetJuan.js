import Planet from './Planet.js';
import ThreeD from './ThreeD.js';

class PlanetJuan extends Planet {

    #camera;
    #planetRadius;

    constructor(settings) {

        // configure default settings
        const {
            radius = 1,
            parent = document.body
        } = settings;
        super({
            parent,
            width: window.innerWidth,
            height: window.innerHeight,
            radius
        });

        // planet radius
        this.#planetRadius = radius;

        // add elements to the scene
        this.#addCamera();
        this.setMainCamera(this.#camera);
        this.#addSatellites(settings);
        this.#addAstronaut();
        this.#addLight();

        // start animation
        this.animate();

        // let the user drag the planet and pinch to zoom
        this.activateDrag();

        // let the user zoom with the mouse wheel
        this.#activateWheelZoom();

        // resize the canvas when the window is resized
        this.#resize();

        // activate click on the astronaut and satellites
        this.#onClick();

    }

    changeSatelliteMat(satelliteID) {
        this.satelliteClicked({
            satelliteID: satelliteID,
            color: 0x00DFFC,
            intensity: 0.5,
            metalness: 0.2
        });
    }


    // private methods


    #addCamera() {
        this.#camera = super.addCamera({
            fov: 75,
            aspect: window.innerWidth / window.innerHeight,
            near: 0.1,
            far: 1000,
            position: { x: 0, y: 0, z: this.#planetRadius * 2.5 },
            minZ: this.#planetRadius * 2,
            maxZ: this.#planetRadius * 3.8
        });
    }

    #addSatellites(settings) {
        const {
            satellites = [],
        } = settings;
        const sphereGeometry = ThreeD.getSphereGeometry({
            radius: this.#planetRadius * 0.09,
            widthSegments: 20,
            heightSegments: 20
        });
        super.addSatellites({
            satellites,
            planetRadius: this.#planetRadius * 1.25,
            minDistance: this.#planetRadius * 0.5,
            geometry: sphereGeometry,
            rotate: false,
            iconSize: this.#planetRadius * 0.12,
            iconPosition: [0, this.#planetRadius * 0.175, 0]
        });
    }

    #addAstronaut() {
        super.addAstronaut({
            minDistance: this.#planetRadius * 0.5,
            planetRadius: this.#planetRadius
        });
    }

    #addLight() {
        super.addLight({});
    }

    #activateWheelZoom() {
        super.activateWheelZoom(
            this.#camera,
            0.001
        );
    }

    #resize() {
        this.#positionCamera();
        window.addEventListener('resize', () => {
            super.resize(
                window.innerWidth,
                window.innerHeight
            );
            this.#positionCamera();
        });
        window.addEventListener('orientationchange', () => {
            super.resize(
                window.innerWidth,
                window.innerHeight
            );
            this.#positionCamera();
        });
    }

    #positionCamera() {
        if (window.innerWidth < 400) {
            this.#camera.position.z = this.#planetRadius * 3.4;
        } else if (window.innerWidth < 600) {
            this.#camera.position.z = this.#planetRadius * 3;
        } else {
            this.#camera.position.z = this.#planetRadius * 2.5;
        }
    }

    #onClick() {
        document.addEventListener('click', (e) => {
            this.#satellitesClicked(e);
            this.#astronautClicked(e);
        });
    }

    #satellitesClicked(event) {
        const mouse = this.getMousePosition(event);
        const contact = this.testSatelliteContact(
            this.#camera,
            mouse,
            this.#planetRadius * 0.42 // max distance behind the planet to be considered a contact
        );
        if (contact !== false) {
            this.changeSatelliteMat(contact.id);
            const canvas = this.getCanvas();
            const event = new CustomEvent('satelliteClicked', {
                detail: contact
            });
            canvas.dispatchEvent(event);
        }
    }

    #astronautClicked(event) {
        const mouse = this.getMousePosition(event);
        const contact = this.testAstronautContact(
            this.#camera,
            mouse,
            this.#planetRadius * 0.27 // max distance behind the planet to be considered a contact
        );
        if (contact !== false) {
            const canvas = this.getCanvas();
            const event = new CustomEvent('astronautClicked');
            canvas.dispatchEvent(event);
        }
    }

}

export default PlanetJuan;