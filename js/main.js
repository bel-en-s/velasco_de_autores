/* -------------------------------------------
 * IMMEDIATE EXECUTION (Avoid FOUC & Jumps)
 * ------------------------------------------- */
// Create transition overlay dynamically instantly
const transitionOverlay = document.createElement('div');
Object.assign(transitionOverlay.style, {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: '#ffffff',
    zIndex: 9999,
    pointerEvents: 'none',
    opacity: 1 
});
document.body.appendChild(transitionOverlay);

document.addEventListener("DOMContentLoaded", () => {
    // Initial load: Fade out the white overlay to reveal the page smoothly
    gsap.to(transitionOverlay, {
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
        onComplete: () => {
            transitionOverlay.style.display = 'none';
        }
    });

    // Fade in text elements softly
    gsap.from(".logo, .cart-icon, .menu-toggle", {
        opacity: 0,
        y: -10,
        duration: 1.5,
        ease: "power2.out",
        stagger: 0.1,
        clearProps: "all" // Fixes the microjump restoring proper CSS transform centering for the logo
    });

    gsap.from(".sub-nav-list li", {
        opacity: 0,
        x: -15,
        duration: 1,
        ease: "power2.out",
        stagger: 0.05,
        delay: 0.2,
        clearProps: "all"
    });

    // Initialize scroll-dependent animations only after all images load (fixes trigger position jumping)
    window.addEventListener('load', () => {
        gsap.registerPlugin(ScrollTrigger);
        
        // Simple lazy reveal for editorial images
        gsap.utils.toArray('.hero-short-img, .editorial-image img').forEach(img => {
            gsap.from(img, {
                scrollTrigger: {
                    trigger: img,
                    start: "top 95%",
                },
                opacity: 0,
                y: 30,
                duration: 1.2,
                ease: "power2.out",
                clearProps: "all"
            });
        });

        // Reveal shop items
        gsap.utils.toArray('.product-item').forEach((item, i) => {
            gsap.from(item, {
                scrollTrigger: {
                    trigger: item,
                    start: "top 90%",
                },
                opacity: 0,
                y: 20,
                duration: 0.8,
                ease: "power2.out",
                clearProps: "all"
            });
        });
        
        // Refresh ScrollTrigger to ensure bounds are correct after rendering updates
        ScrollTrigger.refresh();
    });

    // El menú navbar ahora permanece siempre estático y visible sin ocultarse al hacer scroll.

    // Mobile Menu functionality
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileLinks = document.querySelectorAll('.mobile-link, .mobile-sub-link');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.classList.toggle('menu-open');
            
            // Stagger animation based on open/close state
            if(mobileMenu.classList.contains('active')) {
                // Prevent scrolling on body when menu is open
                document.body.style.overflow = 'hidden';
                mobileLinks.forEach((link, idx) => {
                    link.style.transitionDelay = `${0.2 + (idx * 0.05)}s`;
                });
            } else {
                document.body.style.overflow = '';
                mobileLinks.forEach(link => {
                    link.style.transitionDelay = `0s`;
                });
            }
        });

        // Close menu on link click
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
                document.body.style.overflow = '';
            });
        });
    }

    // SPA Transition logic extracted outside of DOMContentLoaded is now at top


    // Intercept link clicks for smooth exit transitions
    const allLinks = document.querySelectorAll('a:not([target="_blank"])');

    allLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetUrl = link.getAttribute('href');
            
            // Ignore links that trigger JS or just scroll to hash
            if (!targetUrl || targetUrl.startsWith('#') || targetUrl === '#') return;

            // Optional: Ignore hash links referencing the current page
            const currentPathname = window.location.pathname.split('/').pop() || 'index.html';
            if (targetUrl.startsWith(currentPathname + '#')) return;

            e.preventDefault();
            
            // Bring overlay back
            transitionOverlay.style.display = 'block';
            gsap.to(transitionOverlay, {
                opacity: 1,
                duration: 0.5,
                ease: "power2.inOut",
                onComplete: () => {
                    window.location.href = targetUrl;
                }
            });
        });
    });
});
