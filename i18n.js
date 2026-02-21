/**
 * Internationalization (i18n) Framework for Uponor Interactive Manual
 * Refactored to use local JavaScript objects to support file:// protocol.
 */

const DEBUG = false;

class i18NManager {
    constructor() {
        this.registry = [
            { region: "Global", language: "English", language_code: "en", country_code: null, locale: "en", flag: "", isGlobal: true },


            { region: "Bulgaria", language: "Bălgarski", language_code: "bg", country_code: "BG", locale: "bg-BG", flag: "🇧🇬" },



            { region: "Croatia", language: "Hrvatski", language_code: "hr", country_code: "HR", locale: "hr-HR", flag: "🇭🇷" },
            { region: "Czech Republic", language: "Čeština", language_code: "cs", country_code: "CZ", locale: "cs-CZ", flag: "🇨🇿" },
            { region: "Denmark", language: "Dansk", language_code: "da", country_code: "DK", locale: "da-DK", flag: "🇩🇰" },
            { region: "Estonia", language: "Eesti keel", language_code: "et", country_code: "EE", locale: "et-EE", flag: "🇪🇪" },
            { region: "Finland", language: "Suomi", language_code: "fi", country_code: "FI", locale: "fi-FI", flag: "🇫🇮" },
            { region: "France", language: "Français", language_code: "fr", country_code: "FR", locale: "fr-FR", flag: "🇫🇷" },
            { region: "Germany", language: "Deutsch", language_code: "de", country_code: "DE", locale: "de-DE", flag: "🇩🇪" },
            { region: "Hungary", language: "Magyar", language_code: "hu", country_code: "HU", locale: "hu-HU", flag: "🇭🇺" },
            { region: "Italy", language: "Italiano", language_code: "it", country_code: "IT", locale: "it-IT", flag: "🇮🇹" },
            { region: "Latvia", language: "Latviski", language_code: "lv", country_code: "LV", locale: "lv-LV", flag: "🇱🇻" },
            { region: "Lithuania", language: "Lietuvis", language_code: "lt", country_code: "LT", locale: "lt-LT", flag: "🇱🇹" },
            { region: "Netherlands", language: "Nederlands", language_code: "nl", country_code: "NL", locale: "nl-NL", flag: "🇳🇱" },
            { region: "Norway", language: "Norsk", language_code: "nb", country_code: "NO", locale: "nb-NO", flag: "🇳🇴" },
            { region: "Poland", language: "Polski", language_code: "pl", country_code: "PL", locale: "pl-PL", flag: "🇵🇱" },
            { region: "Portugal", language: "Português", language_code: "pt", country_code: "PT", locale: "pt-PT", flag: "🇵🇹" },
            { region: "Romania", language: "Română", language_code: "ro", country_code: "RO", locale: "ro-RO", flag: "🇷🇴" },
            { region: "Serbia", language: "Srpski", language_code: "sr", country_code: "RS", locale: "sr-RS", flag: "🇷🇸" },

            { region: "Slovakia", language: "Slovenský", language_code: "sk", country_code: "SK", locale: "sk-SK", flag: "🇸🇰" },
            { region: "Slovenia", language: "Slovenščina", language_code: "sl", country_code: "SI", locale: "sl-SI", flag: "🇸🇮" },
            { region: "Spain", language: "Español", language_code: "es", country_code: "ES", locale: "es-ES", flag: "🇪🇸" },
            { region: "Sweden", language: "Svenska", language_code: "sv", country_code: "SE", locale: "sv-SE", flag: "🇸🇪" },

            { region: "Ukraine", language: "Ukrayins’ka", language_code: "uk", country_code: "UA", locale: "uk-UA", flag: "🇺🇦" },


        ];

        this.currentLanguage = 'en';
        this.translations = {};
        this.STORAGE_KEY = 'uponor-manual-lang';
    }

    init() {
        const savedLang = localStorage.getItem(this.STORAGE_KEY);
        const browserLang = this.detectBrowserLanguage();
        this.currentLanguage = savedLang || browserLang || 'en';

        this.loadTranslations(this.currentLanguage);
        this.renderLanguageSelector();
        this.translatePage();
    }

    detectBrowserLanguage() {
        const lang = navigator.language || navigator.userLanguage;
        if (!lang) return null;

        let match = this.registry.find(l => l.locale.toLowerCase() === lang.toLowerCase());
        if (match) return match.locale;

        const baseLang = lang.split('-')[0].toLowerCase();
        match = this.registry.find(l => l.language_code.toLowerCase() === baseLang);
        return match ? match.locale : null;
    }

    loadTranslations(locale) {
        // 1. Try exact match first (unlikely but safe)
        if (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS[locale]) {
            this.translations = TRANSLATIONS[locale];
            return;
        }

        // 2. Base language fallback (MOST IMPORTANT)
        // Extract base language code (e.g., "en" from "en-US", "de" from "de-AT")
        const baseLang = locale.split('-')[0];

        if (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS[baseLang]) {
            if (DEBUG) console.warn(`[i18n] Fallback: ${locale} → ${baseLang}`);
            this.translations = TRANSLATIONS[baseLang];
            return;
        }

        // 3. No translation found
        if (DEBUG) console.warn(`[i18n] No translations found for ${locale} or ${baseLang}`);
        this.translations = {};
    }

