(function() {
    const inputIpv = document.querySelector("#pasteConvertUrl");
    const clearIpv = document.querySelector("#clearInputConvertBtn");
    const converter = document.querySelector("#converter-btn");
    const downloadLinkCt = document.querySelector("#downloadLinkCt");
    const land = document.querySelector("#loading-converter");
    const results = document.querySelector("#converter-results");
    const linksVideo = document.querySelector("#links-video");
    const linksAudio = document.querySelector("#links-audio");
    const spinVideo = document.querySelector("#spinner-videos");
    const spinAudio = document.querySelector("#spinner-audios");
    const previewImg = document.querySelector("#preview-img-converter");
    const hostIN = {
        plat: document.querySelector("#host-plat"),
        by: document.querySelector("#host-by"),
        title: document.querySelector("#host-title")
    };
    const API = "https://myers-biodiversity-modification-position.trycloudflare.com";
    let converting = false;
    let current_Title = "media";
    let current_process = null;
    function resetConvertUI() {
        results.classList.add("hidden");
        land.classList.remove("active");
        current_Title = "media";
        current_process = null;
        previewImg.src = '';
        Object.keys(hostIN).forEach(key => 
                hostIN[key].textContent = '');
    }
    function sanitizeFilename(name) {
        return name.replace(/[\\/:*?"<>|]/g, "").trim();
    }
    async function fetchInfo(url, retries = 3, timeout = 15000) {
        for (let i = 0; i < retries; i++) {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), timeout);
            try {
                const res = await fetch(`${API}/info`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify({
                        url
                    }),
                    signal: controller.signal
                });
                clearTimeout(timer);
                const text = await res.text();
                const data = text ? JSON.parse(text): {};
                if (!res.ok) {
                    throw new Error(data.error || `Server Error (${res.status})`);
                }
                if (!data) {
                    throw new Error("Format data tidak valid");
                }
                return data;
            } catch (err) {
                clearTimeout(timer);
                if (i === retries - 1) {
                    throw err;
                }
                await new Promise(r => setTimeout(r, 1500 * (i + 1)));
            }
        }
    }
    function handleDownload(btn, spin, url, type) {
        btn.onclick = async () => {
            if (converting) {
                showToast("loading previous data", 1800);
                return;
            }
            try {
                converting = true;
                spin.classList.add("active");
                const res = await fetch(
                    `${API}/fetch?url=${encodeURIComponent(url)}&type=${type}`
                );
                if (!res.ok) throw new Error();
                const blob = await res.blob();
                const downloadUrl = URL.createObjectURL(blob);
                downloadLinkCt.href = downloadUrl;
                downloadLinkCt.download = `${current_Title}.${type === "video" ? "mp4": "mp3"}`;
                downloadLinkCt.click();
                URL.revokeObjectURL(downloadUrl);
            } catch {
                alert("conversion failed");
            } finally {
                converting = false;
                spin.classList.remove("active");
            }
        };
    }
    function setupDownloadButtons(url) {
        handleDownload(linksVideo, spinVideo, url, "video");
        handleDownload(linksAudio, spinAudio, url, "audio");
        land.classList.remove("active");
        results.classList.remove("hidden");
    }
    function blankThumbnailConvert() {
        const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="640" height="360">
        <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#111"/>
        <stop offset="100%" stop-color="#333"/>
        </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#g)"/>
        <text x="50%" y="50%"
        dominant-baseline="middle"
        text-anchor="middle"
        fill="#fff"
        font-size="28"
        font-family="sans-serif">
        No Preview
        </text>
        </svg>
        `;
        return "data:image/svg+xml," + encodeURIComponent(svg);
    }
    const blankFB = blankThumbnailConvert();
    converter.addEventListener("click", async () => {
        if (!navigator.onLine) {
            showToast("internet required", 3600);
            return;
        }
        let url = inputIpv.value.trim();
        if (!url || !url.startsWith("https://"))
            return;
        if (url === current_process) return;
        await resetConvertUI();
        land.classList.add("active");
        try {
            const info = await fetchInfo(url);
            if (info.error) {
                throw new Error("unsupported media");
            }
            current_process = url;
            current_Title = sanitizeFilename(info.title || "media");
            if (info.thumbnail && previewImg) {
                const params = new URLSearchParams();
                params.append("url", info.thumbnail);
                const finalProxyUrl = `${API}/proxy-img?${params.toString()}`;
                previewImg.onerror = () => {
                    previewImg.src = blankFB;
                    loading.classList.remove("active");
                };
                previewImg.src = finalProxyUrl;
                hostIN.plat.textContent = `${info.platform || 'Media'}`;
                hostIN.by.textContent = `${info.uploader || '-'}`;
                hostIN.title.textContent = `${info.title || 'No Title'}`;
            }
            setupDownloadButtons(url);
        } catch {
            resetConvertUI();
            showToast("failed to fetch media info", 1800);
        }
    });
    clearIpv.addEventListener("click",
        () => {
            if (!inputIpv.value.trim()) return;
            inputIpv.value = "";
        });
    fetch(API + "/visit", {
        method: "POST", }) 
}());