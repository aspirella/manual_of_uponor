// Data Structure for Steps
const stepsData = [
    {
        id: 2,
        title: "",
        description: "",
        visual: "dimensions.gif",
        customTable: {
            headers: ["n", "L1 [mm]", "L2 [mm]"],
            rows: [
                ["2", "214", "155"],
                ["3", "264", "205"],
                ["4", "314", "255"],
                ["5", "364", "305"],
                ["6", "414", "355"],
                ["7", "464", "405"],
                ["8", "514", "455"],
                ["9", "564", "505"],
                ["10", "614", "555"],
                ["11", "664", "605"],
                ["12", "714", "655"],
                ["13", "764", "705"],
                ["14", "814", "755"],
                ["15", "864", "805"],
                ["16", "914", "855"]
            ]
        },

        specs: [
            { icon: "ϑsec = 15 – 60°C.svg", label: "ϑsec", value: "= 15 – 60°C" },
            { icon: "kvs = 0,95.svg", label: "kvs", value: "= 0,95 m³/h" },
            { icon: "Pmax = 6 bar.svg", label: "Pmax", value: "= 6 bar" },
            { icon: "kvs = 2,83.svg", label: "kvs", value: "= 2,83 m³/h" },
            { icon: "Ptest = 10 bar.svg", label: "Ptest", value: "= 10 bar" },
            { icon: "Vmax.svg", label: "V̇max", value: "= 3,6 m³/h (12 loops)" }
        ]
    },
    {
        id: 3,
        category: "installation",
        title: "Installation Step 1",
        description: "",
        visual: "installation-step-1.gif",

        specs: []
    },
    {
        id: 7,
        category: "installation",
        title: "Installation Step 2",
        description: "",
        visual: "installation-step-2.gif",
        specs: [
            { icon: "max. 25-30 Nm.svg", label: "Torque", value: "max. 25-30 Nm" }
        ]
    },

    {
        id: 4,
        category: "flushing",
        title: "Pipe Insert & Connection",
        description: "",
        visual: "flushing-step-1.gif",

        specs: [
            { icon: "EN 1264.svg", label: "", value: "EN 1264" }
        ]
    },
    {
        id: 9,
        category: "flushing",
        title: "Flushing Step 2",
        description: "",
        visual: "flushing-step-2.gif",
        specs: [
            { icon: "EN 1264.svg", label: "", value: "EN 1264" }
        ]
    },

    {
        id: 5,
        title: "Pressure Check",
        description: "",
        visual: "pressure-test.gif",
    },
    {
        id: 6,
        title: "Setting Levels / Balancing",
        description: "",
        visual: "operation.gif",
    },
    {
        id: 10,
        title: "Note",
        description: "",
        visual: "",
        isNotes: true
    },
    {
        id: 11,
        title: "Completed",
        description: "",
        visual: "",
        isCompletion: true
    }

];

// App State Keys
const SAVED_STEP_KEY = 'current-step-index';
const THEME_KEY = 'preferred-theme';

// App State
let currentStepIndex = 0;

// DOM Elements
const navItems = document.querySelectorAll('.nav-item');
const stepTitle = document.getElementById('current-step-title');
const stepDesc = document.getElementById('current-step-desc');
const visualWrapper = document.querySelector('.video-wrapper');
let mainImage = document.getElementById('main-image');
let replayBtn = document.getElementById('replayBtn');
let replayTimer = null;
const checklistContainer = document.getElementById('checklist-container');
const specsContainer = document.getElementById('specs-container');

// Theme Toggle Elements
const themeToggle = document.getElementById('theme-toggle');
const themeLabel = document.getElementById('theme-label');
const body = document.body;

// Initialization
function init() {
    // Restore state by ID
    const savedId = localStorage.getItem(SAVED_STEP_KEY);
    if (savedId !== null) {
        const foundIndex = stepsData.findIndex(s => String(s.id) === savedId);
        currentStepIndex = foundIndex !== -1 ? foundIndex : 0;
    } else {
        currentStepIndex = 0;
    }

    // Restore Theme
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) {
        setTheme(savedTheme);
        if (themeToggle) themeToggle.checked = savedTheme === 'dark';
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
        if (themeToggle) themeToggle.checked = true;
    }

    renderStep(currentStepIndex);
    attachEventListeners();
    addNavigationControls();
}

