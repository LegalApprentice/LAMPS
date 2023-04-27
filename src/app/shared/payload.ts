    
export interface IPayloadWrapper<T> {
    dateTime: string;
    hasError: boolean;
    status: string;
    length: number;
    message: string;
    payload: Array<T>;
    payloadType: string;
    error: any;
}

export class PayloadWrapper<T> implements IPayloadWrapper<T> {
    dateTime: string;
    hasError: boolean;
    status: string;
    length: number;
    message: string;
    payload: Array<T>;
    payloadType: string;
    error: any;
}

// export interface HttpErrorResponse {
//     message: string;
//     error: string;
//     status: number;
//     statusText: string;
// }

