document.addEventListener("DOMContentLoaded", () => {
    // 1. Generate Waveform Bars for Music Section
    const waveformContainer = document.getElementById('waveform');
    if (waveformContainer) {
        const numBars = 60;
        for (let i = 0; i < numBars; i++) {
            const bar = document.createElement('div');
            bar.classList.add('waveform-bar');
            // Random height between 10% and 100%
            const height = Math.floor(Math.random() * 90) + 10;
            bar.style.height = `${height}%`;
            
            // Add staggered animation if reduced motion is not checked
            if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                 bar.style.animation = `pulse ${1 + Math.random()}s infinite alternate ease-in-out`;
                 bar.style.animationDelay = `${Math.random()}s`;
            }

            waveformContainer.appendChild(bar);
        }
    }

    // Add keyframes for waveform pulse programmatically
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes pulse {
            0% { transform: scaleY(0.8); }
            100% { transform: scaleY(1.1); }
        }
    `;
    document.head.appendChild(style);

    // 2. Scroll Listener for Seam Glow
    const seamGlow = document.querySelector('.seam-glow');

    // Colors mapping based on accent token
    const colorMap = {
        'copper': '#e07a3f',
        'cyan': '#3fd0e0',
        'violet': '#9b7ee0'
    };

    window.addEventListener('scroll', () => {
        // Calculate scroll progress %
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollProgress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;

        // Move the glow down the seam
        if (seamGlow) {
            // max travel is window height minus glow height (80px)
            const maxTravel = window.innerHeight - 80;
            seamGlow.style.transform = `translate(-50%, ${scrollProgress * maxTravel}px)`;
        }

        // Determine which section is in view to change glow color
        let activeColor = '#f2ece2'; // default text color (bone)

        const sectionElements = document.querySelectorAll('section[data-accent]');
        
        sectionElements.forEach(section => {
            const rect = section.getBoundingClientRect();
            // If the section is primarily in the middle of the screen
            if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
                const accent = section.getAttribute('data-accent');
                if (colorMap[accent]) {
                    activeColor = colorMap[accent];
                }
            }
        });

        if (seamGlow) {
            seamGlow.style.backgroundColor = activeColor;
            seamGlow.style.boxShadow = `0 0 15px 2px ${activeColor}`;
        }
    });

    // Initial trigger to set correct position and color on load
    window.dispatchEvent(new Event('scroll'));
});
