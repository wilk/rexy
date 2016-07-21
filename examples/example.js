/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
	    return new (P || (P = Promise))(function (resolve, reject) {
	        function fulfilled(value) {
	            try {
	                step(generator.next(value));
	            } catch (e) {
	                reject(e);
	            }
	        }
	        function rejected(value) {
	            try {
	                step(generator.throw(value));
	            } catch (e) {
	                reject(e);
	            }
	        }
	        function step(result) {
	            result.done ? resolve(result.value) : new P(function (resolve) {
	                resolve(result.value);
	            }).then(fulfilled, rejected);
	        }
	        step((generator = generator.apply(thisArg, _arguments)).next());
	    });
	};
	const index_1 = __webpack_require__(2);
	(function () {
	    return __awaiter(this, void 0, void 0, function* () {
	        try {
	            let rexy = new index_1.default();
	            let res = yield rexy.post({ test: 'lool' });
	            console.log(res);
	            res = yield rexy.get(res.id);
	            console.log(res);
	            res = yield rexy.put(res.id, { test: 'ghgh', asd: 'hey!' });
	            console.log(res);
	            res = yield rexy.get();
	            console.log(res);
	            yield rexy.delete(res[0].id);
	        } catch (err) {
	            console.error(err);
	        }
	    });
	})();

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	const rexy_worker_1 = __webpack_require__(3);
	function generateId() {
	    let text = '';
	    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	    for (let i = 0; i < 5; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
	    text += '_' + Date.now();
	    return text;
	}
	class Rexy {
	    constructor(adapter) {
	        this.requests = new Map();
	        let blob;
	        try {
	            blob = new Blob([rexy_worker_1.RexyWorker.toString() + rexy_worker_1.MemoryAdapter.toString() + rexy_worker_1.worker.toString() + 'worker()'], { type: 'application/javascript' });
	        } catch (err) {
	            console.error(err);
	        }
	        this.worker = new Worker(URL.createObjectURL(blob));
	        this.worker.onmessage = evt => {
	            let data = JSON.parse(evt.data);
	            if (data.action === 'response success') {
	                let req = this.requests.get(data.requestId);
	                req.resolve(data.response);
	                this.requests.delete(data.requestId);
	            } else if (data.action === 'response failure') {
	                let req = this.requests.get(data.requestId);
	                req.reject(data.response);
	                this.requests.delete(data.requestId);
	            }
	        };
	        if (adapter) {
	            this.worker.postMessage(JSON.stringify({
	                action: 'set adapter',
	                adapter: adapter
	            }));
	        }
	    }
	    get(id, opts) {
	        return new Promise((resolve, reject) => {
	            let requestId = generateId();
	            this.requests.set(requestId, { resolve: resolve, reject: reject });
	            this.worker.postMessage(JSON.stringify({
	                action: 'GET',
	                requestId: requestId,
	                id: id,
	                opts: opts
	            }));
	        });
	    }
	    post(payload, opts) {
	        return new Promise((resolve, reject) => {
	            let requestId = generateId();
	            this.requests.set(requestId, { resolve: resolve, reject: reject });
	            this.worker.postMessage(JSON.stringify({
	                action: 'POST',
	                requestId: requestId,
	                payload: payload,
	                opts: opts
	            }));
	        });
	    }
	    put(id, payload, opts) {
	        return new Promise((resolve, reject) => {
	            let requestId = generateId();
	            this.requests.set(requestId, { resolve: resolve, reject: reject });
	            this.worker.postMessage(JSON.stringify({
	                action: 'PUT',
	                requestId: requestId,
	                id: id,
	                payload: payload,
	                opts: opts
	            }));
	        });
	    }
	    delete(id, opts) {
	        return new Promise((resolve, reject) => {
	            let requestId = generateId();
	            this.requests.set(requestId, { resolve: resolve, reject: reject });
	            this.worker.postMessage(JSON.stringify({
	                action: 'DELETE',
	                requestId: requestId,
	                id: id,
	                opts: opts
	            }));
	        });
	    }
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Rexy;

/***/ },
/* 3 */
/***/ function(module, exports) {

	"use strict";
	
	class MemoryAdapter {
	    constructor() {
	        this.data = new Map();
	    }
	    get(id, opts) {
	        return new Promise((resolve, reject) => {
	            let result = null;
	            if (id >= 0) result = this.data.get(id);else {
	                result = [];
	                for (let value of this.data.values()) result.push(value);
	                console.log(result);
	            }
	            if (result) resolve(result);else reject(new Error(`no element found with id ${ id }`));
	        });
	    }
	    post(payload, opts) {
	        return new Promise(resolve => {
	            payload.id = this.data.size;
	            this.data.set(payload.id, payload);
	            resolve(payload);
	        });
	    }
	    put(id, payload, opts) {
	        return new Promise((resolve, reject) => {
	            let element = this.data.get(id);
	            if (typeof element === 'undefined' || element === null) return reject(new Error(`no element found with id ${ id }`));
	            for (let key of Object.keys(payload)) {
	                if (key !== 'id') element[key] = payload[key];
	            }
	            this.data.set(id, element);
	            resolve(element);
	        });
	    }
	    delete(id, opts) {
	        return new Promise((resolve, reject) => {
	            if (this.data.delete(id)) resolve();else reject(new Error(`no element found with id ${ id }`));
	        });
	    }
	    clear() {
	        this.data.clear();
	    }
	}
	exports.MemoryAdapter = MemoryAdapter;
	class RexyWorker {
	    constructor(_adapter) {
	        this._adapter = _adapter;
	    }
	    get adapter() {
	        return this._adapter;
	    }
	    set adapter(adapter) {
	        this._adapter.clear();
	        this._adapter = adapter;
	    }
	}
	exports.RexyWorker = RexyWorker;
	function worker() {
	    console.log('ayo nonno!');
	    let rexy = new RexyWorker(new MemoryAdapter());
	    addEventListener('message', function (evt) {
	        let data = JSON.parse(evt.data);
	        switch (data.action) {
	            case 'set adapter':
	                rexy.adapter = data.adapter;
	                break;
	            case 'GET':
	                rexy.adapter.get(data.id, data.opts).then(res => {
	                    postMessage(JSON.stringify({
	                        action: 'response success',
	                        requestId: data.requestId,
	                        response: res
	                    }));
	                }).catch(err => {
	                    postMessage(JSON.stringify({
	                        action: 'response failure',
	                        requestId: data.requestId,
	                        response: err
	                    }));
	                });
	                break;
	            case 'POST':
	                console.log('posting?');
	                rexy.adapter.post(data.payload, data.opts).then(res => {
	                    console.log('postato cheers');
	                    postMessage(JSON.stringify({
	                        action: 'response success',
	                        requestId: data.requestId,
	                        response: res
	                    }));
	                }).catch(err => {
	                    console.log('postato cheers error', err);
	                    postMessage(JSON.stringify({
	                        action: 'response failure',
	                        requestId: data.requestId,
	                        response: err
	                    }));
	                });
	                break;
	            case 'PUT':
	                rexy.adapter.put(data.id, data.payload, data.opts).then(res => {
	                    postMessage(JSON.stringify({
	                        action: 'response success',
	                        requestId: data.requestId,
	                        response: res
	                    }));
	                }).catch(err => {
	                    postMessage(JSON.stringify({
	                        action: 'response failure',
	                        requestId: data.requestId,
	                        response: err
	                    }));
	                });
	                break;
	            case 'DELETE':
	                rexy.adapter.delete(data.id, data.opts).then(res => {
	                    postMessage(JSON.stringify({
	                        action: 'response success',
	                        requestId: data.requestId,
	                        response: res
	                    }));
	                }).catch(err => {
	                    postMessage(JSON.stringify({
	                        action: 'response failure',
	                        requestId: data.requestId,
	                        response: err
	                    }));
	                });
	                break;
	        }
	    }, false);
	}
	exports.worker = worker;

/***/ }
/******/ ]);
//# sourceMappingURL=example.js.map