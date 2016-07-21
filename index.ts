import {IRequestPromise} from './lib/interfaces'
import {worker, RexyWorker, MemoryAdapter} from './lib/rexy-worker'

function generateId(): string {
    let text = ''
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

    for (let i = 0; i < 5; i++) text += possible.charAt(Math.floor(Math.random() * possible.length))

    text += '_' + Date.now()

    return text
}

export default class Rexy {
    private worker: Worker
    private requests: Map<string, IRequestPromise>

    constructor(adapter?: any) {
        this.requests = new Map()

        let blob: Blob

        try {
            blob = new Blob([RexyWorker.toString() + MemoryAdapter.toString() + worker.toString() + 'worker()'], {type: 'application/javascript'})
        } catch (err) {
            console.error(err)
        }

        this.worker = new Worker(URL.createObjectURL(blob))
        this.worker.onmessage = (evt: MessageEvent) => {
            let data = JSON.parse(evt.data)

            if (data.action === 'response success') {
                let req = this.requests.get(data.requestId)

                req.resolve(data.response)
                this.requests.delete(data.requestId)
            }
            else if (data.action === 'response failure') {
                let req = this.requests.get(data.requestId)

                req.reject(data.response)
                this.requests.delete(data.requestId)
            }
        }

        if (adapter) {
            this.worker.postMessage(JSON.stringify({
                action: 'set adapter',
                adapter: adapter
            }))
        }
    }

    get(id?: any, opts?: any): Promise<any|Array<any>> {
        return new Promise((resolve, reject) => {
            let requestId = generateId()
            this.requests.set(requestId, {resolve: resolve, reject: reject})
            this.worker.postMessage(JSON.stringify({
                action: 'GET',
                requestId: requestId,
                id: id,
                opts: opts
            }))
        })
    }

    post(payload: any, opts?: any): Promise<any> {
        return new Promise((resolve, reject) => {
            let requestId = generateId()
            this.requests.set(requestId, {resolve: resolve, reject: reject})
            this.worker.postMessage(JSON.stringify({
                action: 'POST',
                requestId: requestId,
                payload: payload,
                opts: opts
            }))
        })
    }

    put(id: any, payload: any, opts?: any): Promise<any> {
        return new Promise((resolve, reject) => {
            let requestId = generateId()
            this.requests.set(requestId, {resolve: resolve, reject: reject})
            this.worker.postMessage(JSON.stringify({
                action: 'PUT',
                requestId: requestId,
                id: id,
                payload: payload,
                opts: opts
            }))
        })
    }

    delete(id: any, opts?: any): Promise<any> {
        return new Promise((resolve, reject) => {
            let requestId = generateId()
            this.requests.set(requestId, {resolve: resolve, reject: reject})
            this.worker.postMessage(JSON.stringify({
                action: 'DELETE',
                requestId: requestId,
                id: id,
                opts: opts
            }))
        })
    }
}



