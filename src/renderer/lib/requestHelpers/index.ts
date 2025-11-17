import {getRequestAdditionalItems} from "./signHelper";

export const needSignTimeHeaders = (headers: Record<string, string>, url: string, userId: string): Record<string, string> => {
    return {
        ...headers,
        'user-id': userId,
        ...getRequestAdditionalItems(url, userId)
    }
}