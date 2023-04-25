import starImage from '../images/star.svg';
import touchDistance from './helpers/touchDistance';

class UserInterface {

    #loadingScreen;
    #phrasesContainer;
    #page;
    #projectContent;
    #profileContent;
    #lastTouchDistance = 0;
    #lastTouchPositions = [];
    #lastTranslate = {};
    #imageClass = 'project-image';

    constructor(settings) {

        const {
            loadingScreen,
            phrasesContainer,
            m = null,
            page = null,
            hidePageBtn = null,
            projectContent = null,
            profileContent = null,
            profileBtn = null
        } = settings;

        // set dom elements
        this.#loadingScreen = loadingScreen;
        this.#phrasesContainer = phrasesContainer;
        this.#page = page;
        this.#projectContent = projectContent;
        this.#profileContent = profileContent;

        // setup m address
        if (m) this.#convertM(m);

        // setup events
        if (hidePageBtn) {
            this.#hidePageEvent(hidePageBtn);
        }
        if (profileBtn) {
            this.#profileBtnEvent(profileBtn);
        }
        
        // set up images lightbox
        this.#lightbox();

        // disable pinch zoom
        this.#disablePinchZoom();

    }

    
    // public methods


    startLoading() {
        this.#loadingScreen.classList.remove('hidden');
    }

    stopLoading() {
        this.#loadingScreen.classList.add('hidden');
    }

    showPage(altAnimation = false) {
        this.#page.classList.remove('hidden');
        if (altAnimation) {
            this.#page.classList.add('page-animation-alt');
        } else {
            this.#page.classList.add('page-animation');
        }
        setTimeout(() => {
            this.#page.classList.remove('page-animation');
            this.#page.classList.remove('page-animation-alt');
        }, 1000);
    }

    hidePage() {
        this.movePageToTop();
        this.#page.classList.add('hidden');
        this.#page.classList.remove('page-animation');
        // dispatch event
        const event = new CustomEvent('pageHidden');
        document.dispatchEvent(event);
    }

    showProfile(altAnimation = false) {
        this.#profileContent.classList.remove('hidden');
        this.#projectContent.classList.add('hidden');
        this.showPage(altAnimation);
        // dispatch event
        const event = new CustomEvent('profileShown');
        document.dispatchEvent(event);
    }

    showProject(projectObj) {
        const html = this.#objToProjectHtml(projectObj);
        this.#projectContent.innerHTML = '';
        for (let i = 0; i < html.length; i++) {
            this.#projectContent.appendChild(html[i]);
        }
        this.#profileContent.classList.add('hidden');
        this.#projectContent.classList.remove('hidden');
        this.showPage();
    }