// Render Functions
// Render Functions
function renderStep(index) {
    if (!stepsData[index]) return;

    const step = stepsData[index];
    localStorage.setItem(SAVED_STEP_KEY, step.id);
    const videoWrapper = document.querySelector('.video-wrapper');

    if (videoWrapper) {
        // Reset classes
        videoWrapper.className = 'video-wrapper';

        if (step.id === 2) {
            // Dimensions step
            videoWrapper.classList.add('wide-mode');
        } else {
            // All other steps
            videoWrapper.classList.add('portrait-mode');
        }
    }


    // Handle Notes Step
    if (step.isNotes) {
        renderNotesSection();
        updateNavState(index);
        return;
    }

    if (step.isCompletion) {
        renderCompletionSection();
        updateNavState(index);
        return;
    }


    const videoContainer = document.querySelector('.video-player-container');

    // Restore video player if it was replaced by Notes
    if (!document.getElementById('main-image')) {
        videoContainer.innerHTML = `
            <div class="video-wrapper" id="visual-container">
                <img id="main-image" style="display: center; justify-content: center; max-width: 90%; height: auto; margin: auto;" />
                <button id="replayBtn" class="replay-btn hidden" data-i18n="btn_replay">${i18n ? i18n.t('btn_replay', 'Replay') : 'Replay'}</button>
            </div>
        `;
        // Update references to the new elements
        mainImage = document.getElementById('main-image');
        replayBtn = document.getElementById('replayBtn');

        // Re-attach replay listener
        if (replayBtn) {
            replayBtn.addEventListener('click', () => {
                replayBtn.classList.add('hidden');
                if (replayTimer) clearTimeout(replayTimer);

                const currentStep = stepsData[currentStepIndex];
                const cleanSrc = mainImage.src.split("?")[0];
                mainImage.src = cleanSrc + "?t=" + new Date().getTime();
            });
        }
    } else {
        if (videoContainer) {
            videoContainer.classList.remove('large-visual-mode');
        }
    }

    // 1. Update Content Header
    const translatedTitle = window.i18n ? i18n.t(`step_${step.id}_title`, step.title) : step.title;
    const translatedDesc = window.i18n ? i18n.t(`step_${step.id}_desc`, step.description) : step.description;

    const stepInfo = document.querySelector('.step-info');

    if (stepInfo) {
        if (step.category) {
            stepInfo.classList.remove('hidden');
            if (stepTitle) stepTitle.classList.add('hidden');
            if (stepDesc) stepDesc.classList.add('hidden');
        } else {
            stepInfo.classList.add('hidden');
        }
    }

    // 2. Update Visual (Image only)
    // 2. Update Visual (Image only)
    if (mainImage) {
        if (step.visual) {

            mainImage.classList.remove('hidden');

            // Always show replay button immediately
            replayBtn.classList.remove('hidden');

            if (replayTimer) clearTimeout(replayTimer);

            mainImage.onerror = function () {
                this.onerror = null;
                this.src = 'Dimensions.svg';
                this.style.objectFit = 'contain';
            };

            mainImage.src = step.visual + "?t=" + new Date().getTime();
            mainImage.alt = translatedTitle + " visual";
        } else {
            mainImage.classList.add('hidden');
            replayBtn.classList.add('hidden');
        }
    }

    // 3. Update Checklist or Table
    const checklistHeader = document.querySelector('.tool-section:nth-of-type(1) h3');
    if (step.customTable) {
        if (checklistHeader) {
            checklistHeader.classList.remove('hidden');
            checklistHeader.innerHTML = `<span class="icon">📏</span> ${i18n.t('sidebar_dimensions', 'Dimensions Table')}`;
        }
        renderTable(step.customTable);
    } else {
        if (checklistHeader) {
            checklistHeader.classList.add('hidden');
        }
        // Empty containers instead of rendering items
        if (checklistContainer) checklistContainer.innerHTML = '';
    }

    // 4. Update Specs (Independent of Table)
    if (step.specs) {
        renderSpecs(step.specs);
    } else {
        if (specsContainer) specsContainer.innerHTML = '';
    }

    // 5. Update Navigation State
    updateNavState(index);

    // 6. Update Button States
    updateButtonStates(index);
}

