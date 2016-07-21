import {IRexyAdapter} from './interfaces'

export class MemoryAdapter implements IRexyAdapter {
    private data:Map<number, any>

    constructor() {
        this.data = new Map()
    }

    get(id?:number, opts?:any):Promise<any|Array<any>> {
        return new Promise((resolve, reject) => {
            let result = null

            if (id >= 0) result = this.data.get(id)
            else {
                result = []
                for (let value of this.data.values()) result.push(value)
                console.log(result)
            }

            if (result) resolve(result)
            else reject(new Error(`no element found with id ${id}`))
        })
    }

    post(payload:any, opts?:any):Promise<any> {
        return new Promise(resolve => {
            payload.id = this.data.size
            this.data.set(payload.id, payload)
            resolve(payload)
        })
    }

    put(id:any, payload:any, opts?:any):Promise<any> {
        return new Promise((resolve, reject) => {
            let element = this.data.get(id)
            if (typeof element === 'undefined' || element === null) return reject(new Error(`no element found with id ${id}`))

            for (let key of Object.keys(payload)) {
                if (key !== 'id') element[key] = payload[key]
            }

            this.data.set(id, element)
            resolve(element)
        })
    }

    delete(id:any, opts?:any):Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.data.delete(id)) resolve()
            else reject(new Error(`no element found with id ${id}`))
        })
    }

    clear():void {
        this.data.clear()
    }
}

export class RexyWorker {
    constructor(private _adapter:IRexyAdapter) {
    }

    get adapter():IRexyAdapter {
        return this._adapter
    }

    set adapter(adapter:IRexyAdapter) {
        this._adapter.clear()
        this._adapter = adapter
    }
}

declare function postMessage(data: any): void;

export function worker() {
    console.log('ayo nonno!')
    let rexy = new RexyWorker(new MemoryAdapter())

    addEventListener('message', function (evt:MessageEvent) {
        let data = JSON.parse(evt.data)

        switch (data.action) {
            case 'set adapter':
                rexy.adapter = data.adapter
                break
            case 'GET':
                rexy.adapter.get(data.id, data.opts)
                    .then(res => {
                        postMessage(JSON.stringify({
                            action: 'response success',
                            requestId: data.requestId,
                            response: res
                        }))
                    })
                    .catch(err => {
                        postMessage(JSON.stringify({
                            action: 'response failure',
                            requestId: data.requestId,
                            response: err
                        }))
                    })
                break
            case 'POST':
                console.log('posting?')
                rexy.adapter.post(data.payload, data.opts)
                    .then(res => {
                        console.log('postato cheers')
                        postMessage(JSON.stringify({
                            action: 'response success',
                            requestId: data.requestId,
                            response: res
                        }))
                    })
                    .catch(err => {
                        console.log('postato cheers error', err)
                        postMessage(JSON.stringify({
                            action: 'response failure',
                            requestId: data.requestId,
                            response: err
                        }))
                    })
                break
            case 'PUT':
                rexy.adapter.put(data.id, data.payload, data.opts)
                    .then(res => {
                        postMessage(JSON.stringify({
                            action: 'response success',
                            requestId: data.requestId,
                            response: res
                        }))
                    })
                    .catch(err => {
                        postMessage(JSON.stringify({
                            action: 'response failure',
                            requestId: data.requestId,
                            response: err
                        }))
                    })
                break
            case 'DELETE':
                rexy.adapter.delete(data.id, data.opts)
                    .then(res => {
                        postMessage(JSON.stringify({
                            action: 'response success',
                            requestId: data.requestId,
                            response: res
                        }))
                    })
                    .catch(err => {
                        postMessage(JSON.stringify({
                            action: 'response failure',
                            requestId: data.requestId,
                            response: err
                        }))
                    })
                break
        }
    }, false)
}
