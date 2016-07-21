export interface IRequestPromise {
    reject: Function
    resolve: Function
}

export interface IRexyAdapter {
    get(id?: any, opts?: any): Promise<any|Array<any>>
    post(payload: any, opts?: any): Promise<any>
    put(id: any, payload: any, opts?: any): Promise<any>
    delete(id: any, opts?: any): Promise<any>
    clear(): void
}