function renderNotesSection() {
    const videoContainer = document.querySelector('.video-player-container');
    const checklistContainer = document.getElementById('checklist-container');
    const specsContainer = document.getElementById('specs-container');

    // Remove previous video styles
    videoContainer.classList.add('notes-mode');

    // Prevent video container conflict
    if (mainImage) mainImage.classList.add('hidden');
    if (replayBtn) replayBtn.classList.add('hidden');

    const checklistHeader = document.querySelector('.tool-section:nth-of-type(1) h3');
    if (checklistHeader) checklistHeader.classList.add('hidden');

    // Clear side panels
    if (checklistContainer) checklistContainer.innerHTML = '';
    if (specsContainer) specsContainer.innerHTML = '';

    // Replace center content
    videoContainer.innerHTML = `
        <div class="notes-layout">
            <div class="notes-card primary">
                <!-- Left Column: Read Instructions -->
                <div class="notes-section notes-icon-instruction">
                     <img src="Read_instructions.svg" alt="Read Instructions" class="instruction-icon">
                     <p class="instruction-text" data-i18n="text_uponor_vario">${window.i18n ? i18n.t('text_uponor_vario', 'Uponor Vario S') : 'Uponor Vario S'}</p>
                </div>

                <!-- Center Column: Arrow -->
                <div class="notes-section notes-arrow">
                    <span class="arrow-symbol">➔</span>
                </div>

                <!-- Right Column: QR Code & Button -->
                <div class="notes-section notes-qr-action">
                    <img src="qr-code.svg" alt="QR Code" class="qr-image">
                    <a href="https://www.uponor.com/services/download-centre"
                       target="_blank"
                       class="notes-btn" data-i18n="btn_download_center">
                       ${window.i18n ? i18n.t('btn_download_center', 'Visit Download Centre') : 'Visit Download Centre'}
                    </a>
                </div>
            </div>
            
            <div class="branding-option" style="margin-top: 2rem; text-align: center;">
                <button id="show-branding-btn" class="replay-btn" style="display: inline-block; margin: 0 auto; padding: 10px 20px;" data-i18n="btn_wrap_up">
                    ${window.i18n ? i18n.t('btn_wrap_up', 'Continue to Wrap-Up') : 'Continue to Wrap-Up'}
                </button>
            </div>
        </div>
    `;

    const wrapUpBtn = document.getElementById('show-branding-btn');
    const brandingPage = document.getElementById('branding-page');
    const appContainer = document.querySelector('.app-container');

    if (wrapUpBtn) {
        wrapUpBtn.addEventListener('click', function () {
            appContainer.classList.add('hidden');
            if (brandingPage) brandingPage.classList.remove('hidden');
        });
    }
}

function renderCompletionSection() {
    const videoContainer = document.querySelector('.video-player-container');
    const checklistContainer = document.getElementById('checklist-container');
    const specsContainer = document.getElementById('specs-container');

    // Clean up
    if (mainImage) mainImage.classList.add('hidden');
    if (replayBtn) replayBtn.classList.add('hidden');
    if (checklistContainer) checklistContainer.innerHTML = '';
    if (specsContainer) specsContainer.innerHTML = '';

    // Hide table header if present
    const checklistHeader = document.querySelector('.tool-section:nth-of-type(1) h3');
    if (checklistHeader) checklistHeader.classList.add('hidden');

    videoContainer.innerHTML = `
        <div class="completion-layout-container">
            <header class="completion-header">
                <div class="completion-content">
                     <h1 class="completion-title">Installation Completed</h1>
                     <div class="version-badge">
                        <span class="version-dot"></span> Version 1.0 | 02.2026
                     </div>
                     <div class="completion-actions">
                        <a href="Uponor _IM_Vario_S_manifold_FM_1143222_v2_202412.pdf" download target="_blank" style="text-decoration: none;">
                            <button class="btn-download">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="7 10 12 15 17 10"></polyline>
                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                </svg>
                                Download Manual (PDF)
                            </button>
                        </a>
                        <button id="restart-btn" class="btn-view">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                            </svg>
                            Start Over
                        </button>
                     </div>
                </div>
                <div class="completion-image-container">
                    <img src="1140836_vario S manifold fm.svg" alt="Vario S Manifold FM" class="completion-hero-image">
                </div>
            </header>

            <div class="completion-footer-actions">
                 <div class="support-card">
                    <p>Need technical assistance?</p>
                    <a href="https://www.uponor.com/en-en/services/contacts" target="_blank" style="text-decoration: none;">
                        <button class="btn-support">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                            </svg>
                            Contact
                        </button>
                    </a>
                 </div>
            </div>
             <footer class="completion-footer-brand">
                <div class="footer-logo">
                    <img src="aspirella_logo.svg" alt="Company Logo" style="height: 60px; opacity: 1;" loading="lazy">
                </div>
                <p><i>Crafted by</i> <strong>Aspirella Technodocs Private Limited</strong> </p>
            </footer>
        </div>
    `;

    document.getElementById('restart-btn').addEventListener('click', () => {
        currentStepIndex = 0;
        renderStep(0);
        // Ensure reset to Step 1 visual
    });
}

