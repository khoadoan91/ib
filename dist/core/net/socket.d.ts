/// <reference types="node" />
import { EventEmitter } from "eventemitter3";
interface SocketConnectionOpts {
    host?: string;
    port: number;
}
declare class CustomSocket extends EventEmitter {
    private _url;
    private _socket;
    private _encoding;
    constructor();
    connect(options: SocketConnectionOpts, connectionListener?: () => void): this;
    write(data: Uint8Array | string, encoding?: BufferEncoding, cb?: (err?: Error) => void): void;
    setEncoding(encoding: string): void;
    get connecting(): boolean;
    destroy(exception?: unknown): this;
    end(): this;
    get remotePort(): number | undefined;
    get destroyed(): boolean;
    address(): void;
    get remoteAddress(): string | undefined;
    private configureConnection;
    private configureWebSocket;
}
export { CustomSocket, SocketConnectionOpts };
