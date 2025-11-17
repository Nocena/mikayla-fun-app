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
        time,
        sign: getSignCode(hexCode),
    }
}