class Router {

    #pathSections = [];
    #profilePath;

    constructor(settings) {

        // initial settings
        const {
            profilePath = 'profile'
        } = settings;
        this.#profilePath = profilePath;
        this.parsePath(window.location.pathname);
        this.#visitPath(
            this.#replaceSlashes(window.location.pathname)
        );

    }
    

    // public methods


    getPathSections() {
        return this.#pathSections;
    }

    isProfile() {
        return this.#pathSections[0] === this.#profilePath;
    }

    setProfile() {
        this.setHistory(this.#profilePath);
    }

    setHistory(path) {
        let actualPath = window.location.pathname;
        actualPath = this.#replaceSlashes(actualPath);
        if (actualPath === path) {
            return;
        }
        window.history.pushState(
            {path: path},
            '',
            path
        );
        this.#visitPath(path);
    }

    parsePath(path) {
        path = this.#replaceSlashes(path);
        this.#pathSections = path.split('/');
        return this.#pathSections;
    }

    getVisitedPaths() {
        if (localStorage.getItem('visited') === null) {
            return null;
        }
        return JSON.parse(
            localStorage.getItem('visited')
        );
    }


    // private methods

    #replaceSlashes(path) {
        return path.replace(/^\/|\/$/g, '');
    }

    #visitPath(path) {
        const visitedPaths = JSON.parse(
            localStorage.getItem('visited')
        );
        if (visitedPaths === null) {
            localStorage.setItem(
                'visited',
                JSON.stringify([path])
            );
        } else if (!visitedPaths.includes(path)) {
            visitedPaths.push(path);
            localStorage.setItem(
                'visited',
                JSON.stringify(visitedPaths)
            );
        }
    }

}

export default Router;