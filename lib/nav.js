(function() {
    const $ = s => document.querySelector(s);
    const input = $("#pasteConvertUrl");
    const clear = $("#clearInputConvertBtn");
    const convert = $("#converter-btn");
    const loading = $("#loading-converter");
    const results = $("#converter-results");
    const videoBtn = $("#links-video");
    const audioBtn = $("#links-audio");
    const spin = $("#fetch-spinner");
    const preview = $("#preview-img-converter");
    const hostPlat = $("#host-plat");
    const hostTitle = $("#host-title");
    const downloadLink = $("#downloadLinke");
    const API = `https://sue-bill-pos-logic.trycloudflare.com`;
    let busy = false;
    let currentURL = null;
    let currentTitle = "media";
    function resetUI() {
        loading.classList.remove("active");
        results.classList.remove("active");
        preview.src = "";
        hostPlat.textContent = "";
        hostTitle.textContent = "";
        currentURL = null;
        currentTitle = "media";
    }
    function sanitize(name) {
        return name.replace(/[\\/:*?"<>|]/g, "").trim();
    }
    fetch(API + "/visit", {
        method: "POST", }) 
    async function fetchInfo(url) {
        const res = await fetch(`${API}/info`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                url
            })
        });
        if (!res.ok) throw new Error();
        return res.json();
    }
    async function download(type) {
        if (busy) {
            showToast("processing previous request", 1800);
            return;
        }
        try {
            busy = true;
            spin.classList.add("active");
            const res = await fetch(
                `${API}/fetch?url=${encodeURIComponent(currentURL)}&type=${type}`
            );
            if (!res.ok) throw new Error();
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            downloadLink.href = url;
            downloadLink.download =
            `${currentTitle}.${type === "video"?"mp4": "mp3"}`;
            downloadLink.click();
            setTimeout(()=>URL.revokeObjectURL(url), 1000);
        }catch {
            showToast("conversion failed", 2000);
        }finally {
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
    convert.onclick = async ()=> {
        if (busy) return;
        if (!navigator.onLine) {
            showToast("internet required", 3000);
            return;
        }
        const url = input.value.trim();
        if (!url || !url.startsWith("https://")) return;
        if (url === currentURL) return;
        resetUI();
        loading.classList.add("active");
        await new Promise(r => requestAnimationFrame(r));
        try {
            const info = await fetchInfo(url);
            if (!info || info.error) {
                throw new Error();
            }
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
            `${info.platform || "Media"} - ${info.uploader || "-"}`;
            hostTitle.textContent =
            info.title || "No Title";
            loading.classList.remove("active");
            results.classList.add("active");
        }catch {
            resetUI();
            showToast("failed to fetch media info", 2000);
        }
    };
    clear.onclick = ()=> {
        input.value = "";
        input.focus();
    };
})();