    setLanguage(locale) {
        if (this.currentLanguage === locale) return;

        document.body.classList.add('language-changing');

        setTimeout(() => {
            this.currentLanguage = locale;
            document.documentElement.lang = locale;
            localStorage.setItem(this.STORAGE_KEY, locale);

            // Load new translations
            this.loadTranslations(locale);

            // Re-render current step without reloading
            if (typeof renderStep === 'function' && typeof currentStepIndex !== 'undefined') {
                renderStep(currentStepIndex);
            }

            // Re-translate static UI
            this.translatePage();

            // Re-render selector to update active state
            this.renderLanguageSelector();

            // Update nav highlight
            if (typeof updateNavState === 'function') {
                updateNavState(currentStepIndex);
            }

            document.body.classList.remove('language-changing');
        }, 150);
    }
    t(key, defaultValue) {
        if (this.translations && Object.prototype.hasOwnProperty.call(this.translations, key)) {
            return this.translations[key];
        }

        // Log missing key warning
        if (!defaultValue && DEBUG) {
            console.warn(`[i18n] Missing translation key: "${key}" for locale: ${this.currentLanguage}`);
        }

        // If defaultValue is provided (including empty string), return it. Otherwise return the key.
        return (typeof defaultValue !== 'undefined') ? defaultValue : key;
    }

    translatePage() {
        // Translate elements with data-i18n attribute
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = this.t(key);
            if (translation !== key) {
                // If the element has children (like headers with icons), we should be careful.
                const icon = el.querySelector('svg');
                if (icon) {
                    const iconHTML = icon.outerHTML;
                    el.innerHTML = `${iconHTML} ${translation}`;
                } else {
                    el.innerText = translation;
                }
            }
        });

        // Translate Title 
        const stepTitle = document.getElementById('current-step-title');
        if (stepTitle) {
            const stepId = typeof currentStepIndex !== 'undefined' && stepsData[currentStepIndex] ? stepsData[currentStepIndex].id : null;
            if (stepId) {
                stepTitle.innerText = this.t(`step_${stepId}_title`, stepsData[currentStepIndex].title);
            }
        }

        // Translate Description
        const stepDesc = document.getElementById('current-step-desc');
        if (stepDesc) {
            const stepId = typeof currentStepIndex !== 'undefined' && stepsData[currentStepIndex] ? stepsData[currentStepIndex].id : null;
            if (stepId) {
                stepDesc.innerText = this.t(`step_${stepId}_desc`, stepsData[currentStepIndex].description);
            }
        }
    }

    getDisplayName(item) {
        if (item.isGlobal) return item.region.toUpperCase();
        return item.region;
    }

    renderLanguageSelector() {
        const container = document.getElementById('language-selector-container');
        if (!container) return;

        const current = this.registry.find(l => l.locale === this.currentLanguage) || this.registry[0];

        container.innerHTML = `
            <div class="lang-selector">
                <button class="lang-toggle" id="lang-toggle-btn" aria-expanded="false" aria-label="Select Language">
                    <span class="current-lang-info">
                        ${current.flag ? `<span class="flag-icon">${current.flag}</span>` : ''}
                        <span class="current-lang-name ${current.isGlobal ? 'is-global' : ''}">${this.getDisplayName(current)}</span>
                    </span>
                    <span class="chevron">▼</span>
                </button>
                <div class="lang-dropdown" id="lang-dropdown">
                    <div class="lang-search-wrapper">
                        <input type="text" id="lang-search" placeholder="Search language..." autocomplete="off" aria-label="Search language">
                    </div>
                    <ul class="lang-list" id="lang-list">
                        ${this.registry.map(l => `
                            <li class="lang-item ${l.locale === this.currentLanguage ? 'active' : ''} ${l.isGlobal ? 'global-item' : ''}" data-locale="${l.locale}">
                                ${l.flag ? `<span class="flag-icon">${l.flag}</span>` : ''}
                                <span class="lang-text">${this.getDisplayName(l)}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        `;

        this.attachSelectorEvents();
    }

    attachSelectorEvents() {
        const toggle = document.getElementById('lang-toggle-btn');
        const dropdown = document.getElementById('lang-dropdown');
        const search = document.getElementById('lang-search');
        const list = document.getElementById('lang-list');

        if (!toggle) return;

        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
            if (dropdown.classList.contains('show')) {
                search.focus();
            }
        });

        search.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const items = list.querySelectorAll('.lang-item');
            items.forEach(item => {
                const text = item.textContent.toLowerCase();
                item.style.display = text.includes(term) ? 'flex' : 'none';
            });
        });

        list.addEventListener('click', (e) => {
            const item = e.target.closest('.lang-item');
            if (item) {
                const locale = item.dataset.locale;
                this.setLanguage(locale);
            }
        });

        document.addEventListener('click', (e) => {
            if (!toggle.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    window.i18n = new i18NManager();
    window.i18n.init();
});
