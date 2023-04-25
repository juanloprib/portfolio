'use strict';


import UserInterface from './UserInterface.js';
import PlanetJuan from './PlanetJuan.js';
import Projects from './Projects.js';
import Router from './Router.js';


(async function() {


    // intiailize ui
    const ui = new UserInterface({
        loadingScreen: document.getElementById('loading'),
        phrasesContainer: document.getElementById('phrases'),
        page: document.getElementById('page'),
        hidePageBtn: document.querySelectorAll('.hide-page'),
        profileBtn: document.querySelectorAll('.show-profile'),
        projectContent: document.getElementById('project'),
        profileContent: document.getElementById('profile'),
        m: "juan" + "@" + "sapote" + "." + "co"
    });
    ui.startLoading();


    // initialize projects
    const projects = new Projects();


    // initialize planet
    const planetJuan = new PlanetJuan({
        satellites: projects.getProjects(),
        parent: document.getElementById('space')
    });


    // stop loading screen when all elements are loaded
    const canvas = planetJuan.getCanvas();
    canvas.addEventListener("allElementsLoaded", () => {
        ui.startPhrases();
        ui.stopLoading();
    });


    // astronaut click
    canvas.addEventListener("astronautClicked", () => {
        ui.showProfile();
    });


    // satellite click
    canvas.addEventListener("satelliteClicked", async (e) => {
        const project = await projects.getProjectByIndex(
            e.detail.id
        );
        router.setHistory(e.detail.name);
        ui.showProject(project);
    });


    // initialize router
    const router = new Router({
        profilePath: 'me'
    });


    // load profile if url is profile
    if (router.isProfile()) {
        ui.showProfile();
    }


    // load project if url is project
    const projectsNames = projects.getProjectsNames();
    const pathSections = router.getPathSections();
    if (projectsNames.includes(pathSections[0])) {
        const project = await projects.getProjectByName(
            router.getPathSections()[0]
        );
        ui.showProject(project);
        planetJuan.changeSatelliteMat(project.index);
    }


    // change url if profile is shown
    document.addEventListener('profileShown', () => {
        router.setProfile();
    });


    // change url if page is hidden
    document.addEventListener('pageHidden', () => {
        router.setHistory('/');
    });


    // browser's back button
    window.addEventListener('popstate', async e => {
        router.parsePath(window.location.pathname);
        if (router.isProfile()) {
            ui.showProfile();
        } else if (projectsNames.includes(router.getPathSections()[0])) {
            const project = await projects.getProjectByName(
                router.getPathSections()[0]
            );
            ui.showProject(project);
        } else {
            ui.hidePage();
        }
    });


    // change the material of the visited satellites
    const visitedPaths = router.getVisitedPaths();
    if (visitedPaths) {
        visitedPaths.forEach(async path => {
            if (projectsNames.includes(path)) {
                const project = await projects.getProjectByName(path);
                planetJuan.changeSatelliteMat(project.index);
            }
        });
    }


    // show stats
    // planetJuan.showStats(true);


})();