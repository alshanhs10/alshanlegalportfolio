const navToggle = document.querySelector('#navToggle');
const siteNav = document.querySelector('#siteNav');
const progress = document.querySelector('#progress');

let mobileMenuHistory = false;

navToggle?.addEventListener('click', () => {
    const open = siteNav.classList.toggle('open');

    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute(
        'aria-label',
        open ? 'Close navigation' : 'Open navigation'
    );

    document.body.classList.toggle('menu-open', open);
    if (window.innerWidth <= 800) {
    if (open && !mobileMenuHistory) {
        history.pushState({ mobileMenu: true }, '', location.href);
        mobileMenuHistory = true;
    } else if (!open && mobileMenuHistory) {
        mobileMenuHistory = false;
        history.back();
    }
}
});

siteNav?.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
        siteNav.classList.remove('open');
        navToggle?.setAttribute('aria-expanded', 'false');
        navToggle?.setAttribute('aria-label', 'Open navigation');
        document.body.classList.remove('menu-open');
    })
);

window.addEventListener('popstate', () => {
    if (window.innerWidth <= 800 && mobileMenuHistory) {
        mobileMenuHistory = false;

        siteNav?.classList.remove('open');
        navToggle?.setAttribute('aria-expanded', 'false');
        navToggle?.setAttribute('aria-label', 'Open navigation');
        document.body.classList.remove('menu-open');
    }
});

window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = `${max ? (scrollY / max) * 100 : 0}%`;
}, { passive: true });

const observer = new IntersectionObserver(
    entries => entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('visible');
            observer.unobserve(e.target);
        }
    }),
    { threshold: .12 }
);

document.querySelectorAll('.reveal').forEach(e =>
    observer.observe(e)
);


/* =========================================
   PREMIUM IMAGE VIEWER
   ========================================= */

const mediaModal = document.querySelector('#mediaModal');
const modalMedia = document.querySelector('#modalMedia');
const mediaTitle = document.querySelector('#mediaModalTitle');
const mediaNote = document.querySelector('#modalNote');

