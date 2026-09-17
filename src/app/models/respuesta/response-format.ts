export interface RespFormat<T = any> {
    Success: boolean;
    Status: number | string;
    Message: any;
    Data: T;
}
