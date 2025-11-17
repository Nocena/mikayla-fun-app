import HashHelper from "./HashHelper";

const addFunc = (W: any, n: any) => {return W+n}
const modFunc = (W: any, n: any) => {return W % n}
const subFunc = (W: any, n: any) => {return W - n}

export const getSignCode = (W: string) => {
    const ttResult = Math.abs(
        addFunc(
            addFunc(addFunc(addFunc(addFunc(addFunc(addFunc(addFunc(
                            addFunc(addFunc(addFunc(addFunc(addFunc(addFunc(
                                        addFunc(addFunc(addFunc(addFunc(addFunc(
                                                    addFunc(addFunc(addFunc(addFunc(addFunc(addFunc(
                                                                        subFunc(W[modFunc(51336, W.length)].charCodeAt(0), 97) +
                                                                        subFunc(W[modFunc(50796, W.length)].charCodeAt(0), 65),
                                                                        W[modFunc(50481, W.length)].charCodeAt(0) + 131
                                                                    ), subFunc(W[modFunc(51247, W.length)].charCodeAt(0), 84)),
                                                                    addFunc(W[modFunc(52843, W.length)].charCodeAt(0), 81)),
                                                                W[modFunc(50561, W.length)].charCodeAt(0) + 81),
                                                            subFunc(W[modFunc(52962, W.length)].charCodeAt(0), 121)),
                                                        addFunc(W[modFunc(50947, W.length)].charCodeAt(0), 101)),
                                                    addFunc(W[modFunc(51388, W.length)].charCodeAt(0), 80)) +
                                                subFunc(W[51443 % W.length].charCodeAt(0), 74),
                                                addFunc(W[modFunc(51728, W.length)].charCodeAt(0), 124)),
                                            W[modFunc(51023, W.length)].charCodeAt(0) + 91), subFunc(W[modFunc(51620, W.length)].charCodeAt(0), 77)
                                        ) + subFunc(W[51178 % W.length].charCodeAt(0), 89), W[modFunc(52685, W.length)].charCodeAt(0) + 79),
                                        addFunc(W[52181 % W.length].charCodeAt(0), 75)), subFunc(W[modFunc(51908, W.length)].charCodeAt(0), 109)),
                                    subFunc(W[modFunc(52619, W.length)].charCodeAt(0), 116)), addFunc(W[modFunc(53078, W.length)].charCodeAt(0), 138)),
                                subFunc(W[modFunc(52009, W.length)].charCodeAt(0), 110)) + addFunc(W[modFunc(50665, W.length)].charCodeAt(0), 59),
                                addFunc(W[modFunc(50743, W.length)].charCodeAt(0), 101)), subFunc(W[modFunc(51803, W.length)].charCodeAt(0), 102)),
                        addFunc(W[modFunc(51547, W.length)].charCodeAt(0), 131)), subFunc(W[modFunc(52398, W.length)].charCodeAt(0), 117)),
                    addFunc(W[52773 % W.length].charCodeAt(0), 93)), addFunc(W[modFunc(52514, W.length)].charCodeAt(0), 118)),
                addFunc(W[modFunc(50615, W.length)].charCodeAt(0), 77)), subFunc(W[50849 % W.length].charCodeAt(0), 54)
            ) +
            addFunc(W[52295 % W.length].charCodeAt(0), 121) + addFunc(W[modFunc(51099, W.length)].charCodeAt(0), 103),
            addFunc(W[modFunc(52127, W.length)].charCodeAt(0), 149)
        )
    ).toString(16)

    return ['50367', W, ttResult, '691739e1'].join(':')
}
// "50367:03059bc2c4e8e5a8b706dd16cb9654062adaecb3:b30:691739e1"

export const getRequestAdditionalItems = (url: string, userId: string | null) => {
    const time = +new Date
    const t = `twFXBitgr6veiKlIh74YEOLLb55N26Pr\n${time}\n${url}\n${userId || 0}`
    const hexCode = new HashHelper().update(t).hex()
    return {
        time: time.toString(),
        sign: getSignCode(hexCode),
    }
}