    startPhrases(phraseIndex = 0) {

        const phrases = this.#phrasesContainer.children;
        for (let i = 0; i < phrases.length; i++) {
            phrases[i].classList.add('hidden');
        }

        phrases[phraseIndex].classList.remove('hidden');

        this.#typeWriter(
            phrases[phraseIndex],
            phrases[phraseIndex].innerHTML,
            0,
            () => {
                if (phraseIndex < phrases.length - 1) {
                    this.startPhrases(phraseIndex + 1);
                } else {
                    this.startPhrases(0);
                }
            }
        );

    }


    movePageToTop() {
        this.#page.firstElementChild.scrollIntoView({
            behavior: 'instant',
            block: 'start'
        });
    }


    // private methods


    #disablePinchZoom() {
        document.addEventListener('touchstart', e => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    #profileBtnEvent(profileBtn) {
        for (let i = 0; i < profileBtn.length; i++) {
            profileBtn[i].addEventListener('click', e => {
                e.preventDefault();
                const altAnim = profileBtn[i].getAttribute('data-alt-anim');
                if (altAnim) {
                    this.showProfile(true);
                    return;
                }
                this.showProfile();
            });
        }
    }

    #hidePageEvent(hidePageBtn) {
        for (let i = 0; i < hidePageBtn.length; i++) {
            hidePageBtn[i].addEventListener('click', e => {
                e.preventDefault();
                this.hidePage();
            });
        }
    }

    #convertM(m) { 
        const elements = document.querySelectorAll('[data-m="true"]');
        const mTo = 'mailto:' + m;
        for (let i = 0; i < elements.length; i++) {
            elements[i].addEventListener('click', e => {
                if (elements[i].href !== mTo) {
                    e.preventDefault();
                    const span = elements[i].querySelector('span');
                    span.innerHTML = m;
                    elements[i].href = mTo;
                }
            });
        }
    }

    #typeWriter(element, text, i = 0, fnCallback) {
        if (i < (text.length)) {
            element.innerHTML = text.substring(0, i+1);
            setTimeout(() => {
                this.#typeWriter(element, text, i + 1, fnCallback)
            }, 100);

        } else if (typeof fnCallback == 'function') {
            setTimeout(fnCallback, 3000);
        }
    }

    #objToProjectHtml(obj) {

        // columns
        const col1 = document.createElement('div');
        col1.classList.add('project-col-1');
        const col2 = document.createElement('div');
        col2.classList.add('project-col-2');

        // title
        const titleContainer = document.createElement('div');
        titleContainer.classList.add('project-text');
        const titleWithIcon = document.createElement('div');
        titleWithIcon.classList.add('title-icon');
        const titleIconImg = document.createElement('img');
        titleIconImg.src = starImage;
        titleIconImg.alt = obj.title;
        const titleText = document.createElement('h1');
        titleText.innerHTML = obj.title;
        titleWithIcon.appendChild(titleIconImg);
        titleWithIcon.appendChild(titleText);
        titleContainer.appendChild(titleWithIcon);
        col1.appendChild(titleContainer);

        // loop through paragraphs
        for (let i = 0; i < obj.text.length; i++) {
            const p = document.createElement('p');
            p.innerHTML = obj.text[i];
            titleContainer.appendChild(p);
        }

        // images
        for (let i = 0; i < obj.images.length; i++) {
            const img = document.createElement('img');
            img.classList.add(this.#imageClass);
            img.src = obj.images[i].src;
            img.alt = obj.images[i].alt;
            // odd to col1 and even to col2
            if (i === 0) {
                col2.appendChild(img);
            } else if (i % 2 === 0) {
                col1.appendChild(img);
            } else {
                col2.appendChild(img);
            }
        }

        // close elements
        let html = [];
        html.push(col1);
        html.push(col2);

        return html;

    }

    #lightbox() {
        this.#page.addEventListener('click', e => {
            if (e.target.classList.contains(this.#imageClass)) {
                // container
                const container = document.createElement('div');
                container.classList.add('lightbox');
                // image
                const img = document.createElement('img');
                img.src = e.target.src;
                img.alt = e.target.alt;
                container.appendChild(img);
                // close button
                const closeBtn = document.createElement('div');
                closeBtn.classList.add('close-btn');
                closeBtn.innerHTML = 'X';
                container.appendChild(closeBtn);
                this.#page.appendChild(container);
                // interation
                this.#lightboxInteraction(container);
                closeBtn.addEventListener('click', e => {
                    container.removeEventListener('touchstart', e => {});
                    container.removeEventListener('touchmove', e => {});
                    container.removeEventListener('touchend', e => {});
                    container.remove();
                });
            }
        });
    }

    #lightboxInteraction(container) {
        container.addEventListener('touchstart', e => {
            if (e.touches.length == 2) {
                this.#lastTouchDistance = touchDistance(
                    e.touches[0],
                    e.touches[1]
                );
                this.#lastTouchPositions = [
                    e.touches[0],
                    e.touches[1]
                ];
            }
        });
        container.addEventListener('touchmove', e => {
            if (e.touches.length == 2) {
                // pinch to zoom
                const newTouchDistance = touchDistance(
                    e.touches[0],
                    e.touches[1]
                );
                const scale = newTouchDistance / this.#lastTouchDistance;
                const img = container.querySelector('img');
                // drag to move
                const newTouchPositions = [
                    e.touches[0],
                    e.touches[1]
                ];
                const x = newTouchPositions[0].clientX - this.#lastTouchPositions[0].clientX;
                const y = newTouchPositions[0].clientY - this.#lastTouchPositions[0].clientY;
                this.#lastTranslate.x = this.#lastTranslate.x || 0;
                this.#lastTranslate.y = this.#lastTranslate.y || 0;
                this.#lastTranslate.x += x;
                this.#lastTranslate.y += y;
                img.style.transform = `translate(${this.#lastTranslate.x}px, ${this.#lastTranslate.y}px) scale(${scale})`;
                this.#lastTouchPositions = newTouchPositions;
            }
        });
        container.addEventListener('touchend', e => {
            if (e.touches.length == 1) {
                this.#lastTouchDistance = 0;
                this.#lastTouchPositions = [];
                this.#lastTranslate = {};
                const img = container.querySelector('img');
                img.style.transform = '';
            }
        });
    }

}

export default UserInterface;