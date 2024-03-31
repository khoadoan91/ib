import toBuffer from "blob-to-buffer";
import { EventEmitter } from "eventemitter3";

interface SocketConnectionOpts {
  host?: string;
  port: number;
}

class CustomSocket extends EventEmitter {
  private _url: URL;
  private _socket: WebSocket;
  private _encoding: string;
  constructor() {
    super();
  }

  connect(options: SocketConnectionOpts, connectionListener?: () => void): this {
    return this.configureConnection(options, connectionListener);
  }

  write(data: Uint8Array | string, encoding?: BufferEncoding, cb?: (err?: Error) => void) {
    if (typeof data === "string")
      this._socket.send(data);
    else {
      this._socket.send(new Blob([data]));
    }

    if (cb) cb();
  }

  setEncoding(encoding: string) {
    if (encoding === "utf8")
      this._encoding = encoding;
    else
      this._encoding = "binary";
  }

  get connecting(): boolean {
    return this._socket ? this._socket.readyState === this._socket.CONNECTING : false;
  }

  destroy(exception: unknown = null): this {
    if (this._socket) {
      this._socket.close(1000, "destroy called");
    }
    this.emit("error", exception);
    return this;
  }

  end(): this {
    if (this._socket) {
      this._socket.close(1000, "destroy called");
    }
    return this;
  }

  get remotePort(): number | undefined {
    return Number.parseInt(this._url.port);
  }

  get destroyed(): boolean {
    if (this._socket) {
      return this._socket.readyState === this._socket.CLOSED;
    }
    return false;
  }

  address(): void {
    // Not implemented
  }

  get remoteAddress(): string | undefined {
    return this._url.href;
  }

  private configureConnection(options: SocketConnectionOpts, connectionListener?: () => void): this {
    const host = options.host ?? "localhost";
    this._url = new URL(`ws://${host}`);
    this._url.port = options.port.toString();
    if (connectionListener) {
      this.on("connect", connectionListener);
    }
    this.configureWebSocket();
    return this;
  }

  private configureWebSocket() {
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
          toBuffer(event.data, (err: Error | null, buf: Buffer) => {
            if (err) {
              throw err;
            }
            this.emit("data", buf);
          });
        } else {
          console.debug("type of event.data", typeof event.data);
          this.emit("data", Buffer.from(event.data));
        }
      } else if (this._encoding === "utf8") {
        if (event.data instanceof Blob) {
          const reader = new FileReader();
          reader.onload = () => {
            if (reader.result instanceof ArrayBuffer) {
              const decodedString = new TextDecoder("utf-8").decode(
                new Uint8Array(reader.result)
              );
              this.emit("data", decodedString);
            }
          };
          reader.readAsArrayBuffer(event.data);
        } else {
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

export { CustomSocket, SocketConnectionOpts };
