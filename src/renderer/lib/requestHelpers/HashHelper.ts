export default class HashHelper {
    private blocks: number[];
    private h0: number;
    private h1: number;
    private h2: number;
    private h3: number;
    private h4: number;

    private block: number;
    private start: number;
    private bytes: number;
    private hBytes: number;
    private finalized: boolean;
    private hashed: boolean;
    private first: boolean;
    private lastByteIndex: number = 0;

    constructor() {
        this.blocks = [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 1056, 683802624, 0, 2112, 1367605248, 1056, 683806848,
            -1559756800, 0, 8448, 1175453697, 5280, -1949679104,
            -1944056734, 2034630656, 33792, 406851717, -1559735680,
            791218178, 813699210, -1559756800, 131200, -1039663084, 84480,
            -1130094584, -1040134552, -974913529, 544896, 654907601,
            -1819471414, 1175224355, 134285475, 813716106, 789059714,
            -2088238772, 1319936, -771620722, 537703436, 1902708862,
            805640330, -744911598, 953359401, -1564474848, -2146316112,
            396953771, 847339146, 266867919, 21626880, -1541340996,
            810445000, -469760059, 139493376, 152621351, -1928205421,
            1250960199, 17410824, -1328363462, -2076635603, -1597944692,
            338004992, 717326045, 1010299690
        ];

        this.h0 = 1732584193;
        this.h1 = 4023233417;
        this.h2 = 2562383102;
        this.h3 = 271733878;
        this.h4 = 3285377520;

        this.block = 0;
        this.start = 0;
        this.bytes = 0;
        this.hBytes = 0;
        this.finalized = false;
        this.hashed = false;
        this.first = true;
    }

    /**
     * Missing function placeholder:
     * R(input: string | number[]): [string, boolean];
     */
    private R(input: any): [string, boolean] {
        // TODO: Replace with correct logic
        return [input, true];
    }

    update(input: string | number[]): this {
        if (this.finalized) throw new Error("Hash already finalized");

        const [t, r] = this.R(input);

        let n: number;
        let i = 0;
        const s = t.length;
        const h = this.blocks;

        // Missing global array "g" used for bit offsets
        const g = [24, 16, 8, 0];

        while (i < s) {
            if (this.hashed) {
                this.hashed = false;
                h[0] = this.block;
                this.block = h[16] =
                    h[1] = h[2] = h[3] = h[4] = h[5] = h[6] = h[7] =
                        h[8] = h[9] = h[10] = h[11] = h[12] = h[13] = h[14] = h[15] = 0;
            }

            let a = this.start;

            if (r) {
                // UTF-8 conversion path
                while (i < s && a < 64) {
                    n = t.charCodeAt(i);

                    if (n < 128) {
                        h[a >>> 2] |= n << g[a & 3];
                        a++;
                    } else if (n < 2048) {
                        h[a >>> 2] |= (192 | (n >>> 6)) << g[a & 3];
                        a++;
                        h[a >>> 2] |= (128 | (n & 63)) << g[a & 3];
                        a++;
                    } else if (n < 55296 || n >= 57344) {
                        h[a >>> 2] |= (224 | (n >>> 12)) << g[a & 3];
                        a++;
                        h[a >>> 2] |= (128 | ((n >>> 6) & 63)) << g[a & 3];
                        a++;
                        h[a >>> 2] |= (128 | (n & 63)) << g[a & 3];
                        a++;
                    } else {
                        // Surrogate pair
                        i++;
                        n = 65536 + (((n & 1023) << 10) | (t.charCodeAt(i) & 1023));
                        h[a >>> 2] |= (240 | (n >>> 18)) << g[a & 3];
                        a++;
                        h[a >>> 2] |= (128 | ((n >>> 12) & 63)) << g[a & 3];
                        a++;
                        h[a >>> 2] |= (128 | ((n >>> 6) & 63)) << g[a & 3];
                        a++;
                        h[a >>> 2] |= (128 | (n & 63)) << g[a & 3];
                        a++;
                    }

                    i++;
                }
            } else {
                // raw bytes path
                while (i < s && a < 64) {
                    // @ts-ignore
                    h[a >>> 2] |= t[i] << g[a & 3];
                    i++;
                    a++;
                }
            }

            this.lastByteIndex = a;
            this.bytes += a - this.start;

            if (a >= 64) {
                this.block = h[16];
                this.start = a - 64;
                this.hash();
                this.hashed = true;
            } else {
                this.start = a;
            }
        }

        if (this.bytes > 0xffffffff) {
            this.hBytes += (this.bytes / 0x100000000) | 0;
            this.bytes = this.bytes % 0x100000000;
        }

        return this;
    }

    private hash(): void {
        var t = this.h0, e = this.h1, r = this.h2, n = this.h3, i = this.h4, f, a, s, h = this.blocks;
        for (a = 16; a < 80; ++a)
            s = h[a - 3] ^ h[a - 8] ^ h[a - 14] ^ h[a - 16],
                h[a] = s << 1 | s >>> 31;
        for (a = 0; a < 20; a += 5)
            t = (s = (e = (s = (r = (s = (n = (s = (i = (s = t << 5 | t >>> 27) + (f = e & r | ~e & n) + i + 1518500249 + h[a] | 0) << 5 | i >>> 27) + (f = t & (e = e << 30 | e >>> 2) | ~t & r) + n + 1518500249 + h[a + 1] | 0) << 5 | n >>> 27) + (f = i & (t = t << 30 | t >>> 2) | ~i & e) + r + 1518500249 + h[a + 2] | 0) << 5 | r >>> 27) + (f = n & (i = i << 30 | i >>> 2) | ~n & t) + e + 1518500249 + h[a + 3] | 0) << 5 | e >>> 27) + (f = r & (n = n << 30 | n >>> 2) | ~r & i) + t + 1518500249 + h[a + 4] | 0,
                r = r << 30 | r >>> 2;
        for (; a < 40; a += 5)
            t = (s = (e = (s = (r = (s = (n = (s = (i = (s = t << 5 | t >>> 27) + (f = e ^ r ^ n) + i + 1859775393 + h[a] | 0) << 5 | i >>> 27) + (f = t ^ (e = e << 30 | e >>> 2) ^ r) + n + 1859775393 + h[a + 1] | 0) << 5 | n >>> 27) + (f = i ^ (t = t << 30 | t >>> 2) ^ e) + r + 1859775393 + h[a + 2] | 0) << 5 | r >>> 27) + (f = n ^ (i = i << 30 | i >>> 2) ^ t) + e + 1859775393 + h[a + 3] | 0) << 5 | e >>> 27) + (f = r ^ (n = n << 30 | n >>> 2) ^ i) + t + 1859775393 + h[a + 4] | 0,
                r = r << 30 | r >>> 2;
        for (; a < 60; a += 5)
            t = (s = (e = (s = (r = (s = (n = (s = (i = (s = t << 5 | t >>> 27) + (f = e & r | e & n | r & n) + i - 1894007588 + h[a] | 0) << 5 | i >>> 27) + (f = t & (e = e << 30 | e >>> 2) | t & r | e & r) + n - 1894007588 + h[a + 1] | 0) << 5 | n >>> 27) + (f = i & (t = t << 30 | t >>> 2) | i & e | t & e) + r - 1894007588 + h[a + 2] | 0) << 5 | r >>> 27) + (f = n & (i = i << 30 | i >>> 2) | n & t | i & t) + e - 1894007588 + h[a + 3] | 0) << 5 | e >>> 27) + (f = r & (n = n << 30 | n >>> 2) | r & i | n & i) + t - 1894007588 + h[a + 4] | 0,
                r = r << 30 | r >>> 2;
        for (; a < 80; a += 5)
            t = (s = (e = (s = (r = (s = (n = (s = (i = (s = t << 5 | t >>> 27) + (f = e ^ r ^ n) + i - 899497514 + h[a] | 0) << 5 | i >>> 27) + (f = t ^ (e = e << 30 | e >>> 2) ^ r) + n - 899497514 + h[a + 1] | 0) << 5 | n >>> 27) + (f = i ^ (t = t << 30 | t >>> 2) ^ e) + r - 899497514 + h[a + 2] | 0) << 5 | r >>> 27) + (f = n ^ (i = i << 30 | i >>> 2) ^ t) + e - 899497514 + h[a + 3] | 0) << 5 | e >>> 27) + (f = r ^ (n = n << 30 | n >>> 2) ^ i) + t - 899497514 + h[a + 4] | 0,
                r = r << 30 | r >>> 2;
        this.h0 = this.h0 + t | 0,
            this.h1 = this.h1 + e | 0,
            this.h2 = this.h2 + r | 0,
            this.h3 = this.h3 + n | 0,
            this.h4 = this.h4 + i | 0
    }

    finalize(): void {
        if (!this.finalized) {
            this.finalized = !0;
            var t = this.blocks
                , e = this.lastByteIndex;
            t[16] = this.block,
                t[e >>> 2] |= [-2147483648, 8388608, 32768, 128][3 & e],
                this.block = t[16],
            e >= 56 && (this.hashed || this.hash(),
                t[0] = this.block,
                t[16] = t[1] = t[2] = t[3] = t[4] = t[5] = t[6] = t[7] = t[8] = t[9] = t[10] = t[11] = t[12] = t[13] = t[14] = t[15] = 0),
                t[14] = this.hBytes << 3 | this.bytes >>> 29,
                t[15] = this.bytes << 3,
                this.hash()
        }
    }

    hex(): string {
        this.finalize();

        const b = "0123456789abcdef".split("");

        const v = [this.h0, this.h1, this.h2, this.h3, this.h4];
        let out = "";

        for (const x of v) {
            out +=
                b[(x >>> 28) & 15] + b[(x >>> 24) & 15] + b[(x >>> 20) & 15] +
                b[(x >>> 16) & 15] + b[(x >>> 12) & 15] + b[(x >>> 8) & 15] +
                b[(x >>> 4) & 15] + b[x & 15];
        }

        return out;
    }
}