function updateButtonStates(index) {
    const prevBtn = document.getElementById('prev-step');
    const nextBtn = document.getElementById('next-step');
    if (!prevBtn || !nextBtn) return;

    const currentStep = stepsData[index];

    if (currentStep.category) {
        const categorySteps = stepsData.filter(s => s.category === currentStep.category);
        const firstCategoryStep = categorySteps[0];
        const lastCategoryStep = categorySteps[categorySteps.length - 1];

        // Disable Previous on first step of category
        prevBtn.disabled = (currentStep.id === firstCategoryStep.id);
        prevBtn.style.opacity = prevBtn.disabled ? "0.5" : "1";
        prevBtn.style.cursor = prevBtn.disabled ? "not-allowed" : "pointer";

        // Disable Next on last step of category
        nextBtn.disabled = (currentStep.id === lastCategoryStep.id);
        nextBtn.style.opacity = nextBtn.disabled ? "0.5" : "1";
        nextBtn.style.cursor = nextBtn.disabled ? "not-allowed" : "pointer";
    } else {
        // Default behavior for other categories if needed
        prevBtn.disabled = (index === 0);
        nextBtn.disabled = (index === stepsData.length - 1);
        prevBtn.style.opacity = prevBtn.disabled ? "0.5" : "1";
        nextBtn.style.opacity = nextBtn.disabled ? "0.5" : "1";
        prevBtn.style.cursor = prevBtn.disabled ? "not-allowed" : "pointer";
        nextBtn.style.cursor = nextBtn.disabled ? "not-allowed" : "pointer";
    }
}

function renderChecklist(items, stepId) {
    if (!checklistContainer) return;
    checklistContainer.innerHTML = '';

    items.forEach((itemText, index) => {
        const label = document.createElement('label');
        label.className = 'checkbox-item';

        const storageKey = `step-${stepId}-item-${index}`;
        const isChecked = localStorage.getItem(storageKey) === 'true';

        const translatedItemText = i18n.t(`step_${stepId}_checklist_${index}`, itemText);
        label.innerHTML = `
            <input type="checkbox" ${isChecked ? 'checked' : ''} data-index="${index}" aria-label="${translatedItemText}">
            <span class="checkmark"></span>
            <span class="text">${translatedItemText}</span>
        `;

        const checkbox = label.querySelector('input');
        checkbox.addEventListener('change', (e) => {
            localStorage.setItem(storageKey, e.target.checked);
        });

        checklistContainer.appendChild(label);
    });
}

