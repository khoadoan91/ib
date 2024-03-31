"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This file implement test code for the placeOrder function .
 */
const __1 = require("../../../..");
const configuration_1 = __importDefault(require("../../../../common/configuration"));
const logger_1 = __importDefault(require("../../../../common/logger"));
const contracts_1 = require("../../sample-data/contracts");
describe("Place Orders", () => {
    jest.setTimeout(20 * 1000);
    let ib;
    let clientId = Math.floor(Math.random() * 32766) + 1; // ensure unique client
    beforeEach(() => {
        ib = new __1.IBApi({
            host: configuration_1.default.ib_host,
            port: configuration_1.default.ib_port,
            clientId: clientId++, // increment clientId for each test so they don't interfere on each other
        });
    });
    afterEach(() => {
        if (ib) {
            ib.disconnect();
            ib = undefined;
        }
    });
    test("Stock placeOrder", (done) => {
        let refId;
        const refContract = contracts_1.sample_stock;
        const refOrder = {
            orderType: __1.OrderType.LMT,
            action: __1.OrderAction.BUY,
            lmtPrice: 1,
            orderId: refId,
            totalQuantity: 2,
            tif: __1.TimeInForce.DAY,
            transmit: true,
        };
        let isDone = false;
        ib.once(__1.EventName.nextValidId, (orderId) => {
            refId = orderId;
            ib.placeOrder(refId, refContract, refOrder);
        })
            .on(__1.EventName.openOrder, (orderId, contract, order, _orderState) => {
            if (orderId == refId && !isDone) {
                isDone = true;
                expect(contract.symbol).toEqual(refContract.symbol);
                expect(order.totalQuantity).toEqual(refOrder.totalQuantity);
                done();
            }
        })
            .on(__1.EventName.error, (error, code, reqId, _advancedOrderReject) => {
            if (reqId === -1) {
                logger_1.default.info(error.message);
            }
            else {
                const msg = `[${reqId}] ${error.message} (Error #${code})`;
                if (error.message.includes("Warning:") ||
                    error.message.includes("Order Message:")) {
                    logger_1.default.warn(msg);
                }
                else if (code == __1.ErrorCode.NO_TRADING_PERMISSIONS) {
                    // Ignore this error for tests
                    logger_1.default.warn(msg);
                    done();
                }
                else {
                    ib.disconnect();
                    done(msg);
                }
            }
        });
        ib.connect().reqOpenOrders();
    });
    test("What if Order", (done) => {
        let refId;
        const refContract = contracts_1.sample_etf;
        const refOrder = {
            orderType: __1.OrderType.LMT,
            action: __1.OrderAction.BUY,
            lmtPrice: 1,
            orderId: refId,
            totalQuantity: 2,
            tif: __1.TimeInForce.DAY,
            transmit: true,
            whatIf: true,
        };
        let isDone = false;
        ib.once(__1.EventName.nextValidId, (orderId) => {
            refId = orderId;
            ib.placeOrder(refId, refContract, refOrder);
        })
            .on(__1.EventName.openOrder, (orderId, contract, order, orderState) => {
            if (orderId == refId && !isDone) {
                expect(contract.symbol).toEqual(refContract.symbol);
                expect(order.totalQuantity).toEqual(refOrder.totalQuantity);
                if (orderState.minCommission || orderState.maxCommission) {
                    expect(orderState.commissionCurrency).toEqual(refContract.currency);
                    isDone = true;
                    done();
                }
            }
        })
            .on(__1.EventName.error, (error, code, reqId, _advancedOrderReject) => {
            if (reqId === -1) {
                logger_1.default.info(error.message);
            }
            else {
                const msg = `[${reqId}] ${error.message} (Error #${code})`;
                if (error.message.includes("Warning:") ||
                    error.message.includes("Order Message:")) {
                    logger_1.default.warn(msg);
                }
                else if (code == __1.ErrorCode.NO_TRADING_PERMISSIONS) {
                    // Ignore this error for tests
                    logger_1.default.warn(msg);
                    done();
                }
                else {
                    ib.disconnect();
                    done(msg);
                }
            }
        });
        ib.connect().reqOpenOrders();
    });
    test("Crypto placeOrder", (done) => {
        let refId;
        const refContract = contracts_1.sample_crypto;
        const refOrder = {
            orderType: __1.OrderType.LMT,
            action: __1.OrderAction.BUY,
            lmtPrice: 1,
            orderId: refId,
            totalQuantity: 2,
            tif: __1.TimeInForce.DAY,
            transmit: true,
        };
        let isDone = false;
        ib.once(__1.EventName.nextValidId, (orderId) => {
            refId = orderId;
            ib.placeOrder(refId, refContract, refOrder);
        })
            .on(__1.EventName.openOrder, (orderId, contract, order, _orderState) => {
            if (orderId == refId && !isDone) {
                isDone = true;
                expect(contract.symbol).toEqual(refContract.symbol);
                expect(order.totalQuantity).toEqual(refOrder.totalQuantity);
                done();
            }
        })
            .on(__1.EventName.error, (error, code, reqId, _advancedOrderReject) => {
            if (reqId === -1) {
                logger_1.default.info(error.message);
            }
            else {
                const msg = `[${reqId}] ${error.message} (Error #${code})`;
                if (error.message.includes("Warning:") ||
                    error.message.includes("Order Message:")) {
                    logger_1.default.warn(msg);
                }
                else if (code == __1.ErrorCode.NO_TRADING_PERMISSIONS) {
                    // Ignore this error for tests
                    logger_1.default.warn(msg);
                    done();
                }
                else {
                    ib.disconnect();
                    done(msg);
                }
            }
        });
        ib.connect().reqOpenOrders();
    });
    test("Option placeOrder", (done) => {
        let refId;
        const refContract = contracts_1.sample_option;
        const refOrder = {
            orderType: __1.OrderType.LMT,
            action: __1.OrderAction.BUY,
            lmtPrice: 1,
            orderId: refId,
            totalQuantity: 2,
            tif: __1.TimeInForce.DAY,
            transmit: true,
        };
        let isDone = false;
        ib.once(__1.EventName.nextValidId, (orderId) => {
            refId = orderId;
            ib.placeOrder(refId, refContract, refOrder);
        })
            .on(__1.EventName.openOrder, (orderId, contract, order, _orderState) => {
            if (orderId == refId && !isDone) {
                isDone = true;
                expect(contract.symbol).toEqual(refContract.symbol);
                expect(order.totalQuantity).toEqual(refOrder.totalQuantity);
                done();
            }
        })
            .on(__1.EventName.error, (error, code, reqId, _advancedOrderReject) => {
            if (reqId === -1) {
                logger_1.default.info(error.message);
            }
            else {
                const msg = `[${reqId}] ${error.message} (Error #${code})`;
                if (error.message.includes("Warning:") ||
                    error.message.includes("Order Message:")) {
                    logger_1.default.warn(msg);
                }
                else if (code == __1.ErrorCode.NO_TRADING_PERMISSIONS) {
                    // Ignore this error for tests
                    logger_1.default.warn(msg);
                    done();
                }
                else {
                    ib.disconnect();
                    done(msg);
                }
            }
        });
        ib.connect().reqOpenOrders();
    });
});
//# sourceMappingURL=placeOrder.test.js.map