/*function f(W, o) {
    const n = i();
    return f = function(o, c) {
        let t = n[o -= 382];
        if (void 0 === f.vquZtt) {
            var r = function(W) {
                const o = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=";
                let n = ""
                    , c = "";
                for (let t = 0, r, e, u = 0; e = W.charAt(u++); ~e && (r = t % 4 ? 64 * r + e : e,
                t++ % 4) ? n += String.fromCharCode(255 & r >> (-2 * t & 6)) : 0)
                    e = o.indexOf(e);
                for (let t = 0, r = n.length; t < r; t++)
                    c += "%" + ("00" + n.charCodeAt(t).toString(16)).slice(-2);
                return decodeURIComponent(c)
            };
            const o = function(W, o) {
                let n = [], c = 0, t, e = "", u;
                for (W = r(W),
                         u = 0; u < 256; u++)
                    n[u] = u;
                for (u = 0; u < 256; u++)
                    c = (c + n[u] + o.charCodeAt(u % o.length)) % 256,
                        t = n[u],
                        n[u] = n[c],
                        n[c] = t;
                u = 0,
                    c = 0;
                for (let r = 0; r < W.length; r++)
                    u = (u + 1) % 256,
                        c = (c + n[u]) % 256,
                        t = n[u],
                        n[u] = n[c],
                        n[c] = t,
                        e += String.fromCharCode(W.charCodeAt(r) ^ n[(n[u] + n[c]) % 256]);
                return e
            };
            f.kppLZf = o,
                W = arguments,
                f.vquZtt = !0
        }
        const e = undefined
            , u = o + n[0]
            , k = W[u];
        return k ? t = k : (void 0 === f.aisMTe && (f.aisMTe = !0),
            t = f.kppLZf(t, c),
            W[u] = t),
            t
    }
        ,
        f(W, o)
}*/