document
    .querySelectorAll('.certificate-card,.honor-card,.portrait-card,.project-gallery-item,.project-recognition,.education-proof')
    .forEach(card => {

        const openMedia = () => {
            const image = card.dataset.modalImage;
            const title = card.dataset.modalTitle || 'Selected Image';

            if (!image || !mediaModal || !modalMedia) return;

            let scale = 1;
            let translateX = 0;
            let translateY = 0;

            const modalInner = modalMedia.parentElement;

            /* Remove controls from a previous image */
            modalInner
                .querySelector('.image-viewer-controls')
                ?.remove();

            modalMedia.innerHTML = '';
            mediaNote.textContent = '';
            mediaTitle.textContent = title;

            const img = document.createElement('img');

            img.src = image;
            img.alt = title;
            img.draggable = false;

            modalMedia.appendChild(img);

            /* =================================
               CONTROLS
               ================================= */

            const controls = document.createElement('div');

            controls.className = 'image-viewer-controls';

            const zoomOut = document.createElement('button');
            zoomOut.type = 'button';
            zoomOut.textContent = '−';
            zoomOut.setAttribute('aria-label', 'Zoom out');

            const zoomLevel = document.createElement('button');
            zoomLevel.type = 'button';
            zoomLevel.className = 'zoom-level';
            zoomLevel.textContent = '100%';
            zoomLevel.setAttribute('aria-label', 'Reset zoom');

            const zoomIn = document.createElement('button');
            zoomIn.type = 'button';
            zoomIn.textContent = '+';
            zoomIn.setAttribute('aria-label', 'Zoom in');

            const reset = document.createElement('button');
            reset.type = 'button';
            reset.textContent = 'Reset';
            reset.setAttribute('aria-label', 'Reset image');

            controls.append(
                zoomOut,
                zoomLevel,
                zoomIn,
                reset
            );

            /*
             * IMPORTANT:
             * Controls are appended OUTSIDE
             * the image viewing area.
             */
            modalInner.appendChild(controls);

            /* =================================
               IMAGE TRANSFORM
               ================================= */

            const updateImage = () => {

                img.style.transform =
                    `translate(${translateX}px, ${translateY}px) scale(${scale})`;

                zoomLevel.textContent =
                    `${Math.round(scale * 100)}%`;

                img.classList.toggle(
                    'is-zoomed',
                    scale > 1
                );
            };

            const resetImage = () => {

                scale = 1;
                translateX = 0;
                translateY = 0;

                updateImage();
            };

            const zoomAtPoint = (newScale, clientX, clientY) => {

    const oldScale = scale;

    newScale = Math.min(
        2,
        Math.max(1, newScale)
    );

    if (newScale === oldScale) return;

    const rect = modalMedia.getBoundingClientRect();

    const mouseX =
        clientX - (rect.left + rect.width / 2);

    const mouseY =
        clientY - (rect.top + rect.height / 2);

    const ratio =
        newScale / oldScale;

    let nextX =
        mouseX - (mouseX - translateX) * ratio;

    let nextY =
        mouseY - (mouseY - translateY) * ratio;

    scale = newScale;

    /*
     * At 100%, always return the image
     * to its original centred position.
     */
    if (scale === 1) {

        translateX = 0;
        translateY = 0;

        updateImage();
        return;
    }

    /*
     * Keep the zoomed image inside
     * the fixed viewing frame.
     */
    const maxX =
        Math.max(
            0,
            (rect.width * scale - rect.width) / 2
        );

    const maxY =
        Math.max(
            0,
            (rect.height * scale - rect.height) / 2
        );

    translateX =
        Math.max(
            -maxX,
            Math.min(maxX, nextX)
        );

    translateY =
        Math.max(
            -maxY,
            Math.min(maxY, nextY)
        );

    updateImage();
};
const changeZoom = amount => {

    const rect = modalMedia.getBoundingClientRect();

    zoomAtPoint(
        scale + amount,
        rect.left + rect.width / 2,
        rect.top + rect.height / 2
    );

};

            /* =================================
               BUTTON CONTROLS
               ================================= */

            zoomIn.addEventListener('click', event => {

                event.stopPropagation();

                changeZoom(.25);
            });

            zoomOut.addEventListener('click', event => {

                event.stopPropagation();

                changeZoom(-.25);
            });

            zoomLevel.addEventListener('click', event => {

                event.stopPropagation();

                resetImage();
            });

            reset.addEventListener('click', event => {

                event.stopPropagation();

                resetImage();
            });

            /* =================================
               MOUSE WHEEL ZOOM
               ================================= */

            modalMedia.addEventListener('wheel', event => {

                event.preventDefault();

                const amount =
                    event.deltaY < 0 ? .15 : -.15;

                zoomAtPoint(
                    scale + amount,
                    event.clientX,
                    event.clientY
                );

            }, { passive: false });

            /* =================================
               DOUBLE CLICK
               ================================= */

            img.addEventListener('dblclick', event => {

                event.preventDefault();

                if (scale === 1) {

                    zoomAtPoint(
                        2,
                        event.clientX,
                        event.clientY
                    );

                } else {

                    resetImage();
                }
            });

            /* =================================
   DRAG + PINCH ZOOM
   DESKTOP + MOBILE TOUCH SUPPORT
   ================================= */

let dragging = false;

let startX = 0;
let startY = 0;

let originX = 0;
let originY = 0;

/* Active touch / pointer positions */
const pointers = new Map();

let pinchStartDistance = 0;
let pinchStartScale = 1;

/* ---------------------------------
   POINTER DOWN
   --------------------------------- */

img.addEventListener('pointerdown', event => {

    if (
        event.pointerType === 'mouse' &&
        event.button !== 0
    ) {
        return;
    }

    pointers.set(
        event.pointerId,
        {
            x: event.clientX,
            y: event.clientY
        }
    );

    img.setPointerCapture(event.pointerId);

    /* Two fingers = PINCH MODE */

    if (pointers.size === 2) {

        dragging = false;

        img.classList.remove('is-dragging');

        const points = [...pointers.values()];

        const dx =
            points[1].x - points[0].x;

        const dy =
            points[1].y - points[0].y;

        pinchStartDistance =
            Math.hypot(dx, dy);

        pinchStartScale = scale;

        event.preventDefault();

        return;
    }

    /* One finger / mouse = DRAG MODE */

    if (scale <= 1) return;

    dragging = true;

    img.classList.add('is-dragging');

    startX = event.clientX;
    startY = event.clientY;

    originX = translateX;
    originY = translateY;

    event.preventDefault();
});


/* ---------------------------------
   POINTER MOVE
   --------------------------------- */

img.addEventListener('pointermove', event => {

    if (!pointers.has(event.pointerId)) return;

    pointers.set(
        event.pointerId,
        {
            x: event.clientX,
            y: event.clientY
        }
    );

    /* ===============================
       TWO FINGER PINCH
       =============================== */

    if (pointers.size === 2) {

        const points = [...pointers.values()];

        const dx =
            points[1].x - points[0].x;

        const dy =
            points[1].y - points[0].y;

        const distance =
            Math.hypot(dx, dy);

        if (!pinchStartDistance) return;

        const midpointX =
            (points[0].x + points[1].x) / 2;

        const midpointY =
            (points[0].y + points[1].y) / 2;

        const pinchRatio =
            distance / pinchStartDistance;

        const newScale =
            pinchStartScale * pinchRatio;

        zoomAtPoint(
            newScale,
            midpointX,
            midpointY
        );

        event.preventDefault();

        return;
    }

    /* ===============================
       ONE FINGER DRAG
       =============================== */

    if (!dragging) return;

    const rect =
        modalMedia.getBoundingClientRect();

    const maxX =
        Math.max(
            0,
            (rect.width * scale - rect.width) / 2
        );

    const maxY =
        Math.max(
            0,
            (rect.height * scale - rect.height) / 2
        );

    const nextX =
        originX +
        (event.clientX - startX);

    const nextY =
        originY +
        (event.clientY - startY);

    translateX =
        Math.max(
            -maxX,
            Math.min(maxX, nextX)
        );

    translateY =
        Math.max(
            -maxY,
            Math.min(maxY, nextY)
        );

    updateImage();

    event.preventDefault();
});


/* ---------------------------------
   POINTER UP / CANCEL
   --------------------------------- */

const stopPointer = event => {

    pointers.delete(event.pointerId);

    if (
        img.hasPointerCapture(event.pointerId)
    ) {
        img.releasePointerCapture(event.pointerId);
    }

    /* Pinch has ended */

    if (pointers.size < 2) {

        pinchStartDistance = 0;
        pinchStartScale = scale;
    }

    /* If one finger remains after pinch,
       allow it to continue dragging */

    if (
        pointers.size === 1 &&
        scale > 1
    ) {

        const remaining =
            [...pointers.values()][0];

        dragging = true;

        startX = remaining.x;
        startY = remaining.y;

        originX = translateX;
        originY = translateY;

        img.classList.add('is-dragging');

    } else {

        dragging = false;

        img.classList.remove(
            'is-dragging'
        );
    }
};

img.addEventListener(
    'pointerup',
    stopPointer
);

img.addEventListener(
    'pointercancel',
    stopPointer
);

            /* =================================
               KEYBOARD CONTROLS
               ================================= */

            const handleViewerKeys = event => {

                if (!mediaModal.open) return;

                if (
                    event.key === '+' ||
                    event.key === '='
                ) {

                    event.preventDefault();

                    changeZoom(.25);
                }

                if (
                    event.key === '-' ||
                    event.key === '_'
                ) {

                    event.preventDefault();

                    changeZoom(-.25);
                }

                if (event.key === '0') {

                    event.preventDefault();

                    resetImage();
                }
            };

            document.addEventListener(
                'keydown',
                handleViewerKeys
            );

            mediaModal.addEventListener(
                'close',
                () => {

                    document.removeEventListener(
                        'keydown',
                        handleViewerKeys
                    );

                    window.removeEventListener(
                        'mousemove',
                        handleDragging
                    );

                    window.removeEventListener(
                        'mouseup',
                        stopDragging
                    );
                },
                { once: true }
            );

            /* =================================
               IMAGE ERROR
               ================================= */

            img.addEventListener('error', () => {

                modalMedia.innerHTML = `
                    <div class="placeholder-media"
                         style="width:100%;min-height:320px">
                        <span>Add image: ${image}</span>
                    </div>
                `;
            });

            updateImage();

            mediaModal.showModal();
        };

        /* =================================
           OPEN ONLY FROM IMAGE / VIEW IMAGE
           ================================= */

        card.addEventListener('click', event => {

           const trigger = event.target.closest(
    '.honor-image,' +
    '.certificate-media,' +
    '.portrait-placeholder,' +
    '.project-gallery-item,' +
    '.project-recognition,' +
    '.education-proof,' +
    '.text-link'
);

            if (!trigger || !card.contains(trigger)) {
                return;
            }

            openMedia();
        });

        /* Keyboard accessibility */

        if (card.classList.contains('portrait-card')) {

            card.addEventListener('keydown', event => {

                if (
                    event.key === 'Enter' ||
                    event.key === ' '
                ) {

                    event.preventDefault();

                    openMedia();
                }
            });
        }
    });


