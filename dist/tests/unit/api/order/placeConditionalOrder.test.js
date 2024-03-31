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
const sample_price_condition = new __1.PriceCondition(29, __1.TriggerMethod.Default, contracts_1.aapl_contract.conId, contracts_1.aapl_contract.exchange, true, __1.ConjunctionConnection.OR);
const sample_execution_condition = new __1.ExecutionCondition(contracts_1.sample_stock.exchange, contracts_1.sample_stock.secType, contracts_1.sample_stock.symbol, __1.ConjunctionConnection.OR);
const sample_margin_condition = new __1.MarginCondition(10, false, __1.ConjunctionConnection.OR);
const sample_percent_condition = new __1.PercentChangeCondition(0.1, contracts_1.aapl_contract.conId, contracts_1.aapl_contract.exchange, true, __1.ConjunctionConnection.OR);
const sample_time_condition = new __1.TimeCondition("20250101-12:00:00", true, __1.ConjunctionConnection.OR);
const sample_volume_condition = new __1.VolumeCondition(100, contracts_1.aapl_contract.conId, contracts_1.aapl_contract.exchange, true, __1.ConjunctionConnection.OR);
describe("Place Conditional Orders", () => {
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
    test("placeOrder with PriceCondition", (done) => {
        let refId;
        const refContract = contracts_1.sample_stock;
        const refOrder = {
            orderType: __1.OrderType.LMT,
            action: __1.OrderAction.BUY,
            lmtPrice: 0.01,
            totalQuantity: 1,
            conditionsIgnoreRth: true,
            conditionsCancelOrder: false,
            conditions: [sample_price_condition],
            transmit: true,
        };
        let isDone = false;
        ib.once(__1.EventName.nextValidId, (orderId) => {
            refId = orderId;
            ib.placeOrder(refId, refContract, refOrder);
        })
            .on(__1.EventName.openOrder, (orderId, contract, order, _orderState) => {
            if (orderId === refId && !isDone) {
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
                else {
                    ib.disconnect();
                    done(msg);
                }
            }
        });
        ib.connect().reqOpenOrders();
    });
    test("placeOrder with ExecutionCondition", (done) => {
        let refId;
        const refContract = contracts_1.sample_stock;
        const refOrder = {
            orderType: __1.OrderType.LMT,
            action: __1.OrderAction.BUY,
            lmtPrice: 0.01,
            totalQuantity: 1,
            conditionsIgnoreRth: true,
            conditionsCancelOrder: false,
            conditions: [sample_execution_condition],
            transmit: true,
        };
        let isDone = false;
        ib.once(__1.EventName.nextValidId, (orderId) => {
            refId = orderId;
            ib.placeOrder(refId, refContract, refOrder);
        })
            .on(__1.EventName.openOrder, (orderId, contract, order, _orderState) => {
            if (orderId === refId && !isDone) {
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
                else {
                    ib.disconnect();
                    done(msg);
                }
            }
        });
        ib.connect().reqOpenOrders();
    });
    test("placeOrder with MarginCondition", (done) => {
        let refId;
        const refContract = contracts_1.sample_stock;
        const refOrder = {
            orderType: __1.OrderType.LMT,
            action: __1.OrderAction.BUY,
            lmtPrice: 0.01,
            totalQuantity: 1,
            conditionsIgnoreRth: true,
            conditionsCancelOrder: false,
            conditions: [sample_margin_condition],
            transmit: true,
        };
        let isDone = false;
        ib.once(__1.EventName.nextValidId, (orderId) => {
            refId = orderId;
            ib.placeOrder(refId, refContract, refOrder);
        })
            .on(__1.EventName.openOrder, (orderId, contract, order, _orderState) => {
            if (orderId === refId && !isDone) {
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
                else {
                    ib.disconnect();
                    done(msg);
                }
            }
        });
        ib.connect().reqOpenOrders();
    });
    test("placeOrder with PercentChangeCondition", (done) => {
        let refId;
        const refContract = contracts_1.sample_stock;
        const refOrder = {
            orderType: __1.OrderType.LMT,
            action: __1.OrderAction.BUY,
            lmtPrice: 0.01,
            totalQuantity: 1,
            conditionsIgnoreRth: true,
            conditionsCancelOrder: false,
            conditions: [sample_percent_condition],
            transmit: true,
        };
        let isDone = false;
        ib.once(__1.EventName.nextValidId, (orderId) => {
            refId = orderId;
            ib.placeOrder(refId, refContract, refOrder);
        })
            .on(__1.EventName.openOrder, (orderId, contract, order, _orderState) => {
            if (orderId === refId && !isDone) {
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
                else {
                    ib.disconnect();
                    done(msg);
                }
            }
        });
        ib.connect().reqOpenOrders();
    });
    test("placeOrder with TimeCondition", (done) => {
        let refId;
        const refContract = contracts_1.sample_stock;
        const refOrder = {
            orderType: __1.OrderType.LMT,
            action: __1.OrderAction.BUY,
            lmtPrice: 0.01,
            totalQuantity: 1,
            conditionsIgnoreRth: true,
            conditionsCancelOrder: false,
            conditions: [sample_time_condition],
            transmit: true,
        };
        let isDone = false;
        ib.once(__1.EventName.nextValidId, (orderId) => {
            refId = orderId;
            ib.placeOrder(refId, refContract, refOrder);
        })
            .on(__1.EventName.openOrder, (orderId, contract, order, _orderState) => {
            if (orderId === refId && !isDone) {
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
                else {
                    ib.disconnect();
                    done(msg);
                }
            }
        });
        ib.connect().reqOpenOrders();
    });
    test("placeOrder with VolumeCondition", (done) => {
        let refId;
        const refContract = contracts_1.sample_stock;
        const refOrder = {
            orderType: __1.OrderType.LMT,
            action: __1.OrderAction.BUY,
            lmtPrice: 0.01,
            totalQuantity: 1,
            conditionsIgnoreRth: true,
            conditionsCancelOrder: false,
            conditions: [sample_volume_condition],
            transmit: true,
        };
        let isDone = false;
        ib.once(__1.EventName.nextValidId, (orderId) => {
            refId = orderId;
            ib.placeOrder(refId, refContract, refOrder);
        })
            .on(__1.EventName.openOrder, (orderId, contract, order, _orderState) => {
            if (orderId === refId && !isDone) {
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
                else {
                    ib.disconnect();
                    done(msg);
                }
            }
        });
        ib.connect().reqOpenOrders();
    });
    test("placeOrder with all conditions", (done) => {
        let refId;
        const refContract = contracts_1.sample_stock;
        const refOrder = {
            orderType: __1.OrderType.LMT,
            action: __1.OrderAction.BUY,
            lmtPrice: 0.01,
            totalQuantity: 1,
            conditionsIgnoreRth: true,
            conditionsCancelOrder: false,
            conditions: [
                sample_price_condition,
                sample_execution_condition,
                sample_margin_condition,
                sample_percent_condition,
                sample_time_condition,
                sample_volume_condition,
            ],
            transmit: true,
        };
        let isDone = false;
        ib.once(__1.EventName.nextValidId, (orderId) => {
            refId = orderId;
            ib.placeOrder(refId, refContract, refOrder);
        })
            .on(__1.EventName.openOrder, (orderId, contract, order, _orderState) => {
            if (orderId === refId && !isDone) {
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
                else {
                    ib.disconnect();
                    done(msg);
                }
            }
        });
        ib.connect().reqOpenOrders();
    });
});
//# sourceMappingURL=placeConditionalOrder.test.js.map