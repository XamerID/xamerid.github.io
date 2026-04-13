(function() {
    const input = dot("#pasteConvertUrl");
    const clear = dot("#clearInputConvertBtn");
    const cleanBtn = dot("#clean-links-convert");
    const convert = dot("#converter-btn");
    const loading = dot("#loading-converter");
    const results = dot("#converter-results");
    const videoBtn = dot("#links-video");
    const audioBtn = dot("#links-audio");
    const spin = dot("#fetch-spinner");
    const preview = dot("#preview-img-converter");
    const hostPlat = dot("#host-plat");
    const hostTitle = dot("#host-title");
    const downloadLink = dot("#downloadLinke");
    const API = "https://finished-fishing-performance-powder.trycloudflare.com";
    let ua = "";
    let busy = false;
    let currentURL = null;
    let currentTitle = "";
    function lang_usage() {
        const loc = (navigator.languages?.[0] || navigator.language || "en-US").replace("_", "-");
        const pt = loc.split("-");
        const cd = pt.find((p, i)=> i > 0 && p.length === 2)?.toUpperCase() || "US";
        const cn = new Intl.DisplayNames([loc], {
            type: "region"
        }).of(cd).toUpperCase();
        ua = cn;
        dot('#langWatermark').textContent = `${cn} - ${cd}`;
        setInterval(1000);
    }
     async function update() {
        await lang_usage();

        fetch(API + "/visit", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ua
            })
        });
    }
    update(); 

    function resetUI() {
        busy = false;
        currentURL = null;
        [loading, results].forEach(el => el.classList.remove("active"));
        preview.src = "";
        hostPlat.textContent = "";
        hostTitle.textContent = "";
        currentTitle = "media";
    }
    function sanitize(name) {
        return name.replace(/[\\/:*?"<>|]/g, "").trim();
    }
    async function fetchInfo(url) {
        const response = await fetch(`${API}/info`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                url
            })
        });
        if (!response.ok) {
            const data = await response.json();
            showToast(data.error, 2000);
            return;
        }
        return response.json();
    }
    async function download(type) {
        if (busy) {
            showToast("processing previous request", 1800);
            return;
        }
        try {
            busy = true;
            spin.classList.add("active");
            const response = await fetch(
                `${API}/fetch?url=${encodeURIComponent(currentURL)}&type=${type}`
            );
            if (!response.ok) {
                const data = await response.json();
                showToast(data.error, 2000);
                return;
            }
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            downloadLink.href = url;
            downloadLink.download =
            `${currentTitle}.${type === "video"?"mp4": "mp3"}`;
            downloadLink.click();
            setTimeout(()=> {
                URL.revokeObjectURL(url);
                showToast(`${type} saved ✓`)
            }, 1000);
        } catch {
            showToast("conversion failed", 2000);
        } finally {
            spin.classList.remove("active");
            busy = false;
        }
    }
    function fastThumbnail(url) {
        preview.onerror = ()=> {
            const params = new URLSearchParams();
            params.append("url", url);
            preview.src =
            `${API}/proxy-img?${params.toString()}`;
        };
        preview.src = url;
    }

    videoBtn.onclick = ()=>download("video");
    audioBtn.onclick = ()=>download("audio");

    convert.onclick = async () => {
        if (busy) return;
        if (!navigator.onLine) {
            alert("internet required");
            return;
        }
        const url = input.value.trim();
        if (!url) return;

        let validated;

        try {
            validated = new URL(url);
        } catch {
            showToast("invalid URL", 1800);
            return;
        }
        if (!['http:', 'https:'].includes(validated.protocol)) {
            showToast("invalid protocol", 1800);
            return;
        }
        const domains = ['youtube.com','youtu.be', 'instagram.com','tiktok.com'];
        const hostname = validated.hostname.replace(/^www\./, '');
        const isValid = domains.some(domain =>
            hostname === domain ||
            hostname.endsWith("." + domain)
        );
        if (!isValid) {
            showToast("platform not supported!", 1800);
            return;
        }
        if (url === currentURL) return;

        resetUI();
        loading.classList.add("active");
        busy = true;
        await new Promise(r => requestAnimationFrame(r));
        try {
            const info = await fetchInfo(url);
            if (!info || info.error) {
                throw new Error();
            };
            if (info.duration > 750) {
                showToast("maximum duration 7 minutes", 2000);
                resetUI();
                return;
            }
            currentURL = url;
            currentTitle = sanitize(info.title || "media");
            if (info.thumbnail) {
                await fastThumbnail(info.thumbnail);
            } else {
                preview.src = "";
            }
            hostPlat.textContent =
            `${info.platform || "Media"} - ${info.uploader || "@user"}`;
            hostTitle.textContent = info.title || "No Title";
            loading.classList.remove("active");
            results.classList.add("active");
            busy = false;
        } catch {
            resetUI();
            showToast("Failed to fetch media info", 2000);
        }
    };
    clear.onclick = ()=> {
        input.value = "";
        input.focus();
    };
    cleanBtn.onclick = () => {
        input.value = "";
        resetUI();
    };
})();