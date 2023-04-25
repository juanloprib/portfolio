import projects from '../projects/projects.json';

class Projects {

    #projects = [];

    constructor() {
        this.#projects = projects;
    }

    async getProjectByIndex(projectIndex) {
        const projectName = this.#projects[projectIndex].name;
        const project = await import(`../projects/${projectName}.json`);
        const completeProject = {
            ...project,
            name: projectName
        }
        completeProject.index = projectIndex;
        return completeProject;
    }

    async getProjectByName(projectName) {
        const project = await import(`../projects/${projectName}.json`);
        const completeProject = {
            ...project,
            name: projectName
        }
        const projectIndex = this.#projects.findIndex(
            project => project.name === projectName
        );
        completeProject.index = projectIndex;
        return completeProject;
    }

    getProjects() {
        return this.#projects;
    }

    getProjectsNames() {
        return this.#projects.map(project => project.name);
    }

    getNumberOfProjects() {
        return this.#projects.length;
    }


}

export default Projects;