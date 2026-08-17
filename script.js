
document.addEventListener("DOMContentLoaded", () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

    // 1. PAGE LOAD
    const loaderOverlay = document.querySelector('.loader-overlay');
    const loaderLine = document.querySelector('.loader-line');
    
    if (loaderOverlay && !prefersReducedMotion) {
        setTimeout(() => { loaderLine.style.width = '50%'; }, 100);
        setTimeout(() => { loaderLine.style.width = '100%'; }, 400);
        setTimeout(() => {
            loaderOverlay.style.opacity = '0';
            setTimeout(() => { loaderOverlay.style.display = 'none'; }, 500);
        }, 800);
        setTimeout(initHeroReveal, 400);
    } else {
        if (loaderOverlay) loaderOverlay.style.display = 'none';
        initHeroReveal();
    }

    function initHeroReveal() {
        if (prefersReducedMotion) return;
        document.querySelectorAll('.reveal-line').forEach((line, index) => {
            setTimeout(() => { line.classList.add('is-visible'); }, index * 80);
        });
        setTimeout(() => {
            document.querySelectorAll('.fade-in-element').forEach(el => el.classList.add('is-visible'));
        }, 400);
    }

    // 2. SCROLL REVEALS
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                if (target.classList.contains('grid-stagger-group')) {
                    target.querySelectorAll('.card-reveal').forEach((card, index) => {
                        setTimeout(() => { card.classList.add('is-visible'); }, index * 75);
                    });
                } else {
                    target.classList.add('is-visible');
                }
                observer.unobserve(target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    document.querySelectorAll('.scroll-reveal, .grid-stagger-group').forEach(el => {
        if (!prefersReducedMotion) revealObserver.observe(el);
        else {
            el.classList.add('is-visible');
            if(el.classList.contains('grid-stagger-group')) {
                el.querySelectorAll('.card-reveal').forEach(c => c.classList.add('is-visible'));
            }
        }
    });

    // 3. TAB/TOGGLE SYSTEM
    const filterBtns = document.querySelectorAll('.filter-btn');
    const filterableSections = document.querySelectorAll('.filterable-section');
    const navTabLinks = document.querySelectorAll('.nav-tab-link');

    function applyFilter(filterValue) {
        filterBtns.forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.querySelector(`.filter-btn[data-filter="${filterValue}"]`);
        if (activeBtn) activeBtn.classList.add('active');

        filterableSections.forEach(section => {
            if (filterValue === 'all' || section.getAttribute('data-id') === filterValue) {
                section.classList.remove('hidden');
            } else {
                section.classList.add('hidden');
            }
        });

        document.querySelectorAll('.nav-links a').forEach(link => link.classList.remove('active'));
        if (filterValue !== 'all') {
            const activeNav = document.querySelector(`.nav-tab-link[data-target="${filterValue}"]`);
            if (activeNav) activeNav.classList.add('active');
        }

        window.location.hash = filterValue === 'all' ? '' : filterValue;
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            applyFilter(btn.getAttribute('data-filter'));
            const filterSection = document.querySelector('.filter-section');
            if(filterSection) {
                const y = filterSection.getBoundingClientRect().top + window.scrollY - 80;
                window.scrollTo({top: y, behavior: 'smooth'});
            }
        });
    });

    navTabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const target = link.getAttribute('data-target');
            applyFilter(target);
            closeMobileMenu();
        });
    });

    if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        if (['tattoo', 'gaming', 'music'].includes(hash)) {
            applyFilter(hash);
        }
    }

    // 4. CUSTOM CURSOR
    if (!prefersReducedMotion && !isTouchDevice && window.matchMedia("(pointer: fine)").matches) {
        document.body.classList.add('has-custom-cursor');
        const cursor = document.querySelector('.custom-cursor');
        cursor.style.display = 'block';
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let cursorX = mouseX;
        let cursorY = mouseY;
        window.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });
        function renderCursor() {
            cursorX += (mouseX - cursorX) * 0.2;
            cursorY += (mouseY - cursorY) * 0.2;
            cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
            requestAnimationFrame(renderCursor);
        }
        requestAnimationFrame(renderCursor);
        
        const attachHover = () => {
            document.querySelectorAll('.hover-target, a, button').forEach(target => {
                target.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
                target.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
            });
        };
        attachHover();
    }

    // 5. LIVE OPEN BADGE
    const liveBadge = document.getElementById('liveBadge');
    if (liveBadge) {
        const updateBadge = () => {
            const now = new Date();
            const day = now.getDay();
            const hour = now.getHours();
            const isOpenDay = day !== 1;
            const isOpenHour = hour >= 11 && hour < 22;
            if (isOpenDay && isOpenHour) {
                liveBadge.classList.add('is-open');
                liveBadge.querySelector('.live-text').innerText = 'Open Now';
            } else {
                liveBadge.classList.remove('is-open');
                liveBadge.querySelector('.live-text').innerText = 'Closed';
            }
        };
        updateBadge();
        setInterval(updateBadge, 60000);
    }

    // 6. 3D TILT ON CARDS
    const tiltCards = document.querySelectorAll('.card, .crew-card');
    if (!prefersReducedMotion && !isTouchDevice && window.matchMedia("(hover: hover)").matches) {
        tiltCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left; 
                const y = e.clientY - rect.top; 
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -10;
                const rotateY = ((x - centerX) / centerX) * 10;
                const origTransform = card.style.transform.replace(/perspective\(.*?\).*?scale3d\(.*?\)/, '');
                card.style.transform = `${origTransform} perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            });
            card.addEventListener('mouseleave', () => {
                const origTransform = card.style.transform.replace(/perspective\(.*?\).*?scale3d\(.*?\)/, '');
                card.style.transform = `${origTransform} perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            });
        });
    }

    // 7. LIGHTBOX
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const galleryItems = document.querySelectorAll('.card-img-placeholder, .gallery-img-placeholder, .crew-img-placeholder');
    if (lightbox) {
        galleryItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const img = item.querySelector('img');
                if (img) {
                    lightboxImg.src = img.src;
                    lightboxImg.style.display = 'block';
                    lightbox.style.backgroundColor = 'rgba(15, 13, 12, 0.95)';
                } else {
                    lightboxImg.style.display = 'none';
                    lightbox.style.backgroundColor = 'var(--panel)';
                }
                lightbox.classList.add('is-open');
            });
        });
        const closeLightbox = () => lightbox.classList.remove('is-open');
        document.getElementById('lightboxClose')?.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', closeLightbox);
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });
    }

    // 8. CURTAIN REVEALS
    const curtainObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setTimeout(() => { entry.target.classList.add('is-visible'); }, 200);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2, rootMargin: "0px 0px -50px 0px" });

    document.querySelectorAll('.curtain-reveal-container').forEach(el => {
        if (!prefersReducedMotion) curtainObserver.observe(el);
        else el.classList.add('is-visible');
    });

    // 9. FAQ ACCORDION
    document.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.parentElement;
            item.classList.toggle('active');
        });
    });

    // 10. CAROUSEL WITH SWIPE
    const track = document.getElementById('carouselTrack');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    let currentIndex = 0;
    
    if (track && prevBtn && nextBtn) {
        const items = track.querySelectorAll('.carousel-item');
        const updateCarousel = () => {
            const itemWidth = items[0].getBoundingClientRect().width;
            const gap = 16;
            track.style.transform = `translateX(-${currentIndex * (itemWidth + gap)}px)`;
        };
        nextBtn.addEventListener('click', () => {
            if (currentIndex < items.length - 1) {
                currentIndex++;
                updateCarousel();
            }
        });
        prevBtn.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateCarousel();
            }
        });
        window.addEventListener('resize', updateCarousel);
        
        // Touch events for carousel
        let startX = 0;
        let currentX = 0;
        let isDragging = false;

        track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
            track.classList.add('is-dragging');
        }, {passive: true});

        track.addEventListener('touchmove', (e) => {
            if(!isDragging) return;
            currentX = e.touches[0].clientX;
            const diff = currentX - startX;
            const itemWidth = items[0].getBoundingClientRect().width;
            const gap = 16;
            const baseTransform = -(currentIndex * (itemWidth + gap));
            track.style.transform = `translateX(${baseTransform + diff}px)`;
        }, {passive: true});

        track.addEventListener('touchend', (e) => {
            if(!isDragging) return;
            isDragging = false;
            track.classList.remove('is-dragging');
            const diff = currentX - startX;
            if(Math.abs(diff) > 50) {
                if(diff < 0 && currentIndex < items.length - 1) currentIndex++;
                else if(diff > 0 && currentIndex > 0) currentIndex--;
            }
            updateCarousel();
        });
    }

    // 11. COUNT UP STATS
    const countGroup = document.querySelector('.count-up-group');
    if (countGroup && !prefersReducedMotion) {
        const countObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.querySelectorAll('.stat-num').forEach(num => {
                        const target = parseInt(num.getAttribute('data-count'), 10);
                        const duration = 800;
                        const startTime = performance.now();
                        function updateCount(currentTime) {
                            const elapsed = currentTime - startTime;
                            const progress = Math.min(elapsed / duration, 1);
                            const easeProgress = progress * (2 - progress);
                            num.innerText = Math.floor(easeProgress * target);
                            if (progress < 1) requestAnimationFrame(updateCount);
                            else num.innerText = target;
                        }
                        requestAnimationFrame(updateCount);
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        countObserver.observe(countGroup);
    } else if (countGroup) {
        countGroup.querySelectorAll('.stat-num').forEach(num => num.innerText = num.getAttribute('data-count'));
    }

    // 12. WAVEFORM
    const waveformContainer = document.getElementById('waveform');
    if (waveformContainer) {
        for (let i = 0; i < 60; i++) {
            const bar = document.createElement('div');
            bar.classList.add('waveform-bar');
            waveformContainer.appendChild(bar);
        }
        const bars = waveformContainer.querySelectorAll('.waveform-bar');
        const waveObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    bars.forEach((bar, i) => {
                        const height = Math.floor(Math.random() * 90) + 10;
                        setTimeout(() => {
                            bar.style.height = `${height}%`;
                            bar.classList.add('is-visible');
                            if (!prefersReducedMotion) {
                                setTimeout(() => {
                                    bar.style.animation = `waveformIdle ${2 + Math.random()}s infinite alternate ease-in-out`;
                                    bar.style.animationDelay = `${Math.random()}s`;
                                }, 600);
                            }
                        }, i * 10);
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        if (!prefersReducedMotion) waveObserver.observe(waveformContainer);
        else bars.forEach((bar) => { bar.style.height = `${Math.floor(Math.random() * 90) + 10}%`; bar.classList.add('is-visible'); });
    }
    
    // 13. HAMBURGER MENU
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navLinks = document.getElementById('navLinks');
    
    function closeMobileMenu() {
        if(hamburgerBtn && hamburgerBtn.classList.contains('is-active')) {
            hamburgerBtn.classList.remove('is-active');
            navLinks.classList.remove('is-open');
            document.body.style.overflow = '';
        }
    }
    
    if(hamburgerBtn && navLinks) {
        hamburgerBtn.addEventListener('click', () => {
            hamburgerBtn.classList.toggle('is-active');
            navLinks.classList.toggle('is-open');
            if(navLinks.classList.contains('is-open')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
    }
    
    // Close mobile menu on regular link clicks
    document.querySelectorAll('.nav-links a:not(.nav-tab-link)').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
    
    // 14. WHATSAPP FORM SUBMISSION
    const bookingForm = document.getElementById('bookingForm');
    if(bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('bookName').value;
            const type = document.getElementById('bookType').value;
            const message = document.getElementById('bookMessage').value;
            
            // Format: "Hi Dyuman! My name is [NAME]. I'd like to book: [BOOKING TYPE]. [MESSAGE]"
            let waText = `Hi Dyuman! My name is ${name}. I'd like to book: ${type}.`;
            if(message.trim() !== '') {
                waText += ` ${message}`;
            }
            
            const waUrl = `https://wa.me/918308366101?text=${encodeURIComponent(waText)}`;
            window.open(waUrl, '_blank', 'noopener,noreferrer');
            bookingForm.reset();
        });
    }
});
