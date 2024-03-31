"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Controller = void 0;
const command_buffer_1 = __importDefault(require("command-buffer"));
const function_rate_limit_1 = __importDefault(require("function-rate-limit"));
const event_name_1 = require("../../api/data/enum/event-name");
const errorCode_1 = require("../../common/errorCode");
const decoder_1 = require("./decoder");
const encoder_1 = require("./encoder");
const socket_1 = require("./socket");
/**
 * @internal
 *
 * This class implements the dispatcher between public API and the
 * underlying I/O code.
 */
class Controller {
    /**
     *
     * @param ib The [[IBApi]] object.
     * @param _options The [[IBApi]] creation options.
     */
    constructor(ib, options) {
        this.ib = ib;
        this.options = options;
        /** The command buffer. */
        this.commands = new command_buffer_1.default(Controller.execute, this);
        /** The API message encoder. */
        this.encoder = new encoder_1.Encoder(this);
        /** The API message decoder. */
        this.decoder = new decoder_1.Decoder(this);
        this.socket = new socket_1.Socket(this, this.options);
        this.commands.pause();
        const rate = options?.maxReqPerSec ?? 40;
        this.rateLimiter = (0, function_rate_limit_1.default)(rate / 10, 1000 / 10, (tokens) => {
            this.socket.send(tokens);
        });
    }
    /**
     * Pause command processing.
     */
    pause() {
        this.commands.pause();
    }
    /**
     * Resume command processing.
     */
    resume() {
        this.commands.resume();
    }
    /**
     * Connect to the API server.
     */
    connect(clientId) {
        this.executeConnect(clientId);
    }
    /**
     * Disconnect from the API server.
     */
    disconnect() {
        this.executeDisconnect();
    }
    /**
     * Schedule an API command for sending.
     *
     * @param funcName API function name.
     * @param data Array of tokens to send.
     */
    schedule(func) {
        this.commands.schedule(() => func());
    }
    /**
     * Send an array of tokens to the sever immediately.
     *
     * @param data Array of tokens to send.
     */
    send(...args) {
        this.commands.run(() => this.executeSend(args));
    }
    /**
     * Progress the ingress data queue.
     */
    processIngressQueue() {
        this.decoder.process();
    }
    /**
     * Called when a message has been arrived on the API server connection.
     *
     * Used on V100 protocol.
     */
    onMessage(tokens) {
        this.decoder.enqueueMessage(tokens);
    }
    /**
     * Called when a message has been arrived on the API server connection.
     *
     * Used on pre-V100 protocol.
     */
    onTokens(tokens) {
        this.decoder.enqueueTokens(tokens);
    }
    /**
     * Get the API server version.
     *
     * This function is called from the [[Decoder]] and [[Encoder]]
     * (via [DecoderCallbacks.serverVersion] and [DecoderCallbacks.serverVersion]).
     */
    get serverVersion() {
        return this.socket.serverVersion;
    }
    /**
     * Returns `true` if currently connected to server, `false` otherwise.
     */
    get connected() {
        return this.socket.connected;
    }
    /**
     * Disable usage of V100Plus protocol.
     */
    disableUseV100Plus() {
        return this.socket.disableUseV100Plus();
    }
    /**
     * Send a message to the server connection.
     *
     * This function is called from the [[Encoder]] (via [EncoderCallbacks.sendMsg]).
     *
     * @param args Array of tokens to send.
     * Can contain nested arrays.
     */
    sendMsg(...tokens) {
        this.rateLimiter(tokens);
    }
    /**
     * Emit an event to public API interface.
     *
     * This function is called from the [[Decoder]] (via [DecoderCallbacks.emitEvent]).
     *
     * @param eventName Event name.
     * @param args Event arguments.
     */
    emitEvent(eventName, ...args) {
        // emit the event
        this.ib.emit(eventName, ...args);
        // emit 'result' and 'all' event
        if (eventName !== event_name_1.EventName.connected &&
            eventName !== event_name_1.EventName.disconnected &&
            eventName !== event_name_1.EventName.error &&
            eventName !== event_name_1.EventName.received &&
            eventName !== event_name_1.EventName.sent &&
            eventName !== event_name_1.EventName.server) {
            this.ib.emit(event_name_1.EventName.result, eventName, args);
        }
        this.ib.emit(event_name_1.EventName.all, eventName, args);
        /*
        Important: The IBApi.EWrapper.nextValidID callback is commonly used to indicate that the connection is completed
        and other messages can be sent from the API client to TWS.
        There is the possibility that function calls made prior to this time could be dropped by TWS.
        */
        if (eventName === event_name_1.EventName.nextValidId) {
            // console.log("nextValidId received");
            this.resume();
        }
    }
    /**
     * Emit an information message event to public API interface.
     *
     * This function is called from the [[Decoder]] (via [DecoderCallbacks.emitInfo]).
     *
     * @param message The message text.
     * @param code The message code.
     */
    emitInfo(message, code) {
        this.emitEvent(event_name_1.EventName.info, message, code);
    }
    /**
     * Emit an error event to public API interface.
     *
     * This function is called from the [[Decoder]] and [[Encoder]]
     * (via [DecoderCallbacks.emitError] and [DecoderCallbacks.emitError]).
     *
     * @param errMsg The error test message.
     * @param code The error code.
     * @param reqId RequestId associated to this error.
     * @param advancedOrderReject Additional error data (optional).
     */
    emitError(errMsg, code, reqId, advancedOrderReject) {
        // if (advancedOrderReject) errMsg += ", advancedOrderReject: " + JSON.stringify(advancedOrderReject);
        this.emitEvent(event_name_1.EventName.error, new Error(errMsg), code, reqId, advancedOrderReject);
    }
    /**
     * Execute a command.
     *
     * @param callback Callback function to invoke.
     * @param data Command data.
     */
    static execute(callback, data) {
        callback(data);
    }
    /**
     * Execute a connect command.
     *
     * @see [[connect]]
     */
    executeConnect(clientId) {
        if (!this.socket.connected) {
            this.socket.connect(clientId);
        }
        else {
            this.emitError("Cannot connect if already connected.", errorCode_1.ErrorCode.CONNECT_FAIL, -1);
        }
    }
    /**
     * Execute a disconnect command.
     *
     * @see [[disconnect]]
     */
    executeDisconnect() {
        if (this.socket.status >= socket_1.ConnectionStatus.Connecting) {
            this.socket.disconnect();
        }
        else {
            this.emitInfo("Cannot disconnect if already disconnected.", errorCode_1.ErrorCode.NOT_CONNECTED);
        }
    }
    /**
     * Send raw token data to the server connection.
     *
     * @param tokens Array of tokens to send.
     *
     * @see [[send]]
     */
    executeSend(tokens) {
        if (this.socket.connected) {
            this.socket.send(tokens);
        }
        else {
            this.emitError("Cannot send data when disconnected.", errorCode_1.ErrorCode.NOT_CONNECTED, -1);
        }
    }
}
exports.Controller = Controller;
//# sourceMappingURL=controller.js.map