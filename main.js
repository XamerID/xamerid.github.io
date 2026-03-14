// NAV
(function() {
    let coverEnabled = false;
    let filterEnabled = false;
    const showMetaEl = document.querySelector('#meta-audio-area');
    const showEqEl = document.querySelector('#eq-audio-area');
    const showSetupEl = document.querySelector('#setup-audio-area');
    const viewPopupMenu = document.querySelector('#viewPopupMenu');

    const albumArtWrap = document.querySelector(".change-album-art");
    const changeCoverWrap = document.querySelector(".change-cover-header");

    const openFilterBtn = document.querySelector('#filterBtn');
    const showFilterEl = document.querySelector('#filter-mode');

    const dateSeved = document.querySelector('#date-seved');

    const sideMenu = document.querySelector('#sideMenu');
    const menuBtn = document.querySelector('#menuBtn');

    // UTILITIES
    function hideAllPanels() {
        [showMetaEl, showEqEl,
        showSetupEl,
        showFilterEl,
        openFilterBtn].forEach(e => e.classList.remove('active'));
        
        document.body.style.overflow = '';
    }
    
    function fadeAllPanels(nav) {
       nav.classList.add('active');
       document.body.style.overflow = 'hidden';
    }

    // Open “Meta” panel (ID3)
    document.querySelector('#openMetaBtn').addEventListener('click',
        () => {
            fadeAllPanels(showMetaEl);
        });
    document.querySelector('#closeMetaBtn').addEventListener('click',
        () => {
            showMetaEl.classList.remove('active');
            document.body.style.overflow = '';
        });

    // open cover-ART
    document.querySelector('#showCoverBtn').addEventListener('click',
        () => {
            albumArtWrap.classList.toggle('show');
            changeCoverWrap.classList.toggle('show');
        });

    // Open “EQ” 1
    document.querySelector('#opqBtn').addEventListener('click',
        () => {
            hideAllPanels();
            fadeAllPanels(showEqEl);
        });
    // Open “EQ” 2
    document.querySelector('#openEqBtn').addEventListener('click',
        () => fadeAllPanels(showEqEl));

    document.querySelector('#closeEqBtn').addEventListener('click',
        () => {showEqEl.classList.remove('active');document.body.style.overflow = '';});

    // Open “setup” 1
    document.querySelector('#openSetupBtn').addEventListener('click',
        () => {
            if (!areData) return showToast('no audio data');
            hideAllPanels();
            fadeAllPanels(showSetupEl);
        });
    document.querySelector('#closeSetupBtn').addEventListener('click',
        () => hideAllPanels());

    // open "popup"
    document.querySelector('#now-playing-preview').addEventListener('click',
        (e) => {
            e.stopPropagation();
            viewPopupMenu.classList.add('active');
        });
    document.querySelector('#closePopupBtn').addEventListener('click',
        (e) => {
            e.stopPropagation();
            viewPopupMenu.classList.remove('active');
        });

    // FILTER MUSIC
    function hideFilterPanels() {
        filterEnabled = !filterEnabled;
        if (filterEnabled) {
            showFilterEl.classList.add('active');
            openFilterBtn.classList.add('active');
        } else {
            hideAllPanels();
        }
    }
    filterBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        hideAllPanels();
        hideFilterPanels();
    });

    document.querySelector('#dateBtn').addEventListener('click', () => {
        dateSeved.classList.toggle('hidden');
    });

    // SIDE MENU...
    document.querySelector('#menuBtn').addEventListener("click", () => fadeAllPanels(sideMenu));
    
    document.addEventListener("click", (e) => {
        if (e.target === sideMenu) {
            sideMenu.classList.remove('active');
            dateSeved.classList.add('hidden');
            document.body.style.overflow = '';
        }
    });

    /* Utility: country code > emoji  */
    function countryCodeToEmoji(countryCode) {
        if (!countryCode || countryCode.length !== 2) return '';
        const A = 0x1F1E6 - 65;
        return [...countryCode.toUpperCase()]
        .map(c => String.fromCodePoint(A + c.charCodeAt(0)))
        .join('');
    }

    /* Mapping bahasa > negara default */ const languageToDefaultCountry = {
        en: 'US',
        es: 'ES',
        fr: 'FR',
        de: 'DE',
        pt: 'PT',
        pt_BR: 'BR',
        ru: 'RU',
        ja: 'JP',
        ko: 'KR',
        zh: 'CN',
        id: 'ID',
        ar: 'SA'
    };

    /* Mapping zona waktu per negara */
    const countryTimezones = {
        ID: {
            label: 'WIB',
            tz: 'Asia/Jakarta'
        },
        US: {
            label: 'EST',
            tz: 'America/New_York'
        },
        JP: {
            label: 'JST',
            tz: 'Asia/Tokyo'
        },
        CN: {
            label: 'CST',
            tz: 'Asia/Shanghai'
        },
        FR: {
            label: 'CET',
            tz: 'Europe/Paris'
        },
        DE: {
            label: 'CET',
            tz: 'Europe/Berlin'
        },
        SA: {
            label: 'AST',
            tz: 'Asia/Riyadh'
        },
        IN: {
            label: 'IST',
            tz: 'Asia/Kolkata'
        },
        KR: {
            label: 'KST',
            tz: 'Asia/Seoul'
        },
        BR: {
            label: 'BRT',
            tz: 'America/Sao_Paulo'
        },
        TR: {
            label: 'TRT',
            tz: 'Europe/Istanbul'
        }
    };

    /* Dapatkan locale pengguna */
    function getUserLocale() {
        const nav = navigator.languages && navigator.languages.length ? navigator.languages[0]: null;
        return nav || navigator.language || 'en-US';
    }

    /* Parsing locale menjadi { language, region } */
    function parseLocale(locale) {
        const clean = (locale || '').replace('_', '-');
        const parts = clean.split('-').filter(Boolean);
        const language = parts[0] ? parts[0].toLowerCase(): '';
        const region = parts.find(p => p.length === 2) ? parts.find(p => p.length === 2).toUpperCase(): null;
        return {
            language,
            region
        };
    }

    /* Ambil negara & zona waktu dari locale */
    function getCountryAndTimezone() {
        const locale = getUserLocale();
        const {
            language,
            region
        } = parseLocale(locale);
        const country = region || languageToDefaultCountry[language] || 'US';
        const tzInfo = countryTimezones[country] || {
            label: 'UTC',
            tz: 'UTC'
        };
        return {
            locale,
            country,
            tzInfo
        };
    }

    /* Format tanggal & waktu real-time */
    function formatDateTime(tzInfo) {
        const now = new Date();
        const options = {
            timeZone: tzInfo.tz,
            /*year: 'numeric',
month: '2-digit',
day: '2-digit',*/
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };
        const parts = new Intl.DateTimeFormat(undefined, options).formatToParts(now);
        const get = type => parts.find(p => p.type === type)?.value || '';
        return `${get('hour')}:${get('minute')}:${get('second')}`;
    }

    /* Render watermark */
    function renderLangWatermark(opts = {
        useSvg: false
    }) {
        const wrap = document.getElementById('langWatermark');
        if (!wrap) return;

        const {
            locale,
            country,
            tzInfo
        } = getCountryAndTimezone();
        const emoji = countryCodeToEmoji(country);
        const flagSvgUrl = `https://flagcdn.com/${country.toLowerCase()}.svg`;
        const timeFormatted = formatDateTime(tzInfo);

        wrap.innerHTML = '';

        const flagEl = opts.useSvg
        ? Object.assign(document.createElement('img'), {
            src: flagSvgUrl, className: 'lang-flag-img', loading: 'lazy'
        }): Object.assign(document.createElement('span'), {
            className: 'lang-flag-emoji', textContent: emoji || '+'
        });

        const text = document.createElement('span');
        text.className = 'lang-text';
        text.textContent = `${country} – ${tzInfo.label} ${timeFormatted}`;

        wrap.append(flagEl, text);
    }
    /* init & update tiap 1 detik */
    renderLangWatermark( {
        useSvg: false
    });
    setInterval(() => renderLangWatermark( {
        useSvg: false
    }), 1000);

})();