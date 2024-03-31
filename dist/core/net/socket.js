"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomSocket = void 0;
const blob_to_buffer_1 = __importDefault(require("blob-to-buffer"));
const eventemitter3_1 = require("eventemitter3");
class CustomSocket extends eventemitter3_1.EventEmitter {
    constructor() {
        super();
    }
    connect(options, connectionListener) {
        return this.configureConnection(options, connectionListener);
    }
    write(data, encoding, cb) {
        if (typeof data === "string")
            this._socket.send(data);
        else {
            this._socket.send(new Blob([data]));
        }
        if (cb)
            cb();
    }
    setEncoding(encoding) {
        if (encoding === "utf8")
            this._encoding = encoding;
        else
            this._encoding = "binary";
    }
    get connecting() {
        return this._socket ? this._socket.readyState === this._socket.CONNECTING : false;
    }
    destroy(exception = null) {
        if (this._socket) {
            this._socket.close(1000, "destroy called");
        }
        this.emit("error", exception);
        return this;
    }
    end() {
        if (this._socket) {
            this._socket.close(1000, "destroy called");
        }
        return this;
    }
    get remotePort() {
        return Number.parseInt(this._url.port);
    }
    get destroyed() {
        if (this._socket) {
            return this._socket.readyState === this._socket.CLOSED;
        }
        return false;
    }
    address() {
        // Not implemented
    }
    get remoteAddress() {
        return this._url.href;
    }
    configureConnection(options, connectionListener) {
        const host = options.host ?? "localhost";
        this._url = new URL(`ws://${host}`);
        this._url.port = options.port.toString();
        if (connectionListener) {
            this.on("connect", connectionListener);
        }
        this.configureWebSocket();
        return this;
    }
    configureWebSocket() {
        this._socket = new WebSocket(this._url.href);
        this._socket.onclose = (event) => {
            const hadError = event.code === 1006;
            this.emit("close", { hadError });
        };
        this._socket.onerror = (event) => {
            if (event instanceof ErrorEvent) {
                this.emit("error", event.message);
            }
        };
        this._socket.onmessage = (event) => {
            if (this._encoding === "binary") {
                if (event.data instanceof Blob) {
                    (0, blob_to_buffer_1.default)(event.data, (err, buf) => {
                        if (err) {
                            throw err;
                        }
                        this.emit("data", buf);
                    });
                }
                else {
                    console.debug("type of event.data", typeof event.data);
                    this.emit("data", Buffer.from(event.data));
                }
            }
            else if (this._encoding === "utf8") {
                if (event.data instanceof Blob) {
                    const reader = new FileReader();
                    reader.onload = () => {
                        if (reader.result instanceof ArrayBuffer) {
                            const decodedString = new TextDecoder("utf-8").decode(new Uint8Array(reader.result));
                            this.emit("data", decodedString);
                        }
                    };
                    reader.readAsArrayBuffer(event.data);
                }
                else {
                    console.debug("type of event.data", typeof event.data);
                    this.emit("data", event.data);
                }
            }
        };
        this._socket.onopen = (_event) => {
            this.emit("connect");
            this.emit("ready");
        };
    }
}
exports.CustomSocket = CustomSocket;
//# sourceMappingURL=socket.js.map