/* =========================================
   PROJECT PDF VIEWER
   ========================================= */

const pdfModal = document.querySelector('#pdfModal');
const pdfFrame = document.querySelector('#pdfFrame');
const pdfTitle = document.querySelector('#pdfTitle');
const pdfFallback = document.querySelector('#pdfFallback');

document.querySelectorAll('.project-card').forEach(card => {

    const openProject = () => {
        const pdf = card.dataset.pdf;
        const title = card.dataset.title || 'Selected Work';

        if (!pdf || !pdfModal || !pdfFrame) return;

        pdfTitle.textContent = title;
        pdfFrame.src = pdf;

        if (pdfFallback) {
            pdfFallback.href = pdf;
        }

        pdfModal.showModal();
    };

    card.addEventListener('click', event => {

    /* Project cards marked as external open the PDF in a new tab. */
    if (card.classList.contains('project-external')) {

        /* Let the direct PDF link handle its own click. */
        if (event.target.closest('a')) {
            return;
        }

        window.open(card.dataset.pdf, '_blank', 'noopener,noreferrer');
        return;
    }

    /*
     * Don't open the PDF twice when the
     * "Open project PDF" button is clicked.
     */
    if (event.target.closest('.open-project')) {
        event.stopPropagation();
    }

    openProject();
});
});


/* =========================================
   MODAL CLOSE CONTROLS
   ========================================= */

document.querySelectorAll('[data-close]').forEach(button => {
    button.addEventListener('click', () => {
        button.closest('dialog')?.close();
    });
});


/* Close when clicking outside the dialog content */

[mediaModal, pdfModal].forEach(dialog => {
    dialog?.addEventListener('click', event => {
        if (event.target === dialog) {
            dialog.close();
        }
    });
});


/* Escape closes whichever modal is open */

document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
        mediaModal?.close();
        pdfModal?.close();
    }
});

/* =========================================
   ACTIVE NAVIGATION SECTION
   ========================================= */

const navLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];

const updateActiveSection = () => {
    const scrollPosition = window.scrollY + 180;

    let currentSection = '';

    navLinks.forEach(link => {
        const section = document.querySelector(link.getAttribute('href'));

        if (section && section.offsetTop <= scrollPosition) {
            currentSection = link.getAttribute('href');
        }
    });

    navLinks.forEach(link => {
        link.classList.toggle(
            'active',
            link.getAttribute('href') === currentSection
        );
    });
};

window.addEventListener('scroll', updateActiveSection, { passive: true });

updateActiveSection();