const W = ["W6yxW6XPBW", "WOFdV0bko8oOhCkxat0", "tvVdUCoxWO0", "Dv4ZW5FdINm", "W4BcNmogWPNcOKu", "W7O6WPpcRflcNG", "h8oieSoVoG", "W7JdMHtcMCkf", "WRdcQmkecmks", "WO3cICkvs8kHxa", "CCkoWRFdJ3DRkdr3ta", "W6yyW6/dMCk6WOu", "W4ZdNmkstSkkDmo9WRedaXO", "Emobzby9", "W4NdRwO+vW", "AXWlWRiv", "W4SSESoUjW", "hSkYx8kzW6eXeCooWRO9", "WPhdPu0", "WQ1bySkeeq", "W4VcHKBcJ3K", "W6pcMN/cGefP", "rmkVwmoJW4O", "WQZdHwLDkG", "W6ZdSfhdQCofW6C", "W4/dJdhcPCkn", "p8oybSkusG", "WPBdLZxcTSkAnG", "rmk7oZmH", "v8kAea", "mSk8WQlcUrS", "W67dUmoZs8kH", "W6dcKmoPWPBcUG", "W7dcG8oLWORcTW", "l8owvXOr", "D8kJWQ3dVLtcRKKybu4", "W6FdMK3dGCoq", "WRNcJmkTlCk4BetcGCkrW5G", "WPJcHSkEk8kt", "W5NcL8otW6ldSG", "W4ZcM8okW4JdQqu", "WQ7cOCk8kmkj", "m8o8BchdLa", "FSkdWRJdMKbS", "W6ZcL3dcLxzUW7NdH8o6W4O", "sSoRdSoDW4K5o8oQWROQ", "jmophCkfBG", "W4FcLmoYWQBcNG", "WQbCvr9KlG", "WRtcMNXgW6/cUSkqWRNdRYm", "kSoZW7BcRNBcTG", "kCkcWRfMwxFdNZRcNmo5W4G1", "zqxcKwVdIa", "WP7cNCkBn8k3", "W6pdVv7dVmoYW6bzymktAq", "xKK7W5VdIG", "W6NcPZhdRW", "WONcNCk5F8k6", "Ax8PW4NdHa", "W7VdGSoYqSku", "WOBcISoWgmo0", "q8kMtmogW7JcRa", "WQzRFSkSbeu", "uWhcOmoCWOddGYJdRshdKq", "WQ52BbL/", "W7Gky8oFmq", "W7qaW7H3rG", "WPKSWQ/cUX4", "srVcJuldUG", "AehdOCovWQW", "W6pdUWmuW60", "v8k0tbC3BI9z", "WPZcUqX6lhrTWQuAWPen", "WPBcGCoadmo4x8oSWPKtpW", "W73cLdRdLJS", "WOhdVmoJC3X8", "fSk2WR/cVZO", "WQWkDf/dIq", "W4Oltmo9c2rYWQ5MWPi", "WQ7dKbhcKSkM", "W7lcLmoTW4VdIq", "W7NcPJFdSZddPqddNCoLbq", "kSo1WRnreG", "oSoEiCkDra", "WRK8WPpcKJ0", "BCk6gYKoWQWUx8kBW7G", "r8oaq8oeW7NcImkNjWay", "imoiWOTPpW", "WRBcGCkIomkpAW", "CSk8c8kxWOq", "hmoonCojmq", "DZVcKmoRWRe", "iw1sbCkeWPW5WP3cOCkO", "WOrGWQ0xf8k1iHHZaSoXWPe", "WQbHECkL", "W5u4W7HxymoIjaXQha", "W7BcQZJdPGFdOG", "iCo4u8kDwdW", "W4ugq8oOpgm", "sSotW7uqpa", "WOJdSK9FdmoV", "W4D6W4/dV2neWPiYW6ZcHColWQxdIa", "WPxdG3vxlG", "FmovW60Zgsy", "W445qCoyaa", "qc59j8oFz8omFJtcTCkgECkm", "W5ZcQ8oCEeDfEmod", "WPddO2rvfG", "W65AfaNdPmkXWPbvW7VdOq", "WOaHWPlcRW", "xSkchmkCBWyjWQy", "WPFdJ8kuWPNdTGOmdgxcGG", "jCoCAdtdICkJWO08", "W5/dUCoWwCkg", "dSkjuCo9WO5EWRaGWRi", "fNuUy8kTpSkquItcSG", "WPGTWPhcRsCB", "kCoNdSkFwa", "j8oYvmku", "lMbDemkZWPS", "sComCSohW7C", "WQ9rwGPtkttcTCkcW4e", "t8oWoCocW70", "feVcV8oueG", "hmoUhmoQoW", "iCo0EXam", "WRBcRa7dR8ouWRClmq", "uSoGW6igca", "WRWbreVdHCk0WRP+W7VdVa", "W6KvW6ddJmknWOjqgSkzW7m", "aLNdTCkCW7FcLc7dUtJdJY5B", "C8oyW6iMlIhdNYFcJSoN", "BqhcILVdJCoNu8k6n8oE", "emoxW6NcH3q", "WQVdVwFcSrhdOcRdTSoLga", "W6zBfWVcSSoIWRPJW6NdOSoutW", "yvJdNCokWOjlWRlcMqVdSSkVW5NdJ8oFfcyzjYm", "eg96e8kt", "uSkWdmkuWPS", "tmkRq8otW4/cQYNcSWtdTq", "W7RdVSowwCklWP5HW7avWRNcQ3vQy8kNuJXkWQlcTKe4WPW", "u8kufSoZb1CQW5q", "W6VdTGhcKSk8ErBcUbLL", "W5ahW4ZdISkV", "tmotcSoH", "o8oHsg18W7vYC8klW7/dG8k6WR8", "tmkWkc8L", "oKHVWPqDE08cDCo+", "W4JdRfqOBLS", "WO3cPSoMdmod", "qmoHiJ4oWOK5ymkcW7BdGCohW48Hl8kJW65yFCkLwsG1vINdSc8QW59PAWu", "W6/dLmo5B8op", "WRZdJshdKGu2WQVdKSo5W5T0WRf+", "dLfyhSkR", "W6ldLmo6ASonreBcRmkfW6u4", "WQ4YWRlcVJi", "W7FcOWZdMtS", "iCo+xYS6", "ECkkWQZdV3i", "lSo1xmkiBZVcHd4oWOq", "bunCW5niz8oujCkheL0"];
