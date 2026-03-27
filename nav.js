(function() {
    let isFilter = false;
    const showMetaEl = document.querySelector('#meta-audio-area');
    const showEqEl = document.querySelector('#eq-audio-area');
    const showSetupEl = document.querySelector('#setup-audio-area');
    const viewPopupMenu = document.querySelector('#viewPopupMenu');
    const albumArtWrap = document.querySelector(".change-album-art");
    const coverWrap = document.querySelector(".change-cover-header");
    const openFil = document.querySelector('#filterBtn');
    const showFilterEl = document.querySelector('#filter-mode');
    const dateSeved = document.querySelector('#date-seved');
    const sideMenu = document.querySelector('#sideMenu');
    const menuBtn = document.querySelector('#menuBtn');
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    const body = document.body;
    function hideEP() {
        [showMetaEl, showEqEl,
            showSetupEl,
            showFilterEl,
            openFil].forEach(e => e.classList.remove('active'));
        body.style.overflow = '';
    }
    function fadeEP(nav) {
        nav.classList.add('active');
        body.style.overflow = 'hidden';
    }
    document.querySelector('#openMetaBtn').addEventListener('click',
        () => {
            fadeEP(showMetaEl);
            metaTheme.setAttribute('content', '#fff');
        });
    document.querySelector('#closeMetaBtn').addEventListener('click',
        () => {
            showMetaEl.classList.remove('active');
            metaTheme.setAttribute('content', 'rgba(20,20,20)');
            body.style.overflow = '';
        });
    document.querySelector('#showCoverBtn').addEventListener('click',
        () => {
            albumArtWrap.classList.toggle('show');
            coverWrap.classList.toggle('show');
        });
    document.querySelector('#opqBtn').addEventListener('click',
        () => {
            hideEP(); fadeEP(showEqEl);
        });
    document.querySelector('#openEqBtn').addEventListener('click',
        () => fadeEP(showEqEl));
    document.querySelector('#closeEqBtn').addEventListener('click',
        () => {
            showEqEl.classList.remove('active');
            body.style.overflow = '';
        });
    document.querySelector('#openSetupBtn').addEventListener('click',
        () => {
            if (!areData) return showToast('no audio data'); hideEP(); fadeEP(showSetupEl);
        });
    document.querySelector('#closeSetupBtn').addEventListener('click',
        () => hideEP());

    document.querySelector('#now-playing-preview').addEventListener('click',
        (e) => {
            e.stopPropagation(); viewPopupMenu.classList.add('active');
        });
    document.querySelector('#closePopupBtn').addEventListener('click',
        (e) => {
            e.stopPropagation(); viewPopupMenu.classList.remove('active');
        });

    function hideFilter() {
        isFilter = !isFilter;
        if (isFilter) {
            showFilterEl.classList.add('active');
            openFil.classList.add('active');
        } else {
            hideEP();
        }}
    filterBtn.addEventListener('click', (e) => {
        e.stopPropagation(); hideEP(); hideFilter();
    });
    document.querySelector('#dateBtn').addEventListener('click', () => {
        dateSeved.classList.toggle('hidden');
    });

    document.querySelector('#menuBtn').addEventListener("click", () => fadeEP(sideMenu));

    document.addEventListener("click", (e) => {
        if (e.target === sideMenu) {
            sideMenu.classList.remove('active');
            dateSeved.classList.add('hidden');
            body.style.overflow = '';
        }});
    
    function wm() {
        const w = document.getElementById('langWatermark');
        if (!w) return;
        const loc = (navigator.languages?.[0] || navigator.language || "en-US").replace("_", "-");
        const pt = loc.split("-");
        const cn = pt.find((p, i) => i > 0 && p.length === 2)?.toUpperCase() || "US";
        const nm = new Intl.DisplayNames([loc], {
            type: "region"
        }).of(cn).toUpperCase();
        w.textContent = `${nm} - ${cn}`;
    }
    wm();
    setInterval(wm, 1000);
})();