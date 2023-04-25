# The world of Juan Lopera

This app shows my portfolio as a full-stack developer and creative entrepreneur. You can find it at [juanlopera.com](https://juanlopera.com/). I have decided to make it public so that you can see my code. I hope you like it!

In this README file contains the following information:

- [Why a 3D planet?](#why-a-3d-planet)
- [Installation](#installation)
- [Technologies](#technologies)
- [OOP](#oop)
- [About SEO](#about-seo)

## Why a 3D planet?

I have always thought that each project is a unique world. That is why I have decided to create a 3D planet surrounded by satellites. Each satellite represents one of my highlighted projects. When you click on a satellite, you will be able to see the project in detail. If you click on the astronaut, you will be able to see more information about me.

## Installation

To install this app, follow these steps:

1. Fork and clone this repository.
2. Run `npm install` to install the dependencies.
3. Run `npx vite` to start the development server.

Once you make all the necessary changes, you can run `npx vite build` to generate the production files in the `dist` folder.

## Technologies

This project has been developed with the following technologies:

- [Vite](https://vitejs.dev/)
- [Three.js](https://threejs.org/)
- Vanilla JavaScript
- CSS
- HTML

## OOP

This project has been developed using Object Oriented Programming (OOP) principles. The code is divided objects that interact with each other. The main file where all the objects are instantiated and interact is `js/app.js`. All the JavaScript classes files can be found inside the `js` folder.

The following are the classes that have been created:

- **ThreeD**: This class is in charge of creating the basic functionality of the 3D world. It creates the scene, the camera, the renderer, the lights, the basics of the animation, and the canvas. This object is important because it simplifies the usage of Three.js and it allows to create a 3D world in a few lines of code.
- **Planet**: This class extends the ThreeD class. It is in charge of creating the planet, the satellites, the astronaut, the materials, and the animation. It also tests when the user clicks on a satellite or on the astronaut.
- **PlanetJuan**: This class extends the Planet class. Its main job is to set the specific details of the Planet for my portfolio. If I ever want to change the size, position or other specific details of the planet, I can do it in this class.
- **UserInterface**: This class is in charge of manipulating the user interface. For instance, it can show or hide the loading animation, show the projects, or show the information about me. It also creates a lightbox to display the images of the projects. And it shows the footer messages that have a typewriter effect.
- **Router**: This app has a basic routing system. This class is in charge of showing the correct content depending on the URL. It also changes the URL when the user clicks on a satellite or on the astronaut.
- **Projects**: This class is important to get the data of the projects from the projects configuration files. Every project has its own JSON file inside the `projects` folder. Note that there is a `projects/projects.json` file that contains a list of all the projects and the path for each project's icon.

## About SEO

I created this website as a portfolio to show some projects that I am really proud of as part of my CV. But I did not create it to be found on Google. The way this app is built is not SEO friendly. All the projects are loaded in such a way that Google will have a hard time indexing them. Having said that, the about me section is SEO friendly. So most probably only the about me section will be indexed by Google. But a website with only one page is not likely to have high rankings on search engines.

But all the above is fine for me. I wanted to create a different kind of website, but most importantly, I wanted to have fun coding my portfolio. And I am really happy with the result. I hope you like it too!