let toastNotif, toastMessage, toastEnabled = true;
document.addEventListener('DOMContentLoaded', async () => {
    const audioPlayer = document.querySelector('#audioPlayer');
    const cutAudioPlayer = document.querySelector('#cutAudioPlayer');
    const addFileBtn = document.querySelector('#addFileBtn');
    const fileInput = document.querySelector('#fileInput');
    const folderInput = document.querySelector('#folderInput');
    const musicList = document.querySelector('#music-list');
    const musicBtn = document.querySelector('#musicBtn');
    const artistBtn = document.querySelector('#artistBtn');
    const albumBtn = document.querySelector('#albumBtn');
    const genreBtn = document.querySelector('#genreBtn');
    const searchInput = document.querySelector('#searchInput');
    const clearSearchBtn = document.querySelector('#clearSearchBtn');
    const progressRange = document.querySelector('#progress-range');
    const progressBorder = document.querySelector('#progress-border');
    const playPauseBtn = document.querySelector('#playPauseBtn');
    const prevBtn = document.querySelector('#prevBtn');
    const nextBtn = document.querySelector('#nextBtn');
    const repeatBtn = document.querySelector('#repeatBtn');
    const currentTimes = document.querySelector('#currentTimes');
    const currentDurations = document.querySelector('#currentDurations');
    const animTL = document.querySelector("#active-track-animations");
    const playerItem = document.querySelector("#player-control-item");

    const eqToggleBtn = document.querySelector('#eqToggleBtn');
    const eqStatus = document.querySelector('#eq-status');
    const fadeInSlider = document.querySelector('#fadeIn');
    const fadeOutSlider = document.querySelector('#fadeOut');
    const fadeInValue = document.querySelector('#fadeInValue');
    const fadeOutValue = document.querySelector('#fadeOutValue');
    const audioBtn = document.querySelector('#audioBtn');
    const audioProgres = document.querySelector('#audioProgres');
    const currentPG = document.querySelector('#currentPG');
    const durationPG = document.querySelector('#durationPG');
    const startSlider = document.querySelector('#startSlider');
    const endSlider = document.querySelector('#endSlider');
    const formatTimesBtn = document.querySelector('#format-times-options');
    const cutStartTimes = document.querySelector('#cutStartTimes');
    const cutEndTimes = document.querySelector('#cutEndTimes');
    const duresult = document.querySelectorAll('.duration-of-selection-results');
    const listEdit = document.querySelector('#pre-list-edit');
    const preEdit = document.querySelector('#preview-editting');
    const getOutEdit = document.querySelector('#get-output-edit');
    const resetEditBtn = document.querySelector('#resetEditBtn');
    const apcx = document.querySelectorAll('.albumArtPreview');
    const albumArtInput = document.querySelector('#albumArtInput');
    const extrackAudioBtn = document.querySelector('#extrackAudioBtn');
    const confirmBox = document.querySelector('#sampleRateConfirm');
    const rateButtons = document.querySelectorAll('.rate-btn');
    const downloadLinka = document.querySelector('#downloadLinka');

    const openMusicBtn = document.querySelector('#openMusicBtn');
    const openConvertBtn = document.querySelector('#openConvertBtn');
    const convertPageEl = document.querySelector('#convertPageEl');
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
    toastNotif = document.querySelector('#toastNotif');
    toastMessage = document.querySelector(".toast-message");

    function showToast(message, duration = 900) {
        if (!toastEnabled) return;
        toastMessage.textContent = message;
        toastNotif.classList.add("show");
        setTimeout(() => {
            toastNotif.classList.remove("show");
        }, duration);
    }
    window.showToast = showToast;
    document.querySelector('#modeMessageBtn').addEventListener('click', () => {
        toastEnabled = !toastEnabled; modeMessageBtn.innerHTML = toastEnabled ? `<i class="fas fa-bell"></i>&nbsp;message`: `<i class="fas fa-bell-slash"></i>&nbsp;message`;
    });

    let musicFiles = [];
    let playingList = [];
    let currentIndex = -1;
    let deactiveSong = null;
    let isRepeat = false;
    let isPlaying = false;
    let isPreview = false;
    let isPlayer = false;
    let areData = null;
    let codData = null;
    let currentCutId = null;
    let isDecode = false;
    let asCounter = 0;
    let isFilter = false;
    let eqEnabled = false;
    let subEQ = 0;
    let m3EQ = 0;
    let m10EQ = 0;
    let h30EQ = 0;
    let h50EQ = 0;
    let h80EQ = 0;
    let h90EQ = 0;
    let bassEQ = 0;
    let bassBoostEQ = 0;
    let reverbEQ = 0;
    let virtualizerEQ = 0;
    let playbackEQ = 1;
    function biquad(ctx,
        type,
        freq,
        Q = 0,
        gain = 0) {
        const f = ctx.createBiquadFilter();
        f.type = type;
        f.frequency.value = freq;
        f.Q.value = Q;
        f.gain.value = gain;
        return f;
    }
    function reverbImpulse(ctx,
        duration = 2) {
        const rate = ctx.sampleRate;
        const length = rate * duration;
        const impulse = ctx.createBuffer(2,
            length,
            rate);
        for (let c = 0; c < 2; c++) {
            const channel = impulse.getChannelData(c);
            for (let i = 0; i < length; i++) {
                channel[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
            }
        }
        return impulse;
    }
    function createCompressor(ctx) {
        const m = ctx.createDynamicsCompressor();
        m.threshold.value = -5;
        m.knee.value = 20;
        m.ratio.value = 2;
        m.attack.value = 0.002;
        m.release.value = 0.04;
        return m;
    }
    function createLimiter(ctx) {
        const r = ctx.createDynamicsCompressor();
        r.threshold.value = -5;
        r.knee.value = 20;
        r.ratio.value = 9;
        r.attack.value = 0.003;
        r.release.value = 0.05;
        return r;
    }
    class equalizer {
        constructor() {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            this.main = this.audioCtx.createMediaElementSource(audioPlayer);
            this.cut = this.audioCtx.createMediaElementSource(cutAudioPlayer);
            this.s1 = biquad(this.audioCtx, 'lowshelf', 60);
            this.m3 = biquad(this.audioCtx, "peaking", 320, 1.2);
            this.m1 = biquad(this.audioCtx, "peaking", 1000, 1.2);
            this.h3 = biquad(this.audioCtx, "highshelf",
                3000);
            this.h5 = biquad(this.audioCtx, "highshelf",
                5000);
            this.h8 = biquad(this.audioCtx, "highshelf",
                8000);
            this.h9 = biquad(this.audioCtx, "highshelf",
                9000);
            this.b1 = biquad(this.audioCtx, "highpass",
                90);
            this.b2 = biquad(this.audioCtx, "peaking",
                70, 0.5);
            this.b3 = biquad(this.audioCtx, "lowpass",
                100);
            this.b4 = this.audioCtx.createGain();
            this.ba = biquad(this.audioCtx, "highpass",
                110);
            this.bb = biquad(this.audioCtx, "peaking",
                92,
                0.2);
            this.bc = biquad(this.audioCtx, "lowpass",
                140);
            this.bg = this.audioCtx.createGain();
            this.de = this.audioCtx.createDelay(5);
            this.de.delayTime.value = 0;
            this.df = this.audioCtx.createGain();
            this.df.gain.value = 0;
            this.dx = this.audioCtx.createGain();
            this.dx.gain.value = 0;
            this.vL = this.audioCtx.createGain();
            this.vR = this.audioCtx.createGain();
            this.vx = this.audioCtx.createGain();
            this.vx.gain.value = 0;
            this.sp = this.audioCtx.createChannelMerger(2);
            this.re = this.audioCtx.createConvolver();
            this.re.buffer = reverbImpulse(this.audioCtx, 2.5);
            this.rx = this.audioCtx.createGain();
            this.rx.gain.value = 0;
            this.vo = this.audioCtx.createGain();
            this.comp = createCompressor(this.audioCtx);
            this.limiter = createLimiter(this.audioCtx);
            this.merger = this.audioCtx.createGain();
            this.connect();
            this.bypass();
        }
        setSub(val) {
            this.s1.gain.value = subEQ = val;
        }
        setM3(val) {
            this.m3.gain.value = m3EQ = val;
        }
        setM10(val) {
            this.m1.gain.value = m10EQ = val;
        }
        setH30(val) {
            this.h3.gain.value = h30EQ = val;
        }
        setH50(val) {
            this.h5.gain.value = h50EQ = val;
        }
        setH80(val) {
            this.h8.gain.value = h80EQ = val;
        }
        setH90(val) {
            this.h9.gain.value = h90EQ = val;
        }
        setBass(val) {
            this.b2.gain.value = val * 10;
            this.b4.gain.value = val;
            bassEQ = val;
        }
        setBassBoost(val) {
            this.bb.gain.value = val * 10;
            this.bg.gain.value = val;
            this.vo.gain.value = 1 - (val * 0.2);
            bassBoostEQ = val;
        }
        setReverb(val) {
            this.rx.gain.value = reverbEQ = val;
        }
        setVirtualizer(val) {
            clearTimeout(this._echoUpdateTimer);
            this._last = val;
            this._echoUpdateTimer = setTimeout(() => {
                const smoothVal = this._last;
                const now = this.audioCtx.currentTime;
                this.de.delayTime.cancelScheduledValues(now);
                this.de.delayTime.linearRampToValueAtTime(0.002 + smoothVal * 0.05, now + 0.05);
                this.df.gain.cancelScheduledValues(now);
                this.df.gain.linearRampToValueAtTime(Math.min(0.05, 0.5 + smoothVal), now + 0.05);
                this.dx.gain.cancelScheduledValues(now);
                this.dx.gain.linearRampToValueAtTime(smoothVal, now + 0.5);
            }, 15);

            this.vL.gain.value = 1;
            this.vR.gain.value = 1;
            this.vx.gain.value = val * 0.5;
            virtualizerEQ = val;
        }
        setPlayback(val) {
            try {
                let rate = eqEnabled ? val: 1;
                const pitch = !eqEnabled;
                [audioPlayer,
                    cutAudioPlayer].forEach(player => {
                        player.preservesPitch = pitch;
                        player.mozPreservesPitch = pitch;
                        player.webkitPreservesPitch = pitch;
                        player.playbackRate = rate;
                    });
                playbackEQ = rate;
            } catch {}
        }
        connect() {
            [this.main,
                this.cut].forEach(source => {
                    try {
                        source.disconnect();
                        eqEnabled = true;
                        source.connect(this.s1).connect(this.m3).connect(this.m1).connect(this.h3).connect(this.h5).connect(this.h8).connect(this.h9).connect(this.vo);
                        source.connect(this.b1).connect(this.b2).connect(this.b3).connect(this.b4).connect(this.limiter);
                        source.connect(this.ba).connect(this.bb).connect(this.bc).connect(this.bg).connect(this.limiter);
                        this.limiter.connect(this.merger);
                        this.vo.connect(this.de).connect(this.df).connect(this.de).connect(this.dx).connect(this.merger);
                        this.vo.connect(this.vL).connect(this.vx);
                        this.vo.connect(this.vR).connect(this.vx);
                        this.vx.connect(this.sp).connect(this.merger);
                        this.vo.connect(this.re).connect(this.rx).connect(this.merger);
                        this.vo.connect(this.comp).connect(this.merger);
                        this.merger.connect(this.audioCtx.destination);
                    } catch {
                        source.disconnect();
                        eqEnabled = false;
                        source.connect(this.audioCtx.destination);
                    }});
        }
        bypass() {
            [this.main,
                this.cut].forEach(source => {
                    try {
                        source.disconnect();
                        eqEnabled = false;

                        source.connect(this.audioCtx.destination);
                    } catch (e) {}
                });
        }
    }
    const myEQ = new equalizer();

    document.addEventListener('click', async () => {
        if (myEQ.audioCtx.state === 'suspended') {
            await myEQ.audioCtx.resume();
        }},
        {
            once: true
        });

    const sliders = {
        sub: document.querySelector('#sub'),
        m3: document.querySelector('#m3'),
        m10: document.querySelector('#m10'),
        h30: document.querySelector('#h30'),
        h50: document.querySelector('#h50'),
        h80: document.querySelector('#h80'),
        h90: document.querySelector('#h90'),
        bass: document.querySelector('#bass'),
        bassBoost: document.querySelector('#bassBoost'),
        reverb: document.querySelector('#reverb'),
        virtualizer: document.querySelector('#virtualizer'),
        playback: document.querySelector('#playback')
    };
    const values = {
        sub: document.querySelector('#subValue'),
        m3: document.querySelector('#m3Value'),
        m10: document.querySelector('#m10Value'),
        h30: document.querySelector('#h30Value'),
        h50: document.querySelector('#h50Value'),
        h80: document.querySelector('#h80Value'),
        h90: document.querySelector('#h90Value'),
        bass: document.querySelector('#bassValue'),
        bassBoost: document.querySelector('#bassBoostValue'),
        reverb: document.querySelector('#reverbValue'),
        virtualizer: document.querySelector('#virtualizerValue'),
        playback: document.querySelector('#playbackValue')
    };
    const eventEQ = {
        sub: val => myEQ.setSub(val),
        m3: val => myEQ.setM3(val),
        m10: val => myEQ.setM10(val),
        h30: val => myEQ.setH30(val),
        h50: val => myEQ.setH50(val),
        h80: val => myEQ.setH80(val),
        h90: val => myEQ.setH90(val),
        bass: val => myEQ.setBass(val),
        bassBoost: val => myEQ.setBassBoost(val),
        reverb: val => myEQ.setReverb(val),
        virtualizer: val => myEQ.setVirtualizer(val),
        playback: val => myEQ.setPlayback(val)
    };
    function upEqRange(id) {
        const s = sliders[id];
        let v = values[id];
        if (!s || !v) return;
        let min = s.min ? parseFloat(s.min): 0;
        let max = s.max ? parseFloat(s.max): 100;
        let val = ((s.value - min) / (max - min)) * 100;
        v.textContent = parseFloat(s.value).toFixed(2);
        s.style.background = eqEnabled
        ? `linear-gradient(
        90deg,
        var(--eq-gradient-start) 0%,
        var(--eq-gradient-end) ${val}%,
        #000 ${val}%,
        #000 100%
        )`: `linear-gradient(
        90deg,
        #fff 0%,
        #fff ${val}%,
        #000 ${val}%,
        #000 100%
        )`;
    }
    Object.keys(sliders).forEach(id => {
        const s = sliders[id];
        let v = values[id];
        if (!s || !v) return;
        let lastVal = parseFloat(s.value);
        upEqRange(id);
        s.addEventListener("input", () => {
            let newVal = parseFloat(s.value);
            upEqRange(id);
            if (eqEnabled) v.style.color = newVal > lastVal ? "#fff000": "";
            lastVal = newVal;
            eventEQ[id]?.(newVal);
        });
        s.addEventListener("touchend",
            () => v.style.color = "");
    });
    function setEqRange() {
        Object.keys(eventEQ).forEach(id => {
            if (sliders[id]) {
                let v = parseFloat(sliders[id].value);
                eventEQ[id]?.(v);
                upEqRange(id);
            }});
    }
    eqToggleBtn.addEventListener('click',
        async () => {
            if (!eqEnabled) {
                await myEQ.connect();
            } else {
                await myEQ.bypass();
            }
            setEqRange();
            eqToggleBtn.innerHTML = eqEnabled
            ? `<i class="fas fa-toggle-on"></i>&nbsp; ON`: `<i class="fas fa-toggle-off"></i>&nbsp; OFF`;
            eqStatus.textContent = eqEnabled
            ? 'CONNECT': 'BYPASS';
        });
    function readEQ(key = null) {
        const n = 0.0;
        const v = {
            sub: n,
            m3: n,
            m10: n,
            h30: n,
            h50: n,
            h80: n,
            h90: n,
            bass: n,
            bassBoost: n,
            reverb: n,
            virtualizer: n,
            playback: 1.0
        };
        const apply = async (a) => {
            const s = sliders[a];
            if (!s) return;
            s.value = v[a];
            upEqRange(a);
            const map = {
                sub: "setSub",
                m3: "setM3",
                m10: "setM10",
                h30: "setH30",
                h50: "setH50",
                h80: "setH80",
                h90: "setH90",
                bass: "setBass",
                bassBoost: "setBassBoost",
                reverb: "setReverb",
                virtualizer: "setVirtualizer",
                playback: "setPlayback"
            };
            let fn = map[a];
            if (fn && myEQ[fn]) await myEQ[fn](v[a]);
        };
        if (key) {
            apply(key);
        } else {
            Object.keys(v).forEach(apply);
            updateRangeFade();
        }
    }
    values.sub.addEventListener('click',
        () => readEQ('sub'));
    values.m3.addEventListener('click',
        () => readEQ('m3'));
    values.m10.addEventListener('click',
        () => readEQ('m10'));
    values.h30.addEventListener('click',
        () => readEQ('h30'));
    values.h50.addEventListener('click',
        () => readEQ('h50'));
    values.h80.addEventListener('click',
        () => readEQ('h80'));
    values.h90.addEventListener('click',
        () => readEQ('h90'));
    values.bass.addEventListener('click',
        () => readEQ('bass'));
    values.bassBoost.addEventListener('click',
        () => readEQ('bassBoost'));
    values.reverb.addEventListener('click',
        () => readEQ('reverb'));
    values.virtualizer.addEventListener('click',
        () => readEQ('virtualizer'));
    values.playback.addEventListener('click',
        () => readEQ('playback'));
    document.querySelector('#resetEqBtn').addEventListener('click',
        () => readEQ());

    function formatTime(seconds) {
        const date = new Date(null);
        date.setSeconds(seconds);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remaining = Math.floor(seconds % 60);
        if (hours > 0) {
            return `${hours}:${minutes < 10 ? '0': ''}${minutes}:${remaining < 10 ? '0': ''}${remaining}`;
        }
        return `${minutes}:${remaining < 10 ? '0': ''}${remaining}`;
    }
    function formatDate(createdAt) {
        const d = new Date(createdAt);
        const w = '2-digit';
        return d.toLocaleString('id-ID', {
            day: w,
            month: w,
            year: 'numeric',
            hour: w,
            minute: w
        });
    }
    function formatBytes(bytes) {
        if (bytes === 0) return "0 B";
        const fm = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + " " + fm[i];
    }

    const cutNums = {
        start: 0,
        end: 0,
        dur: 0,
        fin: 0,
        out: 0
    };

    function updateRangeFade(progress) {
        if (!progress) {
            [fadeInSlider,
                fadeOutSlider].forEach(s => {
                    s.value = 0;
                    s.style.background = '';
                });

            [fadeInValue,
                fadeOutValue].forEach(v => v.textContent = '0.0s');

            cutNums.fin = cutNums.out = 0;
            return;
        }
        let val = progress.value;
        let pre = parseFloat(val).toFixed(1);
        const p = (val / 30) * 100;
        if (progress === fadeInSlider) {
            fadeInValue.textContent = pre + 's';
            cutNums.fin = +val;
        } else {
            fadeOutValue.textContent = pre + 's';
            cutNums.out = +val;
        }
        progress.style.background = `linear-gradient(90deg, #39ff14 ${p}%, #000 ${p}%)`;
    }
    [fadeInSlider,
        fadeOutSlider].forEach(s =>
        s.addEventListener('input', () => updateRangeFade(s), {
            passive: true
        })
    );
    function applyFadeEffect(player, times, dur) {
        if (!eqEnabled) return;
        let gain = 1;
        if (cutNums.fin > 0 && times < cutNums.fin) {
            gain = times / cutNums.fin;
        }
        if (cutNums.out > 0 && times > dur - cutNums.out) {
            gain = Math.min(gain, (dur - times) / cutNums.out);
        }
        player.volume = Math.max(0, Math.min(1, gain));
    }
    async function playNextTrack() {
        if (playingList.length === 0) return;
        if (isRepeat) return;
        let nextIndex = (currentIndex + 1) % playingList.length;
        await loadTrack?.(nextIndex);
    }
    async function playPrevTrack() {
        if (playingList.length === 0) return;
        if (isRepeat) return;
        const prevIndex = (currentIndex - 1 + playingList.length) % playingList.length;
        await loadTrack?.(prevIndex);
    }
    function renderProgressUI(time, dur) {
        if (!dur || isNaN(dur)) return;
        const p = (time / dur) * 100;
        const gradient = `linear-gradient(to right,
        #fff ${p}%,
        #111 ${p}%)`;
        [progressRange,
            progressBorder].forEach(s => {
                s.value = time;
                s.style.background = gradient;
            });
        currentTimes.textContent = formatTime(time);
        currentDurations.textContent = formatTime(dur);
    }

    const fa_play = '<i class="fas fa-play"></i>';
    const fa_pause = '<i class="fas fa-pause"></i>';
    if (audioPlayer) {
        audioPlayer.addEventListener("loadedmetadata", () => {
            const d = audioPlayer.duration;
            [progressRange, progressBorder].forEach(s => {
                s.min = 0;
                s.max = d;
            });
            if (eqEnabled) {
                audioPlayer.volume = 0;
            }
            renderProgressUI(0, d);
        });
        audioPlayer.addEventListener("timeupdate",
            () => {
                const t = audioPlayer.currentTime;
                const d = audioPlayer.duration;
                if (!d || isNaN(d)) return;
                if (eqEnabled) {
                    applyFadeEffect(audioPlayer, t, d);
                }
                renderProgressUI(t, d);
            });
        audioPlayer.addEventListener("play",
            () => {
                isPlaying = true;
                playPauseBtn.innerHTML = fa_pause;
                if (eqEnabled) {
                    myEQ.setPlayback(playbackEQ);
                }
                if (isPreview) {
                    cutAudioPlayer?.pause();
                }
            });
        audioPlayer.addEventListener("pause",
            () => {
                isPlaying = false;
                playPauseBtn.innerHTML = fa_play;
            });
        audioPlayer.addEventListener("ended",
            () => {
                isPlaying = false;
                const d = audioPlayer.duration;
                renderProgressUI(d, d);
                playNextTrack();
            });
        progressRange.addEventListener("input",
            () => {
                if (isNaN(audioPlayer.duration)) return;
                const t = +progressRange.value;
                audioPlayer.currentTime = t;
                audioPlayer.muted = true;
            });
        progressRange.addEventListener("touchend",
            () => {
                if (isNaN(audioPlayer.duration)) return;
                const t = +progressRange.value;
                const d = audioPlayer.duration;
                audioPlayer.muted = false;
                renderProgressUI(t, d);
            });
    }

    let vs_anim = null;
    let vs_running = false;
    let vs_tmr = 0;
    let vs_dir = 1;
    function visualizer(action = "start",
        mode = "wave") {
        const canvas = document.querySelector('#canvas-visualizer');
        const ctx = canvas.getContext("2d");
        const gap = 12;
        function draw() {
            if (!vs_running) return;
            const hg = canvas.height;
            const v = 0.5;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < gap; i++) {
                const index = vs_dir === v ? gap - 1 - i: i;
                let h;
                if (mode === "wave") {
                    h = (Math.sin(vs_tmr + index * v) * v + v) * hg;
                } else if (mode === "pulse") {
                    h = Math.abs(Math.sin(vs_tmr + index)) * hg;
                } else {
                    h = Math.random() * hg * 0.8;
                }
                const x = i * (gap * 2) + 10;
                const y = canvas.height - h;
                ctx.fillStyle = "#00ffcc";
                ctx.fillRect(x, y, gap, h);
            }
            vs_tmr += 0.06;
            if (vs_tmr > Math.PI * 2) {
                vs_tmr = 0;
                vs_dir *= -1;
            }
            vs_anim = requestAnimationFrame(draw);
        }
        if (action === "start") {
            if (vs_running) return;
            vs_running = true;
            draw();
        }
        if (action === "stop") {
            vs_running = false;
            cancelAnimationFrame(vs_anim);
            vs_anim = null;
        }
    }
    function updateRangePreview() {
        if (!audioProgres && cutAudioPlayer || isNaN(cutAudioPlayer.duration)) {
            return;
        }
        let d = cutAudioPlayer.duration,
        start = cutNums.start || 0,
        end = cutNums.end || d,
        progress = +audioProgres.value || 0;
        
        const a = 100,
        s = (start / d) * a,
        e = (end / d) * a,
        c = (progress / d) * a;
        audioProgres.style.background = `
        linear-gradient(to right,
        #111 ${s}%,
        #fff ${s}%,
        #fff ${c}%,
        #111 ${c}%,
        #111 ${e}%,
        #111 ${e}%)
        `;
    }
    async function oneDecoded() {
        if (!areData) throw "No audio source";
        if (codData) return;
        if (!isDecode) try {
            isDecode = true;
            const x = new AudioContext();
            codData = await x.decodeAudioData(areData.slice(0));
        } catch {
            isDecode = false;
        } finally {
            if (codData) isDecode = false;
        }
    }
    if (cutAudioPlayer) {
        cutAudioPlayer.addEventListener('loadedmetadata', () => {
            if (eqEnabled) {
                cutAudioPlayer.volume = 0;
            }
            updateRangePreview();
        });
        cutAudioPlayer.addEventListener('timeupdate',
            () => {
                if (isNaN(cutAudioPlayer.duration)) return;
                let t = cutAudioPlayer.currentTime;
                audioProgres.value = t;
                const startGain = t - cutNums.start;
                const endGain = cutNums.end - cutNums.start;
                if (eqEnabled) {
                    applyFadeEffect(cutAudioPlayer, startGain, endGain);
                }
                updateRangePreview();

            });
        cutAudioPlayer.addEventListener('play',
            () => {
                isPreview = true;
                audioBtn.innerHTML = fa_pause;
                visualizer('start', 'wave');

                if (eqEnabled) {
                    myEQ.setPlayback(playbackEQ);
                }
                if (isPlaying) {
                    audioPlayer?.pause();
                }
                if (!codData) {
                    oneDecoded();
                }
            });
        cutAudioPlayer.addEventListener('pause',
            () => {
                isPreview = false;
                audioBtn.innerHTML = fa_play;

                if (eqEnabled && cutAudioPlayer.fadeInterval) clearInterval(cutAudioPlayer.fadeInterval);
                if (vs_running) {
                    visualizer('stop');
                }
            });
        audioBtn.addEventListener('click',
            () => {
                if (isNaN(cutAudioPlayer.duration)) return;
                if (!isPreview) {
                    cutAudioPlayer.play();
                } else {
                    cutAudioPlayer.pause();
                }
            });
        document.querySelector('#startPreviewBtn').addEventListener('click',
            () => {
                if (isNaN(cutAudioPlayer.duration)) return;
                cutAudioPlayer.currentTime = +startSlider.value;
                cutAudioPlayer.play();
            });
        audioProgres.addEventListener("input",
            () => {
                if (isNaN(cutAudioPlayer.duration)) return;
                const pro = +audioProgres.value;
                if (pro < cutNums.start) {
                    audioProgres.value = cutNums.start;
                    return;
                }
                if (pro > cutNums.end) {
                    audioProgres.value = cutNums.end;
                    return;
                }
                cutAudioPlayer.currentTime = pro;
                updateRangePreview();

            });
    }
    const dualTrack = document.querySelector('.dual-slider-track');
    function applyHighlight() {
        let s = document.createElement('style');
        s.textContent = `
        .dual-slider-track::after {
        left: var(--highlight-left, 0%);
        width: var(--highlight, 0%);
        }`;
        document.head.appendChild(s);
    }
    function updateRangeTrim() {
        let start = +startSlider.value;
        let end = +endSlider.value;
        cutStartTimes.textContent = formatTime(start);
        cutEndTimes.textContent = formatTime(end);
        cutNums.start = start;
        cutNums.end = end;
        cutNums.dur = Math.max(0,
            end - start);
        duresult.forEach(d =>
            d.textContent = formatTime(end - start));
        let min = +startSlider.min;
        let max = +startSlider.max;
        let minVal = Math.min(cutNums.start,
            cutNums.end);
        let maxVal = Math.max(cutNums.start,
            cutNums.end);
        const startPE = ((minVal - min) / (max - min)) * 100;
        const endPE = ((maxVal - min) / (max - min)) * 100;
        const set = (post = '',
            percent = ``) => {
            dualTrack.style.setProperty(post,
                percent);
        };
        set('--start',
            `${startPE}%`);
        set('--end',
            `${endPE}%`);
        set('--left',
            `${startPE}%`);
        set('--width',
            `${endPE - startPE}%`);
        set('--left',
            `${startPE}%`);
        set('--width',
            `${endPE - startPE}%`);
        set('--highlight',
            `${endPE - startPE}%`);
        set('--highlight-left',
            `${startPE}%`);
        updateRangePreview();
    }
    endSlider.addEventListener('input',
        () => {
            if (isPreview) {
                updateRangeTrim();
                return;
            }
            let end = +endSlider.value;
            if (end <= cutNums.start) {
                endSlider.value = cutNums.start;
                return;
            }
            audioProgres.value = end;
            currentPG.textContent = formatTime(end);
            updateRangeTrim();
        });
    startSlider.addEventListener('input',
        () => {
            let start = +startSlider.value;
            if (start >= cutNums.end) {
                startSlider.value = cutNums.end;
                return;
            }
            if (cutAudioPlayer.currentTime < start && (audioProgres.value < cutNums.end)) {
                cutAudioPlayer.currentTime = start;
                audioProgres.value = start;
            }
            currentPG.textContent = formatTime(start);
            updateRangeTrim();
        });
    let timeStep = 1;
    function adjustStart(delta) {
        let step = delta * timeStep;
        let newStart = cutNums.start + step;
        if (newStart < 0) newStart = 0;
        if (newStart >= cutNums.end) {
            newStart = cutNums.start - timeStep;
        }
        startSlider.value = newStart.toFixed(2);
        if (cutAudioPlayer.currentTime < cutNums.start) {
            cutAudioPlayer.currentTime = newStart;
            audioProgres.value = newStart;
        }
        if (!isPreview) {
            currentPG.textContent = formatTime(cutNums.start);
        }
        updateRangeTrim();
    }
    function adjustEnd(delta) {
        let step = delta * timeStep;
        let max = +endSlider.max || 0;
        let newEnd = cutNums.end + step;
        if (newEnd > max) newEnd = max;
        if (newEnd <= cutNums.start) {
            newEnd = cutNums.end + timeStep;
        }
        endSlider.value = newEnd.toFixed(2);
        updateRangeTrim();
    }
    const dtn = {
        startMin: document.querySelector('#startMinusBtn'),
        startPlus: document.querySelector('#startPlusBtn'),
        endMin: document.querySelector('#endMinusBtn'),
        endPlus: document.querySelector('#endPlusBtn')};
    dtn.startMin.addEventListener("click",
        () => adjustStart(-1));
    dtn.startPlus.addEventListener("click",
        () => adjustStart(1));
    dtn.endMin.addEventListener("click",
        () => adjustEnd(-1));
    dtn.endPlus.addEventListener("click",
        () => adjustEnd(1));
    let isStep = false;
    formatTimesBtn.addEventListener('click', () => {
        if (timeStep === 1) isStep = false;
        isStep = !isStep;
        timeStep = isStep ? 5: 1;
        formatTimesBtn.textContent = isStep ? `${timeStep}s`: `${timeStep}s`;
    });
    let isProcessing = false;
    const inputIds = {
        name: document.querySelector('#fileNameInput'),
        title: document.querySelector('#titleNameInput'),
        artist: document.querySelector('#artistNameInput'),
        album: document.querySelector('#albumNameInput'),
        albumArtist: document.querySelector('#albumArtistInput'),
        genre: document.querySelector('#genreInput'),
        composer: document.querySelector('#composerInput'),
        publisher: document.querySelector('#publisherInput'),
        trackNo: document.querySelector('#trackNumberInput'),
        totalTrack: document.querySelector('#totalTrackInput'),
        discNo: document.querySelector('#discNumberInput'),
        totalDisc: document.querySelector('#totalDiscInput'),
        key: document.querySelector('#keyInput'),
        bpm: document.querySelector('#bpmInput'),
        year: document.querySelector('#yearInput'),
        sourceUrl: document.querySelector('#sourceUrlInput'),
        comment: document.querySelector('#commentInput'),
        lyrics: document.querySelector('#lyricsInput'),
        preTitle: document.querySelector('#preTitle'),
        preArtist: document.querySelector('#preArtist')
    };
    const playLy = document.querySelector("#play-lyrics");
    let speaking = false;
    function getSelectedText() {
        const id = document.querySelector("#tts-source").value;
        let element = `#${id}`;
        const input = document.querySelector(element) ?? inputIds.title;
        return input ? input.value.trim(): "";
    }
    function speakLyrics() {
        const text = getSelectedText();
        if (!text) return;
        const speech = new SpeechSynthesisUtterance(text);
        const userLang = navigator.language || "en-US";
        speech.lang = userLang;
        speech.rate = 0.8;
        speech.onend = () => {
            speaking = false;
            playLy.innerHTML = fa_play;
        };
        speechSynthesis.speak(speech);
    }
    playLy.addEventListener("click", () => {
        const text = getSelectedText();
        if (!text) return;
        if (!speaking) {
            speechSynthesis.cancel();
            speakLyrics();
            speaking = true;
            playLy.innerHTML = fa_pause;
        } else {
            speechSynthesis.cancel();
            speaking = false;
            playLy.innerHTML = fa_play;
        }
    });
    document.querySelector("#tts-source").addEventListener("change",
        () => {
            speechSynthesis.cancel();
            speaking = false;
            playLy.innerHTML = fa_play;
        });

    function isEdit(process = false) {
        document.querySelectorAll(".load-add-spinner")
        .forEach(el => el.classList.remove("active"));
        const open = document.querySelector("#openSetupBtn i").classList;
        const xt = document.querySelector("#extrackAudioBtn i").classList;
        const lock = "fa-lock",
        pen = "fa-pen",
        cut = "fa-cut";
        open.remove(lock,
            pen);
        xt.remove(lock,
            cut);
        open.add(process ? pen: lock);
        xt.add(process ? cut: lock);
        preEdit.classList.toggle("active",
            process);
        isProcessing = false;
    }
    function failCover() {
        apcx.forEach(c => {
            c.src = '';
            c.style.visibility = 'hidden';
        });
        if (albumArtInput) {
            albumArtInput.value = '';
            const dt = new DataTransfer();
            albumArtInput.files = dt.files;
        }
        return;
    }
    async function resetActivityEdit() {
        try {
            isProcessing = false;
            isPreview = false;
            areData = null;
            codData = null;
            currentCutId = null;
            asCounter = 0;
            const oldSrc = cutAudioPlayer.src;
            if (oldSrc.startsWith('blob:')) {
                cutAudioPlayer.pause();
                cutAudioPlayer.currentTime = 0;
                cutAudioPlayer.removeAttribute('src');
                cutAudioPlayer.load();
                URL.revokeObjectURL(oldSrc);
                delete cutAudioPlayer.dataset.cutId;
                audioBtn.innerHTML = fa_play;
            }
            timeStep = 1;
            formatTimesBtn.textContent = timeStep + 's';
            startSlider.value = endSlider.value = audioProgres.value = 0;
            startSlider.max = endSlider.max = audioProgres.max = 0;
            audioProgres.style.background = '';
            [durationPG,
                cutEndTimes].forEach(t => t.textContent = formatTime(0));
            duresult.forEach(d =>
                d.textContent = formatTime(0));
            Object.keys(inputIds).forEach(key => {
                inputIds[key].value = '';
                inputIds[key].textContent = '';
            });
            if (vs_running) visualizer("stop");

        } catch {}
        updateRangeTrim();
        failCover();
    }
    async function injectTags(track) {
        try {
            inputIds.preTitle.textContent = track.title || track.name || "unknown";
            inputIds.preArtist.textContent = track.artist || "unknown artist";
            Object.keys(track).forEach(k => {
                if (inputIds[k]) inputIds[k].value = track[k] || "";
            });
            const set = (file,
                url) => {
                const dt = new DataTransfer();
                dt.items.add(file);
                albumArtInput.files = dt.files;
                apcx.forEach(c => {
                    c.src = url;
                    c.style.visibility = 'visible';
                });
            };
            let thumb = track.thumbnailUrl || "";
            if (thumb.startsWith("data:mage/")) {
                thumb = thumb.replace("data:mage/", "data:image/");
            }
            if (thumb.startsWith("data:;base64")) {
                const base64 = thumb.split(",")[1] || "";
                const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
                const blob = new Blob([bytes], {
                    type: "image/jpeg"
                });
                const file = new File([blob], "cover.jpg", {
                    type: "image/jpeg"
                });
                const obj = URL.createObjectURL(blob);
                set(file, obj);
            }
            if (thumb.startsWith("data:image/")) {
                const res = await fetch(thumb);
                const blob = await res.blob();
                const mime = blob.type || "image/jpeg";
                const ext = mime.split("/")[1] || "jpeg";
                const file = new File([blob], `cover.${ext}`, {
                    type: mime
                });
                set(file, thumb);
            }
            let res;
            try {
                res = await fetch(thumb, {
                    mode: "cors"
                });
                if (!res.ok) failCover();
            } catch (e) {
                return failCover();
            }
            let blob = await res.blob();
            if (!blob.type || blob.type.trim() === "") {
                blob = new Blob([await blob.arrayBuffer()], {
                    type: "image/jpeg"
                });
            }
            const ext = blob.type.split("/")[1] || "jpeg";
            const file = new File([blob], `cover.${ext}`, {
                type: blob.type
            });
            const objURL = URL.createObjectURL(blob);
            set(file, objURL);

            if (thumb.includes("data:image/svg+xml")) {
                albumArtInput.value = '';
                const emptyTransfer = new DataTransfer();
                albumArtInput.files = emptyTransfer.files;
            }} catch {
            failCover();
        }
    }
    async function injectData(track) {
        await resetActivityEdit();
        try {
            isProcessing = true;
            const blob = new Blob([track.fileData], {
                type: track.type || "audio/mpeg"
            });
            const obj = URL.createObjectURL(blob);
            areData = await blob.arrayBuffer();
            const loadAudio = new Promise((resolve, reject) => {
                cutAudioPlayer.src = obj;
                cutAudioPlayer.preload = "metadata";
                currentCutId = track.id;
                cutAudioPlayer.onloadedmetadata = async () => {
                    const d = cutAudioPlayer.duration;
                    if (d >= 480) {
                        reject("maximum duration limit is around 7 minutes");
                        return;
                    }
                    startSlider.max = endSlider.max = audioProgres.max = d;
                    endSlider.value = d;
                    startSlider.value = audioProgres.value = 0;
                    [durationPG,
                        cutEndTimes].forEach(t => t.textContent = formatTime(d));
                    await Promise.all([applyHighlight(), updateRangeTrim()]);
                    resolve();
                };
                cutAudioPlayer.onerror = () => reject("Failed to load audio file");
            });
            visualizer('start',
                'wave');
            await loadAudio;
            cutAudioPlayer.ontimeupdate = () => {
                const c = cutAudioPlayer.currentTime;
                if (c >= +endSlider.value) {
                    cutAudioPlayer.pause();
                    cutAudioPlayer.currentTime = +startSlider.value;
                }
                audioProgres.value = c;
                currentPG.textContent = formatTime(c);
            };
            visualizer('stop');
            injectTags(track);
            isEdit(true);
        } catch (e) {
            isEdit(false);
            await resetActivityEdit();
            showToast(e, 1800);
        } finally {
            isProcessing = false;
        }
    }
    document.querySelector('#resetRowProgress').addEventListener('click',
        async (event) => {
            event.stopPropagation();
            cutAudioPlayer.pause();
            cutAudioPlayer.currentTime = 0;
            timeStep = 1;
            formatTimesBtn.textContent = timeStep + 's';
            const dur = cutAudioPlayer.duration;
            endSlider.value = dur;
            endSlider.max = startSlider.max = audioProgres.max = dur;
            audioProgres.value = startSlider.value = 0;
            currentPG.textContent = cutStartTimes.textContent = formatTime(0);
            [durationPG, cutEndTimes].forEach(t => t.textContent = formatTime(t));
            duresult.forEach(d => d.textContent = formatTime(dur));
            updateRangeTrim();
            showToast('✓ Return duration');
        });
    document.querySelector('#resetInputBtn').addEventListener('click',
        (event) => {
            event.stopPropagation();
            Object.keys(inputIds).forEach(key => {
                inputIds[key].value = '';
            });
            inputIds.preTitle.textContent = 'unknown';
            inputIds.preArtist.textContent = 'unknown artist';
            showToast('✓ Clearing input');
        });
    document.querySelector('#deleteCoverBtn').addEventListener('click',
        (event) => {
            event.stopPropagation();
            failCover();
        });
    resetEditBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        if (isDecode) return showToast('processing, wait a moment and try again...');
        if (isProcessing) {
            document.querySelectorAll(".load-add-spinner").forEach(el => el.classList.remove('active'));
        }
        resetActivityEdit();
        isEdit(false);
    });

    async function setDominant(imgUrl) {
        if (!imgUrl) return;
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = imgUrl;
        await img.decode().catch(() => null);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);
        const art = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let r = 0,
        g = 0,
        b = 0,
        count = 0;
        for (let i = 0; i < art.length; i += 40) {
            r += art[i];
            g += art[i + 1];
            b += art[i + 2];
            count++;
        }
        if (count === 0) return;
        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);
        const paint = `rgb(${r}, ${g}, ${b})`;
        let light = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        let text = light > 0.5 ? "#000": "#fff";
        if (playerItem) {
            playerItem.style.transition = "background 1s ease";
            playerItem.style.background = `${paint}`;
            playerItem.querySelectorAll("*").forEach(txt => (txt.style.color = text));
        }
    }
    function resetPopup() {
        ['#popAlbum',
            '#popAlbumArtist',
            '#popGenre',
            '#popComposer',
            '#popPublisher'
        ].forEach(id =>
            document.querySelector(id).textContent = ': unknown');
        ['#popTrackNumber',
            '#popTotalTrack',
            '#popDiscNumber',
            '#popTotalDisc',
            '#popKey',
            '#popBpm',
            '#popYear',
            '#popFileSize',
            '#popFileFormat'
        ].forEach(id =>
            document.querySelector(id).textContent = ': -');
        ['#popSourceUrl',
            '#popComment',
            '#popLyrics']
        .forEach(id => document.querySelector(id).textContent = ': Not found');
        document.querySelectorAll('.popTitle,.popArtist').forEach(el => el.textContent = ': unknown');
        document.querySelectorAll(".all-cover-art").forEach(el => {
            el.innerHTML = `${svgn}`;
            el.style.backgroundImage = '';
        });
    
        animTL.textContent = 'No songs are playing';
        animTL.classList.remove('active');

        if (playerItem) {
            playerItem.style.transition = "background 1s ease";
            playerItem.style.background = "rgba(52,59,60)";
            playerItem.querySelectorAll("*").forEach(txt => (txt.style.color = "#fff"));
        }
    }
    function popupTrackInfo(track, img) {
        if (!track || playingList.length === 0) return resetPopup();
        const set = (id, val = '') => {
            document.querySelector(id).textContent = ' : ' + val;
        };
        if (!isPlayer) {
            isPlayer = true;
            playerItem.classList.remove('hidden');
            if (isFilter) {
                [showFilterEl,
                    openFil].forEach(m => m.classList.remove('active'));
            }
        }

        animTL.textContent = `${track.title} - ${track.artist}`;
        animTL.classList.add('active');

        document.querySelectorAll('.popTitle')
        .forEach(el => el.textContent = track.title || 'unknown');
        document.querySelectorAll('.popArtist')
        .forEach(el => el.textContent = track.artist || 'unknown');
        Object.entries({
            popAlbum: track.album,
            popAlbumArtist: track.albumArtist,
            popGenre: track.genre,
            popComposer: track.composer,
            popPublisher: track.publisher,
            popTrackNumber: track.trackNo,
            popTotalTrack: track.totalTrack,
            popDiscNumber: track.discNo,
            popTotalDisc: track.totalDisc,
            popKey: track.key,
            popBpm: track.bpm,
            popYear: track.year,
            popSourceUrl: track.sourceUrl,
            popComment: track.comment,
            popLyrics: track.lyrics,
            popFileSize: formatBytes(track.size),
            popFileFormat: (track.name || track.title || '').split('.').pop()?.toUpperCase() || ''
        }).forEach(([id, val]) => set('#' + id, val));
        document.querySelectorAll(".all-cover-art").forEach(el => {
            el.innerHTML = '';
            el.style.backgroundImage = `url('${img}')`;
        });
        setDominant(img);
    }
    function resetPlayerUI() {
        playingList = [];
        isPlaying = false;
        deactiveSong = null;
        currentIndex = -1;
        [progressRange,
            progressBorder].forEach(s => {
                s.value = 0;
                s.max = 0;
                s.style.background = '';
            });
        [currentTimes,
            currentDurations].forEach(t => t.textContent = formatTime(0));
        if (audioPlayer.src && audioPlayer.src.startsWith('blob:')) {
            URL.revokeObjectURL(audioPlayer.src);
            audioPlayer.src = '';
            audioPlayer.currentTime = 0;
            audioPlayer.pause();
            playPauseBtn.innerHTML = fa_play;
        }
        if (deactiveSong) {
            if ('clearAppBadge' in navigator &&
                navigator.clearAppBadge());
        }
        if (!musicFiles.length) {
            isPlayer = false;
            playerItem.classList.add('hidden');
        }
        resetPopup();
    }

    let dbInstance = null;
    function openIndexedDB() {
        if (dbInstance) return Promise.resolve(dbInstance);
        return new Promise((resolve, reject) => {
            const req = indexedDB.open('metadate', 5);
            req.onupgradeneeded = e => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains("audioFiles")) {
                    const audio = db.createObjectStore("audioFiles", {
                        keyPath: "id"
                    });
                    audio.createIndex("name", "name", {
                        unique: false
                    });
                }
            };
            req.onsuccess = e => {
                dbInstance = e.target.result;
                resolve(dbInstance);
            };
            req.onerror = e => reject(e.target.error);
        });
    }
    async function getBase(id) {
        const db = await openIndexedDB();
        const tx = db.transaction(['audioFiles'],
            'readonly');
        const store = tx.objectStore('audioFiles');
        let req = store.get(id);

        return new Promise((resolve, reject) => {
            req.onsuccess = (event) => {
                const filed = event.target.result;
                if (filed) {
                    resolve(filed);
                } else {
                    resolve(null);
                }
            };
            req.onerror = async (event) => {
                reject(event.target.error);
            };
        });
    }
    function parseTrackInfo(fileName) {
        let cleaned = fileName.replace(/\.(mp3|wav|aac|ogg|m4a|flac)$/i,
            '');
        let parts = cleaned.split(' - ');
        let artist = 'unknown artis';
        let title = cleaned;
        if (parts.length > 1) {
            artist = parts[0].trim();
            title = parts.slice(1).join(' - ').trim();
        }
        return {
            title,
            artist
        };
    }
    const svgn = `<svg viewBox="-24 -24 72.00 72.00" xmlns="http://www.w3.org/2000/svg" fill="#ffffff"><g stroke-width="0"><rect x="-24" y="-24" width="72.00" height="72.00" rx="0" fill="#222" strokewidth="0"></rect></g> <path fill="none" d="M0 0H24V24H0z"></path> <path d="M12 19c.828 0 1.5.672 1.5 1.5S12.828 22 12 22s-1.5-.672-1.5-1.5.672-1.5 1.5-1.5zm0-17c3.314 0 6 2.686 6 6 0 2.165-.753 3.29-2.674 4.923C13.399 14.56 13 15.297 13 17h-2c0-2.474.787-3.695 3.031-5.601C15.548 10.11 16 9.434 16 8c0-2.21-1.79-4-4-4S8 5.79 8 8v1H6V8c0-3.314 2.686-6 6-6z"></path></svg>
    `;
    const DEFAULT_THUMBNAILS = {
        'fallback': 'data:image/svg+xml;utf8,' + encodeURIComponent(svgn.trim())
    };
    function getThumbByTitle(title) {
        const as = title.toLowerCase();
        for (const key in DEFAULT_THUMBNAILS) {
            if (key === 'fallback') continue;
            if (as.includes(key)) {
                return DEFAULT_THUMBNAILS[key];
            }
        }
        return DEFAULT_THUMBNAILS['fallback'];
    }

    let loadToken = 0;
    async function loadTrack(index) {
        const token = ++loadToken;
        const trackMetadata = playingList[index];
        if (!trackMetadata || !trackMetadata.id) {
            showToast("Track metadata invalid", 1800);
            return resetPlayerUI();
        }
        let blob = null;
        try {
            const items = await getBase(trackMetadata.id);

            if (token !== loadToken) return;
            if (!items || !items.fileData) {
                showToast(`file music ${trackMetadata.name} missing. Rescan required`, 3600);
                await deleteSongUnified(trackMetadata.id, trackMetadata.title);
                return;
            }
            blob = items.fileData;
            if (audioPlayer.src?.startsWith("blob:")) {
                URL.revokeObjectURL(audioPlayer.src);
            }
            const url = URL.createObjectURL(blob);
            currentIndex = index;
            audioPlayer.src = url;
            await audioPlayer.play().catch(()=> {});
            if (audioPlayer.src) {
                let title = trackMetadata.title || parseTrackInfo(trackMetadata.name);
                let artist = trackMetadata.artist || parseTrackInfo(trackMetadata.name);
                let img = trackMetadata.thumbnailUrl;
                if (!img || img.trim() === '') {
                    img = getThumbByTitle(title);
                }
                deactiveSong = trackMetadata.id;
                popupTrackInfo(trackMetadata, img);
                if ("mediaSession" in navigator) {
                    navigator.mediaSession.metadata = new MediaMetadata({
                        title: title || "Unknown",
                        artist: artist || "Unknown Artist",

                        artwork: [{
                            src: img, sizes: "96x96", type: "image/jpg"
                        },
                            {
                                src: img, sizes: "128x128", type: "image/jpg"
                            },
                            {
                                src: img, sizes: "192x192", type: "image/jpg"
                            },
                            {
                                src: img, sizes: "256x256", type: "image/jpg"
                            },
                            {
                                src: img, sizes: "384x384", type: "image/jpg"
                            },
                            {
                                src: img, sizes: "512x512", type: "image/jpg"
                            },
                        ]
                    });
                    navigator.mediaSession.setActionHandler("play", () =>
                        audioPlayer.play());
                    navigator.mediaSession.setActionHandler("pause", () => audioPlayer.pause());
                    navigator.mediaSession.setActionHandler('seekbackward', (event) => {
                        audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime + (event.seekOffset || -10));
                    });
                    navigator.mediaSession.setActionHandler('seekforward', (event) => {
                        audioPlayer.currentTime = Math.min(audioPlayer.duration, audioPlayer.currentTime + (event.seekOffset || 10));
                    });
                    navigator.mediaSession.setActionHandler("previoustrack", playPrevTrack);
                    navigator.mediaSession.setActionHandler("nexttrack", playNextTrack);
                } else {
                    if ('clearAppBadge' in navigator && navigator.clearAppBadge());
                }
                if ("setAppBadge" in navigator && navigator.setAppBadge(1));

                audioPlayer.onended = () => {
                    blob = null;
                };
            }
        } catch {
            if (err?.name === "InvalidStateError" ||
                err?.name === "DataError" ||
                err?.name === "NotFoundError") {
                return await cleanDB?.();
            }
            showToast(`error loading ${trackMetadata.name}`, 3600);
            resetPlayerUI();
        }
    }
    playPauseBtn.addEventListener('click', () => {
        if (playingList.length === 0) return;
        isPlaying = !isPlaying ? audioPlayer.play(): audioPlayer.pause();
        if ('clearAppBadge' in navigator &&
            navigator.clearAppBadge());
    });
    nextBtn.addEventListener('click',
        playNextTrack);
    prevBtn.addEventListener('click',
        playPrevTrack);
    repeatBtn.addEventListener('click',
        () => {
            isRepeat = !isRepeat;
            audioPlayer.loop = isRepeat;
            if (isRepeat) {
                repeatBtn.classList.add('active');
            } else {
                repeatBtn.classList.remove('active');
            }
        });

    const musicMessage = `<ul class="empty-message">
    <li class="flow-step">
    <i class="fas fa-plus"></i>
    <label>
    <span>To Add</span>
    <span>click the plus button at the bottom </span></label>
    </li>
    <li class="flow-step">
    <i class="fas fa-play"></i>
    <label class="label-flow">
    <span>To play</span>
    <span>click on the song to play</span></label>
    </li>
    <li class="flow-step">
    <i class="fas fa-pen"></i>
    <label class="label-flow">
    <span>To Edit</span>
    <span>Select the track you want to edit</span></label>
    </li>
    <li class="flow-step">
    <i class="fas fa-cut"></i>
    <label class="label-flow">
    <span>To make</span>
    <span>start creating and wait until the process is complete</span></label>
    </li>
    </ul>
    <div class="article-info" style="color:#888;">privacy? in short, the files you upload will be temporarily stored in browser's storage, and never uploaded.</div>
    <div class="article-info">©2024 - 2025</div>`;
    function updateStateId(list,
        track) {
        let role;
        let isDen = false;
        let startX = 0;
        const sd = 'show-delete';
        const hideBtn = () => {
            if (isDen) {
                isDen = false;
                list.classList.remove(sd);
                help.classList.remove(sd);
            }};
        const handle = () => {
            clearTimeout(role);
            role = setTimeout(hideBtn, 0);
        };
        list.addEventListener('touchstart',
            (e) => startX = e.touches[0].clientX);
        list.addEventListener('touchmove',
            (e) => {
                const dfx = e.touches[0].clientX - startX;
                if (Math.abs(dfx) > window.innerWidth * 0.5) {
                    isDen = !isDen;
                    list.classList.toggle(sd, isDen);
                    startX = e.touches[0].clientX;
                }
            });
        list.querySelector('.delete-btn').addEventListener('click',
            async (e) => {
                e.stopPropagation();
                await deleteSongUnified?.(track.id, track.title);
            });
        helpDeleteBtn?.addEventListener('click',
            () => {
                isDen = !isDen;
                musicList.querySelectorAll('.music-item').forEach(el => el.classList.toggle(sd, isDen));
                helpDeleteBtn.classList.toggle('active', isDen);
            });
        window.addEventListener('scroll',
            handle,
            {
                passive: true
            });
    }
    function renderMusic(musicList,
        list) {
        musicList.innerHTML = '';
        if (!list || list.length === 0) {
            musicList.innerHTML = musicMessage;
            return;
        }
        list.forEach(track => {
            const listItem = document.createElement('li');
            listItem.classList.add('music-item');
            listItem.dataset.fileId = track.id;

            const img = track.thumbnailUrl?.trim() || '';
            listItem.innerHTML = `
            <div class="track-inner">
            <button class="delete-btn"><i class="fas fa-times"></i></button>
            <div class="thumbnail">
            <img src="${img || svgn}" alt="img"></div>
            </div>
            <div class="track-info">
            <span class="track-title">${track.title || 'Unknown'}</span>
            <span class ="track-artist">${track.artist || 'Unknown'}</span>
            </div>
            <div class="add-cut-audio-btn"><i class="fas fa-pen"></i>
            <span class="load-add-spinner"></span></div>`;
            listItem.addEventListener('click',
                async (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    playingList = list;
                    const index = playingList.findIndex(item => item.id === track.id);

                    if (!track.fileData && index === -1) {
                        alert('The song cannot be found in the current list. Please rescan the folder!');
                        await cleanDB?.();
                        return;
                    }
                    await loadTrack(index);
                });
            listItem.querySelector(".add-cut-audio-btn").addEventListener('click',
                async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (isProcessing) return;
                    if (currentCutId === track.id) return;
                    if (track.fileData) {
                        listItem.querySelector(".load-add-spinner").classList.add('active');
                        await injectData(track);
                    }
                });
            musicList.appendChild(listItem);
            updateStateId(listItem,
                track);
        });
    }
    function groupBy(list, key) {
        return list.reduce((acc,
            item) => {
            const value = item[key] || 'Unknown';
            if (!acc[value]) acc[value] = [];
            acc[value].push(item);
            return acc;
        },
            {});
    }
    function renderByCategory(category) {
        musicList.innerHTML = '';
        if (!musicFiles || musicFiles.length === 0) {
            musicList.innerHTML = musicMessage;
            return;
        }
        [musicBtn,
            artistBtn,
            albumBtn,
            genreBtn].forEach(b => b.classList.remove('active'));
        let btn = `#${category}Btn`;
        document.querySelector(btn).classList.add('active');
        if (category === 'music') {
            renderMusic(musicList, musicFiles);
            return;
        }
        const grouped = groupBy(musicFiles, category);
        Object.entries(grouped).forEach(([key, group]) => {
            const header = document.createElement('div');
            header.className = 'category-name';
            header.textContent = `${category.toUpperCase()} : ${key}`;
            musicList.appendChild(header);
            const sublist = document.createElement('ul');
            renderMusic(sublist, group);
            musicList.appendChild(sublist);
        });
    }
    musicBtn.addEventListener('click',
        () => renderByCategory('music'));
    artistBtn.addEventListener('click',
        () => renderByCategory('artist'));
    albumBtn.addEventListener('click',
        () => renderByCategory('album'));
    genreBtn.addEventListener('click',
        () => renderByCategory('genre'));
    function debounce(fn,
        delay = 250) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => fn(...args), delay);
        };
    }
    function setSearchUI(hasInput) {
        const btn = [repeatBtn,
            openEqBtn,
            filterBtn];
        btn.forEach(b => b.style.display = hasInput ? "none": "flex");
        clearSearchBtn.style.display = hasInput ? "flex": "none";
    }
    function runSearch(term = "") {
        const searchTerm = term.trim().toLowerCase();
        const hasInput = searchTerm.length > 0;
        setSearchUI(hasInput);
        if (!hasInput) {
            renderMusic(musicList, musicFiles);
            return;
        }
        const listFil = musicFiles.filter(track => {
            const info = parseTrackInfo(track.name);
            return (
                info.title.toLowerCase().includes(searchTerm) ||
                info.artist.toLowerCase().includes(searchTerm)
            );
        });
        renderMusic(musicList, listFil);
    }
    const handleSearch = debounce(() => runSearch(searchInput.value), 250);
    searchInput.addEventListener("input", handleSearch);
    searchInput.addEventListener("focus", () => {
        setSearchUI(!!searchInput.value.trim());
        renderByCategory('music');
    });
    clearSearchBtn.addEventListener("click", () => {
        searchInput.value = "";
        setSearchUI(false);
        renderMusic(musicList, musicFiles);
    });

    function setLoadEl(state = false, percent = 0, stageText = 'Preparing Audio') {
        percent = Math.max(0, Math.min(100, Number(percent) || 0));
        const circum = 2 * Math.PI * 54;
        const offset = circum - (percent / 100) * circum;
        const el = {
            container: document.querySelector('#encodeLoading'),
            spinner: document.querySelector('#encodeSpin'),
            bar: document.querySelector('#encodeBarss'),
            percent: document.querySelector('#encodePercent'),
            stage: document.querySelector('#encodeStage'),
            body: document.body
        };

        el.container.classList.toggle('hidden', !state);
        el.spinner.classList.toggle('active', state);

        if (state) {
            el.bar.style.strokeDashoffset = offset;
            el.stage.textContent = stageText;
            el.percent.textContent = percent + '%';
            el.body.style.overflow = 'hidden';

            if (percent > 0) {
                el.spinner.classList.remove('active');
            }
        } else {
            el.bar.style.strokeDashoffset = '';
            el.stage.textContent = '';
            el.percent.textContent = '0%';
            el.body.style.overflow = '';
        }
    }

    function updateDate(count) {
        const total = musicFiles.reduce((sum, file) => sum + (file.size || 0),
            0);
        const readable = formatBytes(total);
        document.querySelector('#countMusic').textContent = count;
        document.querySelector('#dataSaveDb').textContent = `music : ${readable} - ${count} song`;
    }
    function generateFileId(file) {
        return `${file.name}-${file.lastModified}-${file.size}`;
    }
    function extractNumbers(raw) {
        const res = {number: "", total: ""};
        if (!raw && raw !== 0) return res;

        let val = (raw?.data || raw?.text || (Array.isArray(raw) ? raw[0]: raw)).toString().trim();
        val = val.replace(/[()]/g, '').replace(/^(track|trk|tp\.?)\s*[:\-]?/i, '').trim();

        const match = val.match(/(\d+)(?:\s*(?:\/|of)\s*(\d+))?/i);
        if (match) {
            res.number = match[1].replace(/^0+/, "") || "0"; 
            res.total = match[2]?.replace(/^0+/, "") || "";
        }
        return res;
    }

    function cleanMetadata(item) {
        const {
            number: tNo,
            total: tTot
        } = extractNumbers(item.track || item.trackNo);
        const {
            number: dNo,
            total: dTot
        } = extractNumbers(item.disc || item.discNo);

        return {
            id: item.id || generateFileId(item.name || item.title),
            name: item.name || "",
            title: item.title || "",
            artist: item.artist || "",
            album: item.album || "",
            albumArtist: item.albumArtist || "",
            genre: item.genre || "",
            composer: item.composer || "",
            publisher: item.publisher || "",
            sourceUrl: item.sourceUrl || "",
            comment: item.comment || "",
            lyrics: item.lyrics || "",
            trackNo: item.trackNo || tNo || "",
            totalTrack: item.totalTrack || tTot || "",
            discNo: item.discNo || dNo || "",
            totalDisc: item.totalDisc || dTot || "",
            key: item.key || "",
            bpm: item.bpm || "",
            year: item.year || "",
            duration: item.duration || 0,
            size: item.size || 0,
            format: item.format || "audio/mpeg",
            type: item.type || "audio",
            thumbnailUrl: item.thumbnailUrl || getThumbByTitle(item.title || item.name),
            fileData: item.fileData || null
        };
    }
    async function saveToDB(metadata, fileData) {
        const db = await openIndexedDB();
        const tx = db.transaction(['audioFiles'], 'readwrite');
        const store = tx.objectStore('audioFiles');
        const dataToSave = {
            ...metadata,
            fileData,
            size: fileData.size,
            format: fileData.type || 'audio/mpeg',
            timestamp: new Date()
        };
        return new Promise((resolve, reject) => {
            const req = store.put(dataToSave);
            req.onsuccess = () => resolve();
            req.onerror = (e) => reject(e.target.error);
        });
    }
    const supportedExt = ['mp3',
        'wav',
        'ogg',
        'flac',
        'aac',
        'm4a'];
    async function processFile(file) {
        const id = generateFileId(file);
        const exn = file.name.split('.').pop().toLowerCase();
        if (!supportedExt.includes(exn)) {
            return null;
        }
        let item = {
            id,
            name: file.name,
            title: file.name.split('.').slice(0, -1).join('.'),
            artist: '',
            album: '',
            albumArtist: '',
            genre: '',
            composer: '',
            publisher: '',
            sourceUrl: '',
            comment: '',
            lyrics: '',
            trackNo: '',
            totalTrack: '',
            discNo: '',
            totalDisc: '',
            key: '',
            bpm: '',
            year: '',
            duration: 0,
            size: file.size,
            format: file.type.split('/')[1] || 'audio/mpeg',
            type: 'audio',
            thumbnailUrl: '',
            fileData: file
        };
        try {
            const {
                tags
            } = await new Promise((res, rej) => jsmediatags.read(file, {
                    onSuccess: res, onError: rej
                }));
            if (!tags) throw 'No tags';

            const map = {
                title: tags.title,
                artist: tags.artist,
                album: tags.album,
                albumArtist: tags.TPE2?.data || tags.albumArtist,
                genre: tags.TCON?.data || tags.genre,
                composer: tags.TCOM?.data || tags.composer,
                publisher: tags.TPUB?.data || tags.publisher,
                key: tags.TKEY?.data || tags.key,
                bpm: tags.TBPM?.data || tags.bpm,
                year: tags.year,
                sourceUrl: tags.WOAS?.data || tags.WOAS,
                comment: tags.COMM?.data?.text || tags.COMM?.data?.description || "",
                lyrics: tags.lyrics?.lyrics || tags.lyrics || tags.USLT?.data || tags.USLT
            };

            Object.keys(map).forEach(k => map[k] && (item[k] = map[k]));

            const trackData = tags.TRCK?.data || tags.TRCK || tags.track;
            const discData = tags.TPOS?.data || tags.TPOS || tags.disc;

            if (trackData) ({
                number: item.trackNo, total: item.totalTrack
            } = extractNumbers(trackData));
            if (discData) ({
                number: item.discNo, total: item.totalDisc
            } = extractNumbers(discData));
            if (tags.picture) {
                const bytes = new Uint8Array(tags.picture.data);
                const binary = Array.from(bytes, b => String.fromCharCode(b)).join('');
                item.thumbnailUrl = `data:${tags.picture.format};base64,${btoa(binary)}`;
            }
        } catch (e) {
            item.thumbnailUrl = getThumbByTitle(item.title || file.name);
        }
        const metadata = await cleanMetadata(item);
        try {
            await saveToDB(metadata, file);
            return metadata;
        } catch (e) {
            console.error("Gagal simpan:", e);
            return null;
        }
    }
    async function loadAudioData() {
        const db = await openIndexedDB();
        const tx = db.transaction(['audioFiles'], 'readonly');
        const store = tx.objectStore('audioFiles');
        const req = store.getAll();
        return new Promise((resolve,
            reject) => {
            req.onsuccess = async () => {
                const date = req.result;
                const Filed = [];
                date.forEach(item => {
                    if (item.type === 'audio') {
                        const clean = cleanMetadata(item);
                        Filed.push(clean);
                    }
                });
                musicFiles = Filed;
                renderMusic(musicList,
                    musicFiles);
                updateDate(musicFiles.length);
                resolve();
            };
            req.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }
    let isFileMode = false;
    async function parseMusic(files) {
        setLoadEl(true);
        try {
            const existingIds = new Set(musicFiles.map(f => f.id));
            const pushFiles = [];
            let duplicateCount = 0;
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const result = await processFile(file);
                if (result) {
                    if (existingIds.has(result.id) || pushFiles.some(f => f.id === result.id)) {
                        duplicateCount++;
                    } else {
                        pushFiles.push(result);
                    }
                }
                const p = Math.round(((i + 1) / files.length) * 100);
                setLoadEl(true, p, `Processing audio ${i + 1}/${files.length}`);

            }
            if (duplicateCount > 0) {
                showToast(`${duplicateCount} duplicate file(s) skipped.`);
            }
            if (pushFiles.length > 0) {
                musicFiles.push(...pushFiles);
                await loadAudioData();
            } else if (duplicateCount === 0) {
                return;
            }
        } catch {
            alert('An error occurred during processing.');
        } finally {
            setLoadEl(false);
            if (files.target) files.target.value = '';
        }
    }
    addFileBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (isFileMode) {
            folderInput.value = "";
            folderInput.click();
        } else {
            fileInput.value = "";
            fileInput.click();
        }
    });
    fileInput.addEventListener("change",
        (event) => {
            const files = event.target.files;
            if (!files || files.length === 0) return;
            parseMusic(files);
        });
    folderInput.addEventListener("change",
        (event) => {
            const files = event.target.files;
            if (!files || files.length === 0) return;
            parseMusic(files);
        });
    changeInputBtn.addEventListener("click",
        (event) => {
            event.stopPropagation();
            isFileMode = !isFileMode;
            changeInputBtn.innerHTML = isFileMode
            ? '<i class="fas fa-folder-closed"></i> Input / Multiple': '<i class="fas fa-folder-open"></i> Input / File';
        });

    async function deleteSongUnified(id,
        title) {
        if (!id) {
            alert('Invalid song ID. Failed to delete!');
            return;
        }
        try {
            const db = await openIndexedDB();
            const tx = db.transaction(['audioFiles'], 'readwrite');
            const store = tx.objectStore('audioFiles');
            await new Promise((resolve, reject) => {
                const req = store.delete(id);
                req.onsuccess = () => {
                    resolve();
                };
                req.onerror = (event) => {
                    reject(event.target.error);
                };
            });
            if (deactiveSong === id) resetPlayerUI();
            if (currentCutId === id) {
                isEdit(false)
                resetActivityEdit();
            }
            musicFiles = musicFiles.filter(track => track.id !== id);
            playingList = playingList.filter(track => track.id !== id);
            renderMusic(musicList, musicFiles);
            updateDate(musicFiles.length);

        } catch {
            alert('An error occurred while deleting the song');
        }
    }
    async function cleanDB() {
        musicFiles = [];

        await resetPlayerUI();
        if (codData) resetActivityEdit();

        try {
            const db = await openIndexedDB();
            const tx = db.transaction(['audioFiles'], 'readwrite');
            tx.objectStore('audioFiles').clear();
            await new Promise((res, rej) => {
                tx.oncomplete = res;
                tx.onerror = tx.onabort = e => rej(e.target.error);
            });
        } catch (e) {
            console.error("Failed to delete database:", e);
        } finally {
            await Promise.all([
                renderMusic(musicList, musicFiles),
                updateDate(0)
            ]);
        }
    }
    document.querySelector('#removeDateMp3').addEventListener('click',
        (e) => {
            e.stopPropagation();
            if (!musicFiles.length) return;
            if (!confirm("Are you sure you want to delete all stored data?")) return;
            cleanDB();
        });

    'use strict';
    (function () {
        let bitrate = 64;
        function finalize(outBlob, outFile) {
            setLoadEl(false);
            const url = URL.createObjectURL(outBlob);
            downloadLinka.href = url;
            downloadLinka.download = outFile;
            downloadLinka.click();
            setTimeout(() => {
                URL.revokeObjectURL(url);
                downloadLinka.removeAttribute('href');
                downloadLinka.removeAttribute('download');
                asCounter = 0;
            }, 1000);
            showToast('succeed ✓');
        }
        async function writerTags(mp3Blob) {
            const name = inputIds.name.value.trim() || "",
            title = inputIds.title.value.trim() || "",
            artist = inputIds.artist.value.trim() || "",
            album = inputIds.album.value.trim() || "",
            albumArtist = inputIds.albumArtist.value.trim() || "",
            genre = inputIds.genre.value.trim() || "",
            composer = inputIds.composer.value.trim() || "",
            publisher = inputIds.publisher.value.trim() || "",
            trackNumber = inputIds.trackNo.value.trim() || "",
            totalTrack = inputIds.totalTrack.value.trim() || "",
            discNumber = inputIds.discNo.value.trim() || "",
            totalDisc = inputIds.totalDisc.value.trim() || "",
            key = inputIds.key.value.trim() || "",
            bpm = inputIds.bpm.value.trim() || "",
            year = inputIds.year.value.trim() || "",
            sourceUrl = inputIds.sourceUrl.value.trim() || "",
            comment = inputIds.comment.value.trim() || "",
            lyrics = inputIds.lyrics.value.trim() || "",
            nameExt = name + `_XDA-${asCounter++}.mp3`;

            const mp3Buffer = await mp3Blob.arrayBuffer();
            const writer = new ID3Writer(mp3Buffer);
            const trackFormatted = trackNumber && totalTrack ? `${trackNumber}/${totalTrack}`: trackNumber;
            const discFormatted = discNumber && totalDisc ? `${discNumber}/${totalDisc}`: discNumber;

            if (title) writer.setFrame("TIT2", title);
            if (artist) writer.setFrame("TPE1", [artist]);
            if (album) writer.setFrame("TALB", album);
            if (albumArtist) writer.setFrame("TPE2", [albumArtist]);
            if (genre) writer.setFrame("TCON", [genre]);
            if (composer) writer.setFrame("TCOM", [composer]);
            if (publisher) writer.setFrame("TPUB", [publisher]);
            if (trackFormatted) writer.setFrame("TRCK", trackFormatted);
            if (discFormatted) writer.setFrame("TPOS", discFormatted);
            if (key) writer.setFrame("TKEY", key);
            if (bpm) writer.setFrame("TBPM", Number(bpm));
            if (year) writer.setFrame("TYER", year);
            if (sourceUrl) {
                writer.setFrame("WOAS", sourceUrl);
            }
            if (comment) {
                writer.setFrame("COMM", {
                    language: "eng",
                    description: comment,
                    text: comment
                });
            }
            if (lyrics) {
                writer.setFrame("USLT", {
                    description: "",
                    lyrics: lyrics
                });
            }
            if (albumArtInput.files.length > 0) {
                const albumArtFile = albumArtInput.files[0];
                const imageBuffer = await albumArtFile.arrayBuffer();

                writer.setFrame("APIC", {
                    type: 3,
                    data: imageBuffer,
                    description: "Cover Art",
                    mime: albumArtFile.type
                });
            }
            writer.addTag();
            const blob = writer.getBlob();
            finalize(blob, nameExt);
        }
        function floatTo16BitPCM(f32) {
            const len = f32.length;
            const out = new Int16Array(len);
            for (let i = 0; i < len; i++) {
                let s = Math.max(-1, Math.min(1, f32[i]));
                out[i] = (s < 0 ? s * 0x8000: s * 0x7FFF) | 0;
            }
            return out;
        }
        async function cloneStart(tx) {
            const renderedBuffer = await tx.startRendering();
            const {
                numberOfChannels,
                sampleRate,
                length: total
            } = renderedBuffer;
            const ch0 = renderedBuffer.getChannelData(0);
            const ch1 = numberOfChannels > 1 ? renderedBuffer.getChannelData(1): null;
            const encoder = new lamejs.Mp3Encoder(numberOfChannels, sampleRate, bitrate || 128);
            const bs = 1152;
            const mp3Data = [];
            let yid = performance.now();
            for (let i = 0; i < total; i += bs) {
                const end = Math.min(i + bs, total);
                const leftChunk = floatTo16BitPCM(ch0.subarray(i, end));
                let rightChunk = null;
                if (ch1) {
                    rightChunk = floatTo16BitPCM(ch1.subarray(i, end));
                }
                const mp3buf = (numberOfChannels === 2)
                ? encoder.encodeBuffer(leftChunk, rightChunk): encoder.encodeBuffer(leftChunk);
                if (mp3buf.length > 0) mp3Data.push(new Uint8Array(mp3buf));
                const now = performance.now();
                if (now - yid > 50) {
                    const percent = Math.floor((i / total) * 100);
                    setLoadEl(true, percent, 'Encoding MP3');
                    await new Promise(resolve => setTimeout(resolve, 0));
                    yid = performance.now();
                }
            }
            const endBuf = encoder.flush();
            if (endBuf.length > 0) mp3Data.push(new Uint8Array(endBuf));
            const mp3Blob = new Blob(mp3Data, {
                type: "audio/mp3"
            });
            writerTags(mp3Blob);
        }
        const isEnsure = {
            group: false,
            rate: false,
            duration: false
        };
        async function renderFullClone() {
            const sample = codData.sampleRate;
            const numb = codData.numberOfChannels;
            const start = cutNums.start ?? +startSlider.value;
            const end = cutNums.end ?? +endSlider.value;
            const duration = cutNums.dur ?? Math.max(0, end - start);
            const result = duration / playbackEQ;
            const outFrames = Math.ceil(result * sample);
            const tx = new OfflineAudioContext(
                numb,
                outFrames,
                sample
            );
            const source = tx.createBufferSource();
            source.buffer = codData;
            source.playbackRate.value = playbackEQ;

            if (!isEnsure.group && !isEnsure.rate) {
                source.connect(tx.destination);
                source.start(0, start, duration);
                cloneStart(tx);
                return;
            }
            const s1 = biquad(tx, "lowshelf", 60, 0, subEQ),
            m3 = biquad(tx, "peaking", 320, 1.2, m3EQ),
            m1 = biquad(tx, "peaking", 1000, 1.2, m10EQ),
            h3 = biquad(tx, "highshelf", 3000, 0, h30EQ),
            h5 = biquad(tx, "highshelf", 5000, 0, h50EQ),
            h8 = biquad(tx, "highshelf", 8000, 0, h80EQ),
            h9 = biquad(tx, "highshelf", 9000, 0, h90EQ);

            const b1 = biquad(tx, "highpass", 90),
            b2 = biquad(tx, "peaking", 70, 0.5, bassEQ * 10),
            b3 = biquad(tx, "lowpass", 100),
            b4 = tx.createGain();
            b4.gain.value = bassEQ;

            const ba = biquad(tx, "highpass", 110),
            bb = biquad(tx, "peaking", 92, 0.2, bassBoostEQ * 10),
            bc = biquad(tx, "lowpass", 140),
            bg = tx.createGain();
            bg.gain.value = bassBoostEQ;

            const de = tx.createDelay(5),
            df = tx.createGain(),
            dg = tx.createGain();
            de.delayTime.value = 0.002 + virtualizerEQ * 0.05;
            df.gain.value = Math.min(0.05, 0.5 + virtualizerEQ);
            dg.gain.value = virtualizerEQ;

            const vL = tx.createGain(),
            vR = tx.createGain(),
            vx = tx.createGain();
            vL.gain.value = 1;
            vR.gain.value = 1;
            vx.gain.value = virtualizerEQ * 0.5;
            const sp = tx.createChannelSplitter(2);

            const rb = tx.createConvolver(),
            rx = tx.createGain();
            rb.buffer = reverbImpulse(tx, 2.5);
            rx.gain.value = reverbEQ;

            const vo = tx.createGain(),
            cp = createCompressor(tx),
            lt = createLimiter(tx),
            mg = tx.createGain();
            vo.gain.value = 1 - bassBoostEQ * 0.2;

            const fin = cutNums.fin ?? +fadeInSlider.value;
            const fade = tx.createGain();
            fade.gain.value = 1;
            fade.gain.setValueAtTime(0, 0);
            fade.gain.linearRampToValueAtTime(1, fin);
            const out = cutNums.out ?? +fadeOutSlider.value;
            if (out > 0) {
                const t = result - out;
                fade.gain.setValueAtTime(1, t);
                fade.gain.linearRampToValueAtTime(0, result);
            }
            source.connect(s1).connect(m3).connect(m1).connect(h3).connect(h5).connect(h8).connect(h9).connect(vo);
            source.connect(b1).connect(b2).connect(b3).connect(b4).connect(lt);
            source.connect(ba).connect(bb).connect(bc).connect(bg).connect(lt);
            lt.connect(mg);
            vo.connect(de).connect(df).connect(de).connect(dg).connect(mg);
            vo.connect(vL).connect(vx);
            vo.connect(vR).connect(vx);
            vx.connect(sp).connect(mg);
            vo.connect(rb).connect(rx).connect(mg);
            vo.connect(cp).connect(mg);
            mg.connect(fade).connect(tx.destination);
            source.start(0, start, duration);
            cloneStart(tx);
        }
        function ensureExport() {
            if (Object.values(isEnsure).every(value => !value)) {
                const mp3Blob = new Blob([areData], {
                    type: "audio/mp3"
                });
                writerTags(mp3Blob);
                return;
            }
            if (vs_running) visualizer('stop');
            renderFullClone();
        }
        async function ensureDecoded() {
            if (codData) {
                ensureExport();
                return;
            }
            const x = new AudioContext();
            codData = await x.decodeAudioData(areData.slice(0));
            ensureExport();
        }
        function setAppend(state = false) {
            const set = (color = '', btn = '') => {
                [inputIds.preTitle,
                inputIds.preArtist].forEach(t => t.style.color = color);
                duresult.forEach(d => d.style.color = color);
                resetEditBtn.style.display = btn;
            };
            if (state) {
                getOutEdit.appendChild(preEdit);
                set('#000', 'none')
            } else {
                set('', 'flex')
                listEdit.appendChild(preEdit);
            }
        }
        function confrimClone(state = false) {
            setAppend(false);
            confirmBox.classList.add('hidden');
            if (state) {
                setLoadEl(true);
                ensureDecoded();
            } 
        }
        function readValue(calc) {
            setAppend(true);
            let times = formatTime(calc);
            let duration = formatTime(cutAudioPlayer.duration);
            const ensureEQ = [subEQ,
                m3EQ,
                m10EQ,
                h30EQ,
                h50EQ,
                h80EQ,
                h90EQ,
                bassEQ,
                bassBoostEQ,
                virtualizerEQ,
                cutNums.fin,
                cutNums.out];
            const Q = ensureEQ.every(e => e === 0);
            const R = playbackEQ === 1;
            const D = times === duration;
            const btn = document.querySelector('#audio-rate-group');
            if (D && (!eqEnabled || (Q && R))) {
                btn.classList.add('hidden');
                Object.keys(isEnsure).forEach(key => isEnsure[key] = false);
                return;
            }
            btn.classList.remove('hidden');
            isEnsure.group = Q;
            isEnsure.rate = R;
        }
        function isLameAvailable() {
            return (typeof lamejs !== "undefined" && lamejs && typeof lamejs.Mp3Encoder === "function");
        }
        document.querySelector('#okRate').addEventListener('click',
            async (e) => {
                e.stopPropagation();
                if (isDecode) return;
                if (!toastEnabled) {
                    confrimClone(true);
                    return;
                }
                if (!confirm("the encoding process can take quite a long time!")) return;
                confrimClone(true);
            });
        document.querySelector('#cancelRate').addEventListener('click',
            (e) => {
                e.stopPropagation();
                confrimClone(false)
            });
        extrackAudioBtn.addEventListener('click',
            async () => {
                if (!isLameAvailable()) {
                    showToast('sorry, it looks like the library is not available at this time.', 3600);
                    setLoadEl(false);
                    return;
                }
                if (!areData) {
                    showToast('No audio loaded');
                    return;
                }
                let calc = cutNums.end - cutNums.start;
                if (cutNums.dur === 0 ?? calc === 0) {
                    showToast('no duration obtained, please double check.');
                    return;
                }
                readValue(calc);
                confirmBox.classList.remove('hidden');
            });
        rateButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                rateButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                bitrate = parseInt(btn.dataset.rate, 10);
            });
        });
        let currentAlbumArtUrl = null;
        albumArtInput.addEventListener('change',
            (event) => {
                const file = event.target.files[0];
                if (!file) return;
                if (currentAlbumArtUrl) {
                    URL.revokeObjectURL(currentAlbumArtUrl);
                    currentAlbumArtUrl = null;
                }
                if (file) {
                    currentAlbumArtUrl = URL.createObjectURL(file);
                    apcx.forEach(c => {
                        c.src = currentAlbumArtUrl;
                        c.style.visibility = 'visible';
                    });
                }
            });
        inputIds.title.addEventListener('input',
            () => {
                const title = inputIds.title.value.trim();
                inputIds.preTitle.textContent = title || "";
            });
        inputIds.artist.addEventListener('input',
            () => {
                const artist = inputIds.artist.value.trim();
                inputIds.preArtist.textContent = artist || "";
            });
    }());

    (function() {
        const qrov = document.querySelector('#qr-overlay');
        const genQR = document.querySelector("#generateQrBtn");
        function navigation(nav) {
            [showMetaEl, showEqEl,
                showSetupEl,
                showFilterEl,
                openFil, qrov].forEach(m => m.classList.remove('active'));
            if (!nav) return;
            if (nav) nav.classList.add('active');
        }
        document.querySelector('#openMetaBtn').addEventListener('click',
            () => {
                showMetaEl.classList.add('active');
                metaTheme.setAttribute('content', '#fff');
            });
        document.querySelector('#closeMetaBtn').addEventListener('click',
            () => {
                showMetaEl.classList.remove('active');
                metaTheme.setAttribute('content', '#141414');
            });
        document.querySelector('#showCoverBtn').addEventListener('click',
            () => {
                [albumArtWrap,
                    coverWrap].forEach(c => c.classList.toggle('show'));
            });

        document.querySelector('#openEqBtn').addEventListener('click',
            () => navigation(showEqEl));
        document.querySelector('#openEqns').addEventListener('click',
            () => showEqEl.classList.add('active'));
        document.querySelector('#closeEqBtn').addEventListener('click',
            () => showEqEl.classList.remove('active'));

        document.querySelector('#openSetupBtn').addEventListener('click',
            () => {
                if (!areData) return showToast('no audio data');
                navigation(showSetupEl);
            });
        document.querySelector('#closeSetupBtn').addEventListener('click',
            () => navigation());

        document.querySelector('#now-playing-preview').addEventListener('click',
            (e) => {
                e.stopPropagation(); viewPopupMenu.classList.add('active');
            });
        document.querySelector('#closePopupBtn').addEventListener('click',
            () => viewPopupMenu.classList.remove('active'));

        document.querySelector('#menuBtn').addEventListener("click",
            () => sideMenu.classList.remove('hidden'));
        document.addEventListener("click",
            (e) => {
                if (e.target === sideMenu) {
                    [sideMenu,
                        dateSeved].forEach(m => m.classList.add('hidden'));
                }});
        document.querySelector('#dateBtn').addEventListener('click',
            () => dateSeved.classList.toggle('hidden'));

        function hideFilter() {
            isFilter = !isFilter;
            if (isFilter) {
                if (isPlayer) playerItem.classList.add('hidden');
                [showFilterEl,
                    openFil].forEach(m => m.classList.add('active'));
            } else {
                if (isPlayer) playerItem.classList.remove('hidden');
                navigation();
            }}
        filterBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navigation(); hideFilter();
        });

        async function PGM(btn,
            page) {
            [openMusicBtn,
                openConvertBtn]
            .forEach(b => b?.classList.remove('active'));
            switch (page) {
                case convertPageEl:
                    openConvertBtn.style.display = 'flex';
                    if (isPlayer) playerItem.classList.add('hidden');
                    break;
                default:
                    convertPageEl.classList.remove('active');
                    if (isPlayer) playerItem.classList.remove('hidden');
                    break;
            }
            if (btn) btn.classList.add('active');
            if (page) page.classList.add('active');
        }
        openConvertBtn.addEventListener('click',
            () => PGM(openConvertBtn, convertPageEl));
        openMusicBtn.addEventListener('click',
            () => PGM(openMusicBtn));

        let currentQR = null;
        function generateQR() {
            let input = document.querySelector("#paste-link-qr").value.trim();
            const btn = document.querySelector("#downloadQR");
            const code = document.querySelector("#qrcode");
            const text = document.querySelector("#qrText");
            if (!input) {
                if (currentQR) {
                    currentQR = null;
                    code.innerHTML = '';
                    text.textContent = '';
                    btn.classList.add('hidden');
                }
                showToast("Please enter address / link", 2000);
                return;
            }
            let finalData = "";
            let displayText = "";
            if (/^[\d+\-\s]+$/.test(input)) {
                let cleanNumber = input.replace(/\D/g, "");

                finalData = "https://wa.me/" + cleanNumber;
                displayText = cleanNumber;
            } else {
                let url = input.toLowerCase();
                if (!url.startsWith("http://") && !url.startsWith("https://")) {
                    url = "https://" + url;
                } else if (url.startsWith("http://")) {
                    url = url.replace("http://", "https://");
                }
                finalData = url;
                try {
                    let domain = new URL(url).hostname;
                    displayText = domain.replace(/^www\./, "");
                } catch {
                    displayText = "QR CODE";
                }
            }
            if (finalData === currentQR) return;
            currentQR = finalData;
            btn.classList.add("hidden");
            code.innerHTML = "";
            new QRCode(code, {
                text: finalData,
                width: 256,
                height: 256,
                correctLevel: QRCode.CorrectLevel.H
            });
            btn.classList.remove("hidden");
            text.textContent = displayText;
        }
        function downloadQR() {
            const element = document.getElementById("qr-result");
            if (!element) {
                alert("no QR?");
                return;
            }
            html2canvas(element, {
                scale: 2,
                backgroundColor: "#ffffff"
            }).then(canvas => {
                const link = document.createElement("a");
                link.href = canvas.toDataURL("image/png");
                link.download = "qr-code.png";
                link.click();
            });
        }
        document.querySelector("#generateQR").addEventListener("click", generateQR);
        document.querySelector("#downloadQR").addEventListener("click", downloadQR);
        genQR.addEventListener('click', () => {
            navigation(qrov);
            sideMenu.classList.add('hidden');
        });
        document.addEventListener('click', (e) => {
            if (e.target === qrov) navigation();
        });
    })();

    function lang_usage() {
        const w = document.getElementById('langWatermark');
        if (!w) return;
        const loc = (navigator.languages?.[0] || navigator.language || "en-US").replace("_", "-");
        const pt = loc.split("-");
        const cd = pt.find((p, i) => i > 0 && p.length === 2)?.toUpperCase() || "US";
        const cn = new Intl.DisplayNames([loc], {
            type: "region"
        }).of(cd).toUpperCase();
        w.textContent = `${cn} - ${cd}`;
    }

    const contentIns = document.querySelector(".input-preview-play");
    const isTalk = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
    const installPrompt = document.querySelector("#installPrompt");
    let isPrompt = null;
    function isAppInstalled() {
        return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    }
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        isPrompt = e;
    });
    installPrompt.addEventListener('click', async () => {
        if (!isPrompt) return;

        sideMenu.classList.remove('active');

        await isPrompt.prompt();
        const {
            outcome
        } = await isPrompt.userChoice;
        if (outcome === 'accepted') {
            console.log('User accepted install');
        } 
        isPrompt = null;
    });
    window.addEventListener("DOMContentLoaded",
        async () => {
            try {
                await Promise.all([
                    loadAudioData(),
                    resetPlayerUI()]);

                setInterval(lang_usage(), 1000);

                if (isAppInstalled()) {
                    installPrompt.querySelector('i').classList.add('active');
                }
                if (!isTalk) {
                    contentIns.style.display = 'none';
                }
            } catch {
                await cleanDB();
            }
        });
});