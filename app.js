document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const homeSection = document.getElementById('home-section');
    const categoriesSection = document.getElementById('categories-section');
    const toolsSection = document.getElementById('tools-section');
    const categoryCardsContainer = document.getElementById('category-cards-container');
    const toolsListContainer = document.getElementById('tools-list-container');
    const toolsTitle = document.getElementById('tools-title');
    const backButton = document.getElementById('back-button');

    // --- Elements for Animations ---
    const aiTextSpan = document.getElementById('ai-text-span');
    const cursorOutline = document.getElementById('cursor-outline'); // Simplified cursor

    let toolsData = null;
    
    // --- State Flags ---
    let isHomeVisible = true;
    let isToolsVisible = false;
    let isTransitioning = false; // Prevents spamming scroll

    // --- Font Changing Effect ---
    const fonts = ['Georgia', 'Arial', 'Courier New', 'Verdana', 'Arial Black', 'cursive', 'fantasy', 'monospace'];
    let fontIndex = 0;
    setInterval(() => {
        aiTextSpan.style.fontFamily = fonts[fontIndex];
        fontIndex = (fontIndex + 1) % fonts.length;
    }, 1000);

    // --- Simplified Custom Cursor Logic ---
    window.addEventListener('mousemove', (e) => {
        const posX = e.clientX;
        const posY = e.clientY;
        cursorOutline.style.left = `${posX}px`;
        cursorOutline.style.top = `${posY}px`;
    });

    const addHoverEffect = (elements) => {
        elements.forEach(el => {
            el.addEventListener('mouseover', () => cursorOutline.classList.add('hover'));
            el.addEventListener('mouseout', () => cursorOutline.classList.remove('hover'));
        });
    };
    addHoverEffect([backButton]);

    // --- Data Fetching ---
    async function loadTools() {
        try {
            const response = await fetch('tools.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            toolsData = await response.json();
            renderCategories();
        } catch (error) {
            console.error("Could not load tools data:", error);
            categoryCardsContainer.innerHTML = `<p class="text-danger">Failed to load tool categories.</p>`;
        }
    }

    // --- Rendering Functions ---
    function renderCategories() {
        categoryCardsContainer.innerHTML = '';
        toolsData.categories.forEach(category => {
            const cardWrapper = document.createElement('div');
            cardWrapper.className = 'col-12 col-md-6 col-lg-4';
            cardWrapper.innerHTML = `
                <div class="category-card h-100" data-category-id="${category.id}">
                    <h3 class="fw-semibold">${category.title}</h3>
                    <p class="text-muted mt-3">${category.description}</p>
                </div>
            `;
            categoryCardsContainer.appendChild(cardWrapper);
        });
        addHoverEffect(document.querySelectorAll('.category-card'));
    }

    function renderTools(categoryId) {
        const category = toolsData.categories.find(c => c.id === categoryId);
        if (!category) return;
        toolsTitle.textContent = category.title;
        toolsListContainer.innerHTML = '';
        category.tools.forEach((tool, index) => {
            const toolItem = document.createElement('div');
            toolItem.className = 'p-3 mb-3 rounded d-flex justify-content-between align-items-center';
            toolItem.style.backgroundColor = '#FFFFFF';
            toolItem.style.border = '1px solid #DEE2E6';
            toolItem.style.opacity = '0';
            toolItem.style.transform = 'translateY(20px)';
            toolItem.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
            toolItem.innerHTML = `
                <div>
                    <h5 class="fw-semibold text-dark mb-1">${tool.name}</h5>
                    <p class="text-muted mb-0">${tool.description}</p>
                </div>
                <a href="${tool.link}" target="_blank" rel="noopener noreferrer" class="btn btn-outline-primary ms-4 flex-shrink-0 try-now-btn">
                    Try Now &rarr;
                </a>
            `;
            toolsListContainer.appendChild(toolItem);
            setTimeout(() => {
                toolItem.style.opacity = '1';
                toolItem.style.transform = 'translateY(0)';
            }, 50);
        });
        addHoverEffect(document.querySelectorAll('.try-now-btn'));
    }

    // --- UI Transitions & Animations ---
    function showTools() {
        isToolsVisible = true;
        toolsSection.style.transition = 'transform 0.6s ease-in-out, opacity 0.6s ease-in-out';
        toolsSection.style.opacity = '1';
        toolsSection.style.transform = 'translateX(0)';
        toolsSection.style.pointerEvents = 'auto';
    }

    function hideTools() {
        isToolsVisible = false;
        toolsSection.style.transform = 'translateX(100%)';
        toolsSection.style.opacity = '0';
        toolsSection.style.pointerEvents = 'none';
    }

    // --- Event Listeners ---
    window.addEventListener('wheel', (e) => {
        if (isToolsVisible || isTransitioning) return;

        // --- Transition from Home to Categories ---
        if (isHomeVisible && e.deltaY > 0) {
            isTransitioning = true;
            isHomeVisible = false;
            homeSection.classList.add('is-hidden');
            categoriesSection.classList.add('is-visible');
            setTimeout(() => { isTransitioning = false; }, 800);
        }
        // --- Transition from Categories to Home ---
        else if (!isHomeVisible && e.deltaY < 0) {
            isTransitioning = true;
            isHomeVisible = true;
            homeSection.classList.remove('is-hidden');
            categoriesSection.classList.remove('is-visible');
            setTimeout(() => { isTransitioning = false; }, 800);
        }
    });

    categoryCardsContainer.addEventListener('click', (e) => {
        const card = e.target.closest('.category-card');
        if (card) {
            const categoryId = card.dataset.categoryId;
            createRipple(e, card);
            setTimeout(() => {
                renderTools(categoryId);
                showTools();
            }, 300);
        }
    });

    backButton.addEventListener('click', () => {
        hideTools();
    });

    function createRipple(event, element) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        ripple.classList.add('ripple');
        element.appendChild(ripple);
        ripple.addEventListener('animationend', () => ripple.remove());
    }

    // --- Initial Load ---
    loadTools();
});