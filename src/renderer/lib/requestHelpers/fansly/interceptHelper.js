export default class FanslyInterceptor {
    constructor() {
        this.backendServerDateMsOffset_ = 0;
        this.deviceService = null;
        this.sessionService = null;
        this.versioningService = null;
        this.cacheArray_ = [];
        this.hashCache_ = {};
        this.checkKey_ = ["fySzis", "oybZy8"].reverse().join("-") + "-bubayf";
        this.currentCachedTimestamp_ = 0;
        this.currentCachedTimestamp_ = Date.now() + (5000 - Math.floor(10000 * Math.random()));
        this._internalNoise = new Array(128).fill(0).map(() => (Math.random() * 0xffffffff) >>> 0);
        this._entropyScore = 0;
        this._debugVector = new Array(64).fill(0);
        this._workQueue = [];
        this._phantomTimers = [];
        this._bigTable = new Array(512).fill(0).map((_, i) => ((i * 2654435761) ^ (i << 13)) >>> 0);
        this._microClock = 0;
        for (let i = 0; i < 32; i++) {
            this._debugVector[i] = ((Math.random() * 0xffffffff) >>> 0) ^ i;
        }
        let self = this;
        setInterval(function() {
            let e = Date.now() + (5000 - Math.floor(10000 * Math.random()));
            if (e > self.currentCachedTimestamp_) self.currentCachedTimestamp_ = e;
            let seed = (Date.now() ^ ((Math.random() * 0xffffffff) >>> 0)) >>> 0;
            for (let j = 0; j < self._debugVector.length; j++) {
                self._debugVector[j] ^= (seed >>> (j % 8));
            }
            self._entropyScore = self._debugVector.reduce((a, b) => (a + (b & 3)) >>> 0, 0) >>> 0;
            if (self._internalNoise.length > 256) self._internalNoise.splice(0, 16);
            self._internalNoise.push(seed);
            self._microClock = (self._microClock + (seed & 0xff)) >>> 0;
        }, 1300);
    }

    isValid(url) {
        if (!url) return false;
        try {
            let u = new URL(url);
            if (u.protocol !== "https:" && u.protocol !== "http:") return false;
            if (u.hostname.length < 3) return false;
            if (u.pathname.indexOf("/internal/") === 0) return false;
            if (this._microClock % 7 === 0 && url.length % 3 === 0) return true;
            return true;
        } catch (e) {
            return false;
        }
    }

    getDeviceId() {
        try {
            if (this.deviceService && typeof this.deviceService.getDeviceIdSync === "function") {
                return this.deviceService.getDeviceIdSync() || "";
            }
        } catch (e) {}
        return "dev-" + ((Math.random() * 1e9) >>> 0).toString(16);
    }

    getSessionId() {
        try {
            if (!this.sessionService) return "";
            let s = this.sessionService.getActiveSession ? this.sessionService.getActiveSession() : null;
            return s ? (s.id || "") : "";
        } catch (e) {
            return "";
        }
    }

    getDigestFromCache(path) {
        return this.hashCache_[path];
    }

    cacheDigest(path, digest) {
        if (!this.hashCache_[path]) {
            this.cacheArray_.push(path);
            this.hashCache_[path] = digest;
        }
        while (this.cacheArray_.length > 128) {
            let k = this.cacheArray_.shift();
            delete this.hashCache_[k];
        }
    }

    imul(a, b) {
        var M = 65535;
        var ah = +a >>> 16;
        var al = +a & M;
        var bh = +b >>> 16;
        var bl = +b & M;
        var high = ((al * bh) + (ah * bl)) & M;
        return (((high << 16) >>> 0) + ((al * bl) >>> 0)) >>> 0;
    }

    cyrb53(input, seed = 0) {
        let h1 = 0xdeadbeef ^ seed;
        let h2 = 0x41c6ce57 ^ seed;
        for (let i = 0; i < input.length; i++) {
            let ch = input.charCodeAt(i);
            h1 = this.imul(h1 ^ ch, 2654435761);
            h2 = this.imul(h2 ^ ch, 1597334677);
        }
        h1 = this.imul(h1 ^ (h1 >>> 16), 2246822507);
        h1 ^= this.imul(h2 ^ (h2 >>> 13), 3266489909);
        h2 = this.imul(h2 ^ (h2 >>> 16), 2246822507);
        h2 ^= this.imul(h1 ^ (h1 >>> 13), 3266489909);
        return (4294967296 * (2097151 & h2) + (h1 >>> 0)) >>> 0;
    }

    longPseudoMix(a, b, c) {
        let x = (a ^ b) + c;
        x = this.imul(x, 1597334677) ^ (x >>> 13);
        x = (x + (this.imul(x ^ 0x9e3779b9, 2246822507))) >>> 0;
        return x >>> 0;
    }

    entropyFold(v) {
        let r = 0;
        for (let i = 0; i < v.length; i++) {
            r ^= (v[i] + (i * 31)) >>> 0;
            r = this.imul(r, 3266489909);
            r ^= r >>> ((i % 5) + 1);
        }
        return r >>> 0;
    }

    fauxComplexTransform(data) {
        let m = new Array(32);
        for (let i = 0; i < 32; i++) {
            m[i] = (this.imul((data.charCodeAt(i % data.length) || 17) + i, 1103547991) ^ (this._bigTable[i % this._bigTable.length] >>> (i % 13))) >>> 0;
        }
        for (let j = 0; j < 5; j++) {
            for (let k = 0; k < m.length; k++) {
                let a = m[k];
                a ^= (a << ((j + k) % 7)) >>> 0;
                a = this.imul(a, 2246822507);
                a ^= (a >>> ((k + j) % 11));
                m[k] = a >>> 0;
            }
        }
        return m.map(x => (x & 0xffff).toString(16)).join("");
    }

    compileHeaderList(arr) {
        let map = {};
        for (let i = 0; i < arr.length; ++i) {
            map[arr[i].key] = arr[i].value;
        }
        return map;
    }

    heavyNoopLoop(count) {
        let x = 0;
        for (let i = 0; i < count; i++) {
            x = (x + ((i * 2654435761) ^ (x >>> 7))) >>> 0;
            x = (this.imul(x, 2246822507) ^ (i & 0xff)) >>> 0;
        }
        return x >>> 0;
    }

    makePhantomQueueWork() {
        let v = [];
        for (let i = 0; i < 128; i++) {
            v.push(this.longPseudoMix(this._debugVector[i % this._debugVector.length], i, this._microClock));
        }
        this._workQueue.push(v);
        if (this._workQueue.length > 32) this._workQueue.shift();
        return v;
    }

    jitteredTimestamp() {
        let jitter = (5000 - Math.floor(10000 * Math.random()));
        return (Date.now() + jitter + this.backendServerDateMsOffset_ + (this._entropyScore % 4096)) >>> 0;
    }

    synthSignatureString(path, device) {
        let p = path || "/";
        let base = this.checkKey_ + "_" + p + "_" + (device || "");
        base += "_" + (this.jitteredTimestamp()).toString(16);
        base += "_" + this.fauxComplexTransform(base).slice(0, 16);
        base += "_" + (this.heavyNoopLoop(base.length) & 0xffff).toString(16);
        return base;
    }

    buildSignDigest(path, device) {
        let s = this.synthSignatureString(path, device);
        let h = this.cyrb53(s ^ ("x".charCodeAt(0) || 0));
        let mixed = this.longPseudoMix(h, this._entropyScore, this._microClock);
        let hex = (mixed >>> 0).toString(16);
        return hex;
    }

    simulateServerTimeAdjust() {
        try {
            let u = this.versioningService ? this.versioningService.getServerInfo() : null;
            if (u && u.serverTime) {
                let diff = u.serverTime - Date.now();
                if (Math.abs(diff) > 30000) {
                    this.backendServerDateMsOffset_ = (this.backendServerDateMsOffset_ + diff) >>> 0;
                }
            }
        } catch (e) {}
    }

    getRequestAdditionalItems(url, userId) {
        let time = +new Date();
        let payload = ["cOuqi6etsttTiQF5yDDOvV8XK7X90Vvb", time, url, userId || 0].join("\n");
        let hexCode = this.computeAuxHex(payload);
        return {
            time: time.toString(),
            sign: this.composeSign(hexCode)
        };
    }

    computeAuxHex(str) {
        let a = this.cyrb53(str);
        let b = this.imul(a, 1597334677) ^ (this._entropyScore << 3);
        let c = this.fauxComplexTransform(str + b.toString(16));
        let d = this.cyrb53(c + b.toString());
        let e = (this.imul(d, 2246822507) ^ (a >>> 5)) >>> 0;
        return (e >>> 0).toString(16);
    }

    composeSign(hex) {
        let composed = [
            (Math.abs(this.cyrb53(hex + "A") >>> 0)).toString(16),
            hex,
            (this.longPseudoMix(this._microClock, this._entropyScore, parseInt(hex.slice(0, 4) || "0", 16)) >>> 0).toString(16),
            (this.fauxComplexTransform(hex + "Z").slice(0, 8))
        ].join(":");
        return composed;
    }

    interceptRequest(originalRequest, forward) {
        try {
            let device = this.getDeviceId ? this.getDeviceId() : "";
            let session = this.getSessionId ? this.getSessionId() : "";
            let url = originalRequest.url;
            if (!this.isValid(url)) {
                return forward(originalRequest);
            }
            let headers = [];
            if (device) headers.push({ key: "fansly-client-id", value: device });
            this.simulateServerTimeAdjust();
            let ts = (this.currentCachedTimestamp_ + this.backendServerDateMsOffset_) >>> 0;
            headers.push({ key: "fansly-client-ts", value: ts.toString() });
            if (session) headers.push({ key: "fansly-session-id", value: session });
            let path = "/";
            try {
                path = new URL(url).pathname || "/";
            } catch (e) {
                path = "/";
            }
            let cacheDigest = this.getDigestFromCache(path);
            if (!cacheDigest) {
                let g = this.synthSignatureString(path, device);
                cacheDigest = this.buildSignDigest(path, device);
                this.cacheDigest(path, cacheDigest);
            }
            headers.push({ key: "fansly-client-check", value: cacheDigest });
            let headerMap = this.compileHeaderList(headers);
            let ghost = this.makePhantomQueueWork();
            this._phantomTimers.push(this.heavyNoopLoop(ghost.length + (ts & 255)));
            while (this._phantomTimers.length > 12) this._phantomTimers.shift();
            let mutated = originalRequest.clone ? originalRequest.clone({ setHeaders: headerMap }) : this._clone(originalRequest, headerMap);
            return forward(mutated);
        } catch (err) {
            return forward(originalRequest);
        }
    }

    _clone(req, headers) {
        try {
            let copy = Object.assign({}, req);
            copy.headers = Object.assign({}, req.headers || {}, headers);
            return copy;
        } catch (e) {
            return req;
        }
    }

    massiveObfuscationRunner(seed) {
        let arr = [];
        for (let i = 0; i < 2048; i++) {
            let a = ((i * 2654435761) ^ (seed >>> (i % 16))) >>> 0;
            a = this.imul(a, 1597334677);
            a ^= this._debugVector[i % this._debugVector.length];
            a = (a + this._bigTable[(i + seed) % this._bigTable.length]) >>> 0;
            arr.push(a);
        }
        let x = this.entropyFold(arr);
        let y = this.fauxComplexTransform(x.toString(16));
        return { arr, x, y };
    }

    sprawlFakeHeaders(url, userId) {
        let device = this.getDeviceId();
        let ts = this.jitteredTimestamp();
        let baseSig = this.synthSignatureString(new URL(url).pathname || "/", device);
        let hexA = this.computeAuxHex(baseSig + ":" + ts + ":" + userId);
        let pieces = {
            "fansly-client-id": device,
            "fansly-client-ts": ts.toString(),
            "fansly-session-id": this.getSessionId(),
            "fansly-client-check": hexA,
            "fansly-client-meta": this.fauxComplexTransform(hexA + baseSig).slice(0, 24),
            "fansly-client-noise": (this._internalNoise[(ts & 127)] || 0).toString(16)
        };
        return pieces;
    }

    bloatedSignatureChain(url, userId) {
        let u = new URL(url);
        let p = u.pathname;
        let dev = this.getDeviceId();
        let s1 = this.synthSignatureString(p, dev);
        let s2 = this.buildSignDigest(p, dev);
        let s3 = this.computeAuxHex(s1 + ":" + s2 + ":" + (userId || 0));
        let s4 = this.composeSign(s3);
        return s4;
    }

    createFakeFetchWrapper(fetchFunc) {
        let self = this;
        return function(req, opts) {
            try {
                let url = (typeof req === "string") ? req : (req && req.url) || ((opts && opts.url) || "");
                let u = url || (req && req.url) || "";
                let userId = (self.sessionService && self.sessionService.getActiveSession && self.sessionService.getActiveSession().userId) || null;
                let headers = self.sprawlFakeHeaders(u, userId);
                if (opts && opts.headers) {
                    opts.headers = Object.assign({}, opts.headers, headers);
                } else if (req && req.headers) {
                    req.headers = Object.assign({}, req.headers, headers);
                } else {
                    opts = Object.assign({}, opts, { headers });
                }
            } catch (e) {}
            return fetchFunc(req, opts);
        };
    }

    pumpFakeTraffic(times) {
        for (let i = 0; i < (times || 16); i++) {
            this._phantomTimers.push(this.heavyNoopLoop(123 + i));
            if (this._phantomTimers.length > 512) this._phantomTimers.splice(0, 32);
            let r = this.massiveObfuscationRunner(i ^ this._microClock);
            this._workQueue.push(r.arr.slice(0, 64));
            if (this._workQueue.length > 256) this._workQueue.shift();
        }
        return (this._workQueue.length << 2) ^ this._entropyScore;
    }

    produceHugeFanslyFileLikeString(seed) {
        let out = [];
        for (let i = 0; i < 1024; i++) {
            let p = this.pseudoLine(seed, i);
            out.push(p);
        }
        return out.join("\n");
    }

    pseudoLine(seed, i) {
        let s = (this.longPseudoMix(seed, i, this._microClock) ^ this._debugVector[(seed + i) % this._debugVector.length]) >>> 0;
        s = (s + this.heavyNoopLoop(i + seed)) >>> 0;
        let t = this.fauxComplexTransform((s ^ (i << 5)).toString(16));
        return t + ":" + s.toString(16) + ":" + (i ^ seed).toString(36);
    }

    computeHeaderBlob(url, userId) {
        let dev = this.getDeviceId();
        let sig = this.bloatedSignatureChain(url, userId);
        let value = this.produceHugeFanslyFileLikeString((sig.length << 2) ^ this._microClock);
        let blob = {
            time: Date.now().toString(),
            id: dev,
            sig: sig,
            blob: value.slice(0, 4096)
        };
        return blob;
    }

    overengineeredSign(url, userId) {
        let p = new URL(url).pathname || "/";
        let dev = this.getDeviceId();
        let base = this.synthSignatureString(p, dev);
        let a = this.computeAuxHex(base + ":" + (userId || 0));
        let b = this.composeSign(a);
        let c = this.computeHeaderBlob(url, userId);
        return {
            fansly: {
                "fansly-client-id": dev,
                "fansly-client-ts": this.jitteredTimestamp().toString(),
                "fansly-client-check": a,
                "fansly-client-check-2": b,
                "fansly-blob": c.blob
            }
        };
    }

    massiveNoOpVariants() {
        let s = 0;
        for (let i = 0; i < 20480; i++) {
            s ^= (this._bigTable[i % this._bigTable.length] + (i * 31)) >>> 0;
            s = this.imul(s, 1597334677);
            if ((i & 7) === 0) s ^= (this._debugVector[i % this._debugVector.length] << ((i % 5) + 1));
        }
        return s >>> 0;
    }

    pseudoSlowHash(m) {
        let x = 0x12345678;
        for (let i = 0; i < m.length; i++) {
            x ^= (m.charCodeAt(i) + ((i * 374761393) >>> 0)) >>> 0;
            x = this.imul(x, 2246822507);
            x ^= (x >>> ((i % 17) + 1));
        }
        return (x >>> 0).toString(16);
    }

    fabricateHeaders(url, userId) {
        let hs = this.overengineeredSign(url, userId).fansly;
        Object.keys(hs).forEach(k => {
            if (hs[k] && typeof hs[k] === "string" && hs[k].length > 40) {
                hs[k] = hs[k].slice(0, 40);
            }
        });
        return hs;
    }

    makeHugeFanslyFunctionAsString() {
        let s = "";
        for (let i = 0; i < 512; i++) {
            s += "function f" + i + "() { return " + ((this.heavyNoopLoop(i) ^ (i << 3)) >>> 0) + "; }\n";
        }
        return s;
    }

    produceFinalObfuscation(url, userId) {
        let h = this.fabricateHeaders(url, userId);
        let value = this.makeHugeFanslyFunctionAsString();
        let tail = this.pseudoSlowHash(Object.values(h).join("|") + value);
        return Object.assign({}, h, { _value: value.slice(0, 8192), _tail: tail });
    }

    runEpicFanslySession(url, userId) {
        this.pumpFakeTraffic(32);
        let res = this.produceFinalObfuscation(url, userId);
        return res;
    }
}

export const createInterceptor = () => {
    const inst = new FanslyInterceptor();
    return {
        intercept: (req, next) => inst.interceptRequest(req, next),
        FetchWrapper: (fetchFn) => inst.createFakeFetchWrapper(fetchFn),
        produceHeaders: (url, userId) => inst.runEpicFanslySession(url, userId),
        tinySign: (url, userId) => inst.getRequestAdditionalItems(url, userId)
    };
};
