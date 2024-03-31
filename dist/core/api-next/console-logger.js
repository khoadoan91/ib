"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleLogger = void 0;
const colors_1 = __importDefault(require("colors"));
const util = __importStar(require("util"));
const __1 = require("../..");
/**
 * @internal
 *
 * The logger implementation of [[IBApiNext]].
 */
class ConsoleLogger {
    constructor() {
        /** The current log level */
        this._logLevel = __1.LogLevel.SYSTEM;
    }
    /** Get the current log level. */
    get logLevel() {
        return this._logLevel;
    }
    /** Set the current log level. */
    set logLevel(level) {
        this._logLevel = level;
    }
    /** Log a debug information. */
    debug(tag, args) {
        if (this._logLevel >= __1.LogLevel.DETAIL) {
            console.debug(`[${new Date().toLocaleTimeString()}] [DEBUG] [${tag}]: `, args);
        }
    }
    /** Log a generic information. */
    info(tag, args) {
        if (this._logLevel >= __1.LogLevel.INFO) {
            console.log(`[${new Date().toLocaleTimeString()}] [INFO] [${tag}]: `, args);
        }
    }
    /** Log a warning. */
    warn(tag, args) {
        if (this._logLevel >= __1.LogLevel.WARN) {
            let newArgs = args;
            if (Array.isArray(args))
                newArgs = args.map(colors_1.default.yellow);
            console.warn(colors_1.default.bold.yellow(`[${new Date().toLocaleTimeString()}] [WARN] [${tag}]: `), newArgs);
        }
    }
    /** Log an error. */
    error(tag, args) {
        if (this._logLevel >= __1.LogLevel.ERROR) {
            let newArgs = args;
            if (Array.isArray(args))
                newArgs = args.map((x) => colors_1.default.bold.red(util.inspect(x, { showHidden: false, depth: null })));
            console.error(colors_1.default.bold.red(`[${new Date().toLocaleTimeString()}] [ERROR] [${tag}]:`), newArgs);
        }
    }
}
exports.ConsoleLogger = ConsoleLogger;
//# sourceMappingURL=console-logger.js.map