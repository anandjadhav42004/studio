document.addEventListener("DOMContentLoaded", () => {
    // PREFERS REDUCED MOTION CHECK
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. PAGE LOAD INTRO SEQUENCE
    const loaderOverlay = document.querySelector('.loader-overlay');
    const loaderLine = document.querySelector('.loader-line');
    
    if (loaderOverlay && !prefersReducedMotion) {
        // Draw the signature line
        loaderLine.style.transition = 'width 0.4s ease-out, background-color 0s';
        
        setTimeout(() => {
            loaderLine.style.width = '30%';
            loaderLine.style.backgroundColor = 'var(--accent-tattoo)';
        }, 100);
        
        setTimeout(() => {
            loaderLine.style.width = '60%';
            loaderLine.style.backgroundColor = 'var(--accent-gaming)';
        }, 400);

        setTimeout(() => {
            loaderLine.style.width = '100%';
            loaderLine.style.backgroundColor = 'var(--accent-music)';
        }, 700);

        // Hide loader bar
        setTimeout(() => {
            loaderOverlay.style.opacity = '0';
            setTimeout(() => {
                loaderOverlay.style.display = 'none';
            }, 500);
        }, 1200);
        
        // Start hero reveals earlier since loader is just a top bar now
        setTimeout(() => {
            initHeroReveal();
        }, 600);
    } else {
        if (loaderOverlay) loaderOverlay.style.display = 'none';
        initHeroReveal();
    }

    function initHeroReveal() {
        if (prefersReducedMotion) return;
        
        const lines = document.querySelectorAll('.reveal-line');
        lines.forEach((line, index) => {
            setTimeout(() => {
                line.classList.add('is-visible');
            }, index * 80);
        });

        const fades = document.querySelectorAll('.fade-in-element');
        setTimeout(() => {
            fades.forEach(el => el.classList.add('is-visible'));
        }, (lines.length * 80) + 200);
    }


    // 2. SCROLL REVEALS (Intersection Observer)
    const revealOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                
                // If it's a stagger group (grid), stagger its children
                if (target.classList.contains('grid-stagger-group')) {
                    const cards = target.querySelectorAll('.card-reveal');
                    cards.forEach((card, index) => {
                        setTimeout(() => {
                            card.classList.add('is-visible');
                        }, index * 75);
                    });
                } else {
                    target.classList.add('is-visible');
                }
                
                // Unobserve after animating
                observer.unobserve(target);
            }
        });
    }, revealOptions);

    document.querySelectorAll('.scroll-reveal, .grid-stagger-group').forEach(el => {
        if (!prefersReducedMotion) {
            revealObserver.observe(el);
        } else {
            el.classList.add('is-visible');
            if(el.classList.contains('grid-stagger-group')) {
                el.querySelectorAll('.card-reveal').forEach(c => c.classList.add('is-visible'));
            }
        }
    });


    // 3. THE SEAM (Continuous Scroll Tracker)
    const seamGlow = document.querySelector('.seam-glow');
    const colorMap = {
        'copper': '#e07a3f',
        'cyan': '#3fd0e0',
        'violet': '#9b7ee0'
    };
    let currentAccent = '#e07a3f'; // default

    function updateSeam() {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollProgress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;

        if (seamGlow && !prefersReducedMotion) {
            const maxTravel = window.innerHeight - 80;
            seamGlow.style.transform = `translate(-50%, ${scrollProgress * maxTravel}px)`;
        }

        // Section Accent Tracker
        let activeColor = currentAccent;
        const sectionElements = document.querySelectorAll('section[data-accent]');
        
        sectionElements.forEach(section => {
            const rect = section.getBoundingClientRect();
            // middle 50% of screen
            if (rect.top <= window.innerHeight * 0.6 && rect.bottom >= window.innerHeight * 0.4) {
                const accent = section.getAttribute('data-accent');
                if (colorMap[accent]) {
                    activeColor = colorMap[accent];
                }
            }
        });

        if (activeColor !== currentAccent) {
            currentAccent = activeColor;
            document.documentElement.style.setProperty('--active-accent', currentAccent);
        }

        requestAnimationFrame(updateSeam);
    }
    if(!prefersReducedMotion) {
        requestAnimationFrame(updateSeam);
    }


    // 4. MAGNETIC BUTTONS
    const magneticBtns = document.querySelectorAll('.btn-magnetic');
    
    if (!prefersReducedMotion && window.matchMedia("(hover: hover)").matches) {
        magneticBtns.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left; // x position within the element
                const y = e.clientY - rect.top;  // y position within the element
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const deltaX = (x - centerX) / centerX;
                const deltaY = (y - centerY) / centerY;
                
                // Max shift is 6px
                btn.style.transform = `translate(${deltaX * 6}px, ${deltaY * 6}px)`;
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate(0px, 0px)';
                btn.style.transition = 'transform 0.3s ease';
                setTimeout(() => {
                    btn.style.transition = '';
                }, 300);
            });
        });
    }


    // 7. NUMBERS THAT COUNT
    const countGroup = document.querySelector('.count-up-group');
    if (countGroup && !prefersReducedMotion) {
        const countObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const statNums = entry.target.querySelectorAll('.stat-num');
                    statNums.forEach(num => {
                        const target = parseInt(num.getAttribute('data-count'), 10);
                        const duration = 800;
                        const startTime = performance.now();
                        
                        function updateCount(currentTime) {
                            const elapsed = currentTime - startTime;
                            const progress = Math.min(elapsed / duration, 1);
                            
                            // easeOutQuad
                            const easeProgress = progress * (2 - progress);
                            
                            const currentVal = Math.floor(easeProgress * target);
                            num.innerText = currentVal;
                            
                            if (progress < 1) {
                                requestAnimationFrame(updateCount);
                            } else {
                                num.innerText = target;
                            }
                        }
                        requestAnimationFrame(updateCount);
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        countObserver.observe(countGroup);
    } else if (countGroup) {
        const statNums = countGroup.querySelectorAll('.stat-num');
        statNums.forEach(num => num.innerText = num.getAttribute('data-count'));
    }


    // 8. WAVEFORM
    const waveformContainer = document.getElementById('waveform');
    if (waveformContainer) {
        const numBars = 60;
        const heights = [];
        for (let i = 0; i < numBars; i++) {
            const bar = document.createElement('div');
            bar.classList.add('waveform-bar');
            
            const height = Math.floor(Math.random() * 90) + 10;
            heights.push(height);
            
            waveformContainer.appendChild(bar);
        }

        const bars = waveformContainer.querySelectorAll('.waveform-bar');

        const waveObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    bars.forEach((bar, i) => {
                        setTimeout(() => {
                            bar.style.height = `${heights[i]}%`;
                            bar.classList.add('is-visible');
                            
                            // Add idle animation after entrance
                            if (!prefersReducedMotion) {
                                setTimeout(() => {
                                    bar.style.animation = `waveformIdle ${2 + Math.random()}s infinite alternate ease-in-out`;
                                    bar.style.animationDelay = `${Math.random()}s`;
                                }, 600); // Wait for entrance to finish
                            }
                        }, i * 10); // stagger
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        
        if (!prefersReducedMotion) {
            waveObserver.observe(waveformContainer);
        } else {
            bars.forEach((bar, i) => {
                bar.style.height = `${heights[i]}%`;
                bar.classList.add('is-visible');
            });
        }
    }


    // 9. CUSTOM CURSOR
    if (!prefersReducedMotion && window.matchMedia("(pointer: fine)").matches) {
        document.body.classList.add('has-custom-cursor');
        const cursor = document.querySelector('.custom-cursor');
        cursor.style.display = 'block';

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let cursorX = mouseX;
        let cursorY = mouseY;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        function renderCursor() {
            // Lerp
            cursorX += (mouseX - cursorX) * 0.2;
            cursorY += (mouseY - cursorY) * 0.2;
            cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
            requestAnimationFrame(renderCursor);
        }
        requestAnimationFrame(renderCursor);

        // Hover states
        const hoverTargets = document.querySelectorAll('.hover-target, a, button');
        hoverTargets.forEach(target => {
            target.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
            target.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
        });
    }

    // 10. FORM SUBMIT SIMULATION
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = document.getElementById('submitBtn');
            
            // Swap state
            btn.classList.add('success-state');
            
            // In a real app, send data to backend here.
            
            // Reset after 3 seconds
            setTimeout(() => {
                btn.classList.remove('success-state');
                bookingForm.reset();
            }, 3000);
        });
    }
    // 11. LIVE OPEN/CLOSE BADGE
    const liveBadge = document.getElementById('liveBadge');
    if (liveBadge) {
        const updateBadge = () => {
            const now = new Date();
            const day = now.getDay();
            const hour = now.getHours();
            const isOpenDay = day !== 1; // 1 is Monday
            const isOpenHour = hour >= 11 && hour < 22; // 11am to 10pm
            
            if (isOpenDay && isOpenHour) {
                liveBadge.classList.add('is-open');
                liveBadge.querySelector('.live-text').innerText = 'Open Now';
            } else {
                liveBadge.classList.remove('is-open');
                liveBadge.querySelector('.live-text').innerText = 'Closed';
            }
        };
        updateBadge();
        setInterval(updateBadge, 60000); // Check every minute
    }

    // 12. HERO PARALLAX & GLOW REACTIVITY
    const hero = document.querySelector('.hero');
    const heroGlows = document.querySelectorAll('.hero-glow');
    if (hero && !prefersReducedMotion) {
        hero.addEventListener('mousemove', (e) => {
            const x = e.clientX / window.innerWidth - 0.5;
            const y = e.clientY / window.innerHeight - 0.5;
            
            heroGlows.forEach((glow, index) => {
                const depth = (index + 1) * 20;
                glow.style.transform = `translate(${x * depth}px, ${y * depth}px)`;
            });
        });
    }

    // 13. 3D TILT ON CARDS
    const tiltCards = document.querySelectorAll('.card');
    if (!prefersReducedMotion && window.matchMedia("(hover: hover)").matches) {
        tiltCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left; 
                const y = e.clientY - rect.top; 
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                // Calculate rotation (max 10 degrees)
                const rotateX = ((y - centerY) / centerY) * -10;
                const rotateY = ((x - centerX) / centerX) * 10;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            });
        });
    }

    // 14. LIGHTBOX
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');
    const galleryItems = document.querySelectorAll('.card-img-placeholder');
    
    if (lightbox) {
        galleryItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const img = item.querySelector('img');
                if (img) {
                    lightboxImg.src = img.src;
                    lightboxImg.style.display = 'block';
                    lightbox.style.backgroundColor = 'rgba(12, 11, 10, 0.95)';
                } else {
                    // Fallback for placeholder
                    lightboxImg.style.display = 'none';
                    lightbox.style.backgroundColor = 'var(--panel)';
                }
                lightbox.classList.add('is-open');
            });
        });
        
        const closeLightbox = () => lightbox.classList.remove('is-open');
        if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', closeLightbox);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeLightbox();
        });
    }

    // 15. CURTAIN REVEAL OBSERVER
    const curtainObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('is-visible');
                }, 200);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2, rootMargin: "0px 0px -50px 0px" });

    document.querySelectorAll('.curtain-reveal-container').forEach(el => {
        if (!prefersReducedMotion) curtainObserver.observe(el);
        else el.classList.add('is-visible');
    });

});
