import { RespFormat } from "../app/models/respuesta/response-format";

export function checkResponse(resp: RespFormat): boolean {
    resp.Status = typeof resp.Status === 'number' ? resp.Status : parseInt(resp.Status, 10);
    return (resp.Status >= 200 && resp.Status <= 299 && resp.Success);
}

export function checkContent(data: any): boolean {
    if (Array.isArray(data) && data.length > 0) {
        if (typeof data[0] === 'object' && Object.keys(data[0]).length > 0) {
            return true;
        } else {
            return false;
        }
    } else if (typeof data === 'object' && Object.keys(data).length > 0) {
        return true;
    } else {
        return false;
    }
}