function renderTable(tableData) {
    if (!checklistContainer) return;
    checklistContainer.innerHTML = `
        <div class="custom-table-wrapper">
            <table class="dimensions-table">
                <thead>
                    <tr>
                        ${tableData.headers.map(h => `<th>${h}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${tableData.rows.map(row => `
                        <tr>
                            ${row.map(cell => `<td>${cell}</td>`).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}
function renderSpecs(items) {
    if (!specsContainer) return;
    specsContainer.innerHTML = '';

    const grid = document.createElement('div');
    grid.className = 'specs-grid';

    items.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'spec-grid-item';

        // If icon is provided, use it. Otherwise fall back to text label
        if (item.icon) {
            div.innerHTML = `
                <div class="spec-icon-wrapper">
                    <img src="${item.icon}" alt="${item.label}" class="spec-grid-icon">
                </div>
                <div class="spec-text-wrapper">
                    <span class="spec-label">${item.label}</span>
                    <span class="spec-value">${item.value}</span>
                </div>
            `;
        } else {
            div.className = 'spec-item'; // Revert to old style for simple items
            div.innerHTML = `
                <span class="label">${i18n.t(`spec_label_${item.label.toLowerCase().replace(/ /g, '_')}`, item.label)}</span>
                <span class="value">${i18n.t(`spec_value_${item.value.toLowerCase().replace(/ /g, '_')}`, item.value)}</span>
            `;
        }
        grid.appendChild(div);
    });
    specsContainer.appendChild(grid);
}

function updateNavState(index) {
    navItems.forEach(item => item.classList.remove('active'));
    // Find item that matches current step ID (more robust than index match if lists differ)
    // Find item that matches current step ID OR maps to Installation (ID 3)
    const currentStep = stepsData[index];
    let targetNavId = currentStep.id;

    // If it's a sub-step of a category, highlight the main category tab
    if (currentStep.category === "installation") {
        targetNavId = 3;
    } else if (currentStep.category === "flushing") {
        targetNavId = 4;
    }

    const matchingNavItem = Array.from(navItems).find(item => Number(item.dataset.step) === targetNavId);
    if (matchingNavItem) {
        matchingNavItem.classList.add('active');
    }
}

// New: Add Navigation Buttons dynamically
function addNavigationControls() {
    // Only add if not already present
    if (document.querySelector('.step-navigation-btns')) return;

    const stepInfo = document.querySelector('.step-info');
    if (!stepInfo) return; // Defensive check

    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'step-navigation-btns';
    controlsDiv.innerHTML = `
        <button id="prev-step" class="control-btn-nav" data-i18n="btn_prev">${i18n.t('btn_prev', '← Previous')}</button>
        <button id="next-step" class="control-btn-nav" data-i18n="btn_next">${i18n.t('btn_next', 'Next Step →')}</button>
    `;
    // Append to step-info container
    stepInfo.appendChild(controlsDiv);

    // Logic
    document.getElementById('prev-step').addEventListener('click', () => {
        const currentStep = stepsData[currentStepIndex];

        if (currentStep.category) {
            const categorySteps = stepsData.filter(s => s.category === currentStep.category);
            const firstCategoryStep = categorySteps[0];
            if (currentStep.id === firstCategoryStep.id) return;
        }

        if (currentStepIndex > 0) {
            currentStepIndex--;
            renderStep(currentStepIndex);
        }
    });

    document.getElementById('next-step').addEventListener('click', () => {
        const currentStep = stepsData[currentStepIndex];

        if (currentStep.category) {
            const categorySteps = stepsData.filter(s => s.category === currentStep.category);
            const lastCategoryStep = categorySteps[categorySteps.length - 1];
            if (currentStep.id === lastCategoryStep.id) return;
        }

        if (currentStepIndex < stepsData.length - 1) {
            currentStepIndex++;
            renderStep(currentStepIndex);
        }
    });
}



// Theme Logic
function setTheme(mode) {
    localStorage.setItem(THEME_KEY, mode);
    if (mode === 'dark') {
        body.classList.add('dark-mode');
        if (themeLabel) themeLabel.textContent = 'Dark';
    } else {
        body.classList.remove('dark-mode');
        if (themeLabel) themeLabel.textContent = 'Light';
    }
}

// Event Listeners
function attachEventListeners() {
    // Robust Navigation
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const stepId = Number(item.dataset.step);
            const index = stepsData.findIndex(s => s.id === stepId);
            if (index !== -1) {
                currentStepIndex = index;
                renderStep(index);
            }
        });

        // Keyboard navigation for nav items
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                item.click();
            }
        });
    });

    // Theme Toggle
    if (themeToggle) {
        themeToggle.addEventListener('change', (e) => {
            setTheme(e.target.checked ? 'dark' : 'light');
        });
    }
}


// Keyboard Navigation
function handleKeyboardShortcuts(e) {
    // Don't trigger if user is typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    switch (e.key) {
        case 'ArrowLeft':
            e.preventDefault();
            document.getElementById('prev-step')?.click();
            break;
        case 'ArrowRight':
            e.preventDefault();
            document.getElementById('next-step')?.click();
            break;
    }
}

// Start App
// Removed premature init() call to fix layout calculations.


// Add keyboard shortcuts
document.addEventListener('keydown', handleKeyboardShortcuts);

// Landing Page Logic
document.addEventListener('DOMContentLoaded', () => {
    const viewManualBtn = document.getElementById('view-manual-btn');
    const landingPage = document.getElementById('landing-page');
    const appContainer = document.querySelector('.app-container');

    const hasOpened = localStorage.getItem('manual-opened');

    /*
    if (hasOpened === 'true' && landingPage && appContainer) {
        landingPage.classList.add('hidden');
        appContainer.classList.remove('hidden');
        setTimeout(() => {
            init();
            window.dispatchEvent(new Event('resize'));
            appContainer.classList.add('ready');
        }, 50);
    }
    */

    if (viewManualBtn && landingPage && appContainer) {
        viewManualBtn.addEventListener('click', () => {
            localStorage.setItem('manual-opened', 'true');

            landingPage.classList.add('hidden');

            appContainer.classList.remove('hidden');
            appContainer.classList.add('ready'); // 👈 Make visible FIRST

            init(); // 👈 Then initialize
        });
    }
});

if (replayBtn && mainImage) {
    replayBtn.addEventListener('click', () => {

        const cleanSrc = mainImage.src.split("?")[0];
        mainImage.src = cleanSrc + "?t=" + new Date().getTime();

    });
}

// Branding Page Back Logic
document.addEventListener('DOMContentLoaded', () => {
    const backBtn = document.getElementById('back-to-manual-btn');
    const brandingPage = document.getElementById('branding-page');
    const appContainer = document.querySelector('.app-container');

    if (backBtn) {
        backBtn.addEventListener('click', function () {
            if (brandingPage) brandingPage.classList.add('hidden');
            if (appContainer) appContainer.classList.remove('hidden');
        });
    }
});

