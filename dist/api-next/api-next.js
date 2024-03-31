"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IBApiNext = void 0;
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const __1 = require("../");
const mutable_account_summary_1 = require("../core/api-next/api/account/mutable-account-summary");
const mutable_market_data_1 = require("../core/api-next/api/market/mutable-market-data");
const mutable_account_positions_update_1 = require("../core/api-next/api/position/mutable-account-positions-update");
const auto_connection_1 = require("../core/api-next/auto-connection");
const console_logger_1 = require("../core/api-next/console-logger");
const logger_1 = require("../core/api-next/logger");
const subscription_registry_1 = require("../core/api-next/subscription-registry");
const _1 = require("./");
/**
 * @internal
 *
 * An invalid request id.
 */
const INVALID_REQ_ID = -1;
/**
 * @internal
 *
 * Log tag used on messages created by IBApiNext.
 */
const LOG_TAG = "IBApiNext";
/**
 * @internal
 *
 * Log tag used on messages that have been received from TWS / IB Gateway.
 */
const TWS_LOG_TAG = "TWS";
/**
 * Next-gen Typescript implementation of the Interactive Brokers TWS (or IB Gateway) API.
 *
 * If you prefer to stay as close as possible to the official TWS API interfaces and functionality,
 * use [[IBApi]].
 *
 * If you prefer to use an API that provides some more convenience functions, such as auto-reconnect
 * or RxJS Observables that stay functional during re-connect, use [[IBApiNext]].
 *
 * [[IBApiNext]] does return RxJS Observables on most of the functions.
 * The first subscriber will send the request to TWS, while the last un-subscriber will cancel it.
 * Any subscriber in between will get a replay of the latest received value(s).
 * This is also the case if you call same function with same arguments multiple times ([[IBApiNext]]
 * will make sure that a similar subscription is not requested multiple times from TWS, but it will
 * become a new observers to the existing subscription).
 * In case of an error, a re-subscribe will send the TWS request again (it is fully compatible to RxJS
 * operators, e.g. retry or retryWhen).
 *
 * Note that connection errors are not reported to the returned Observables as returned by get-functions,
 * but they will simply stop emitting values until TWS connection is re-established.
 * Use [[IBApiNext.connectState]] for observing the connection state.
 */
class IBApiNext {
    /**
     * Create an [[IBApiNext]] object.
     *
     * @param options Creation options.
     */
    constructor(options) {
        this._nextReqId = 1;
        /**
         * The IBApi error [[Subject]].
         *
         * All errors from [[IBApi]] error events will be sent to this subject.
         */
        this.errorSubject = new rxjs_1.Subject();
        /** currentTime event handler.  */
        this.onCurrentTime = (subscriptions, time) => {
            subscriptions.forEach((sub) => {
                sub.next({ all: time });
                sub.complete();
            });
        };
        /** managedAccounts event handler.  */
        this.onManagedAccts = (subscriptions, accountsList) => {
            const accounts = accountsList.split(",");
            subscriptions.forEach((sub) => {
                sub.next({ all: accounts });
                sub.complete();
            });
        };
        /** accountSummary event handler */
        this.onAccountSummary = (subscriptions, reqId, account, tag, value, currency) => {
            // get the subscription
            const subscription = subscriptions.get(reqId);
            if (!subscription) {
                return;
            }
            // update latest value on cache
            const cached = subscription.lastAllValue ?? new mutable_account_summary_1.MutableAccountSummaries();
            const lastValue = cached
                .getOrAdd(account, () => new mutable_account_summary_1.MutableAccountSummaryTagValues())
                .getOrAdd(tag, () => new mutable_account_summary_1.MutableAccountSummaryValues());
            const hasChanged = lastValue.has(currency);
            const updatedValue = {
                value: value,
                ingressTm: Date.now(),
            };
            lastValue.set(currency, updatedValue);
            // sent change to subscribers
            const accountSummaryUpdate = new mutable_account_summary_1.MutableAccountSummaries([
                [
                    account,
                    new mutable_account_summary_1.MutableAccountSummaryTagValues([
                        [tag, new mutable_account_summary_1.MutableAccountSummaryValues([[currency, updatedValue]])],
                    ]),
                ],
            ]);
            if (!subscription.endEventReceived) {
                subscription.lastAllValue = cached;
            }
            else if (hasChanged) {
                subscription.next({
                    all: cached,
                    changed: accountSummaryUpdate,
                });
            }
            else {
                subscription.next({
                    all: cached,
                    added: accountSummaryUpdate,
                });
            }
        };
        /** accountSummaryEnd event handler */
        this.onAccountSummaryEnd = (subscriptions, reqId) => {
            // get the subscription
            const subscription = subscriptions.get(reqId);
            if (!subscription) {
                return;
            }
            // get latest value on cache
            const cached = subscription.lastAllValue ?? new mutable_account_summary_1.MutableAccountSummaries();
            // sent data to subscribers
            subscription.endEventReceived = true;
            subscription.next({ all: cached });
        };
        /**
         * Response to API updateAccountValue control message.
         *
         * @param subscriptions listeners
         * @param account The IBKR account Id.
         * @param tag the tag of the value.
         * @param value numetical value associated to the tag.
         * @param currency the currency of the value.
         *
         * @see [[reqAccountUpdates]]
         */
        this.onUpdateAccountValue = (subscriptions, tag, value, currency, account) => {
            this.logger.debug(LOG_TAG, `onUpdateAccountValue(${tag}, ${value}, ${currency}, ${account})`);
            subscriptions.forEach((subscription) => {
                // update latest value on cache
                const all = subscription.lastAllValue ?? {};
                const cached = all?.value ?? new mutable_account_summary_1.MutableAccountSummaries();
                const lastValue = cached
                    .getOrAdd(account, () => new mutable_account_summary_1.MutableAccountSummaryTagValues())
                    .getOrAdd(tag, () => new mutable_account_summary_1.MutableAccountSummaryValues());
                const hasChanged = lastValue.has(currency);
                const updatedValue = {
                    value: value,
                    ingressTm: Date.now(),
                };
                lastValue.set(currency, updatedValue);
                // sent change to subscribers
                const accountSummaryUpdate = new mutable_account_summary_1.MutableAccountSummaries([
                    [
                        account,
                        new mutable_account_summary_1.MutableAccountSummaryTagValues([
                            [tag, new mutable_account_summary_1.MutableAccountSummaryValues([[currency, updatedValue]])],
                        ]),
                    ],
                ]);
                all.value = cached;
                if (hasChanged) {
                    subscription.next({
                        all: all,
                        changed: { value: accountSummaryUpdate },
                    });
                }
                else {
                    subscription.next({
                        all: all,
                        changed: { value: accountSummaryUpdate },
                    });
                }
            });
        };
        /**
         * Response to API updatePortfolio control message.
         *
         * @param subscriptions listeners
         * @param contract The position's [[Contract]]
         * @param pos The number of units held.
         * @param marketPrice the market price of the contract.
         * @param marketValue the market value of the position.
         * @param avgCost The average cost of the position.
         * @param unrealizedPNL The unrealized PNL of the position.
         * @param realizedPNL The realized PNL of the position.
         * @param account The IBKR account Id.
         *
         * @see [[reqAccountUpdates]]
         */
        this.onUpdatePortfolio = (subscriptions, contract, pos, marketPrice, marketValue, avgCost, unrealizedPNL, realizedPNL, account) => {
            this.logger.debug(LOG_TAG, `onUpdatePortfolio(${contract.symbol}, ${pos}, ${marketPrice}, ${marketValue}, ${avgCost}, ${unrealizedPNL}, ${realizedPNL}, ${account})`);
            const updatedPosition = {
                account,
                contract,
                pos,
                avgCost,
                marketPrice,
                marketValue,
                unrealizedPNL,
                realizedPNL,
            };
            // notify all subscribers
            subscriptions.forEach((subscription) => {
                // update latest value on cache
                let hasAdded = false;
                let hasRemoved = false;
                const all = subscription.lastAllValue ?? {};
                const cached = all?.portfolio ?? new mutable_account_positions_update_1.MutableAccountPositions();
                const accountPositions = cached.getOrAdd(account, () => []);
                const changePositionIndex = accountPositions.findIndex((p) => p.contract.conId == contract.conId);
                if (changePositionIndex === -1) {
                    // new position - add it
                    accountPositions.push(updatedPosition);
                    hasAdded = true;
                }
                else {
                    if (!pos) {
                        // zero size - remove it
                        accountPositions.splice(changePositionIndex);
                        hasRemoved = true;
                    }
                    else {
                        // update
                        accountPositions[changePositionIndex] = updatedPosition;
                    }
                }
                all.portfolio = cached;
                if (hasAdded) {
                    subscription.next({
                        all: all,
                        added: {
                            portfolio: new mutable_account_positions_update_1.MutableAccountPositions([
                                [account, [updatedPosition]],
                            ]),
                        },
                    });
                }
                else if (hasRemoved) {
                    subscription.next({
                        all: all,
                        removed: {
                            portfolio: new mutable_account_positions_update_1.MutableAccountPositions([
                                [account, [updatedPosition]],
                            ]),
                        },
                    });
                }
                else {
                    subscription.next({
                        all: all,
                        changed: {
                            portfolio: new mutable_account_positions_update_1.MutableAccountPositions([
                                [account, [updatedPosition]],
                            ]),
                        },
                    });
                }
            });
        };
        /**
         * Response to API updateAccountTime control message.
         *
         * @param subscriptions listeners
         * @param timeStamp the current timestamp
         *
         * @see [[reqAccountUpdates]]
         */
        this.onUpdateAccountTime = (subscriptions, timeStamp) => {
            this.logger.debug(LOG_TAG, `onUpdateAccountTime(${timeStamp})`);
            subscriptions.forEach((sub) => {
                const changed = { timestamp: timeStamp };
                const all = sub.lastAllValue ?? {};
                all.timestamp = changed.timestamp;
                sub.next({
                    all: all,
                    changed: changed,
                });
            });
        };
        /**
         * Response to API accountDownloadEnd control message.
         *
         * @param subscriptions listeners
         * @param accountName the account name
         *
         * @see [[reqAccountUpdates]]
         */
        this.onAccountDownloadEnd = (subscriptions, accountName) => {
            this.logger.debug(LOG_TAG, `onAccountDownloadEnd(${accountName})`);
            // notify all subscribers
            subscriptions.forEach((subscription) => {
                const all = subscription.lastAllValue ?? {};
                subscription.endEventReceived = true;
                subscription.next({ all });
            });
        };
        /** position event handler */
        this.onPosition = (subscriptions, account, contract, pos, avgCost) => {
            const updatedPosition = { account, contract, pos, avgCost };
            // notify all subscribers
            subscriptions.forEach((subscription) => {
                // update latest value on cache
                let hasAdded = false;
                let hasRemoved = false;
                const cached = subscription.lastAllValue ?? new mutable_account_positions_update_1.MutableAccountPositions();
                const accountPositions = cached.getOrAdd(account, () => []);
                const changePositionIndex = accountPositions.findIndex((p) => p.contract.conId == contract.conId);
                if (changePositionIndex === -1) {
                    // new position - add it
                    accountPositions.push(updatedPosition);
                    hasAdded = true;
                }
                else {
                    if (!pos) {
                        // zero size - remove it
                        accountPositions.splice(changePositionIndex);
                        hasRemoved = true;
                    }
                    else {
                        // update
                        accountPositions[changePositionIndex] = updatedPosition;
                    }
                }
                if (!subscription.endEventReceived) {
                    subscription.lastAllValue = cached;
                }
                else if (hasAdded) {
                    subscription.next({
                        all: cached,
                        added: new mutable_account_positions_update_1.MutableAccountPositions([[account, [updatedPosition]]]),
                    });
                }
                else if (hasRemoved) {
                    subscription.next({
                        all: cached,
                        removed: new mutable_account_positions_update_1.MutableAccountPositions([[account, [updatedPosition]]]),
                    });
                }
                else {
                    subscription.next({
                        all: cached,
                        changed: new mutable_account_positions_update_1.MutableAccountPositions([[account, [updatedPosition]]]),
                    });
                }
            });
        };
        /** position end enumeration event handler */
        this.onPositionEnd = (subscriptions) => {
            // notify all subscribers
            subscriptions.forEach((subscription) => {
                const lastAllValue = subscription.lastAllValue ?? new mutable_account_positions_update_1.MutableAccountPositions();
                subscription.endEventReceived = true;
                subscription.next({ all: lastAllValue });
            });
        };
        /** contractDetails event handler */
        this.onContractDetails = (subscriptions, reqId, details) => {
            // get the subscription
            const subscription = subscriptions.get(reqId);
            if (!subscription) {
                return;
            }
            // append to list
            const cached = subscription.lastAllValue ?? [];
            cached.push(details);
            // sent change to subscribers
            subscription.next({
                all: cached,
            });
        };
        /** contractDetailsEnd event handler */
        this.onContractDetailsEnd = (subscriptions, reqId) => {
            subscriptions.get(reqId)?.complete();
        };
        /** securityDefinitionOptionParameter event handler */
        this.onSecurityDefinitionOptionParameter = (subscriptions, reqId, exchange, underlyingConId, tradingClass, multiplier, expirations, strikes) => {
            // get the subscription
            const subscription = subscriptions.get(reqId);
            if (!subscription) {
                return;
            }
            // append to list
            const cached = subscription.lastAllValue ?? [];
            cached.push({
                exchange: exchange,
                underlyingConId: underlyingConId,
                tradingClass: tradingClass,
                multiplier: parseInt(multiplier),
                expirations: expirations,
                strikes: strikes,
            });
            // sent change to subscribers
            subscription.next({
                all: cached,
            });
        };
        /** securityDefinitionOptionParameterEnd event handler */
        this.onSecurityDefinitionOptionParameterEnd = (subscriptions, reqId) => {
            subscriptions.get(reqId)?.complete();
        };
        /** pnl event handler. */
        this.onPnL = (subscriptions, reqId, dailyPnL, unrealizedPnL, realizedPnL) => {
            // get subscription
            const subscription = subscriptions.get(reqId);
            if (!subscription) {
                return;
            }
            // sent change to subscribers
            subscription.next({
                all: { dailyPnL, unrealizedPnL, realizedPnL },
            });
        };
        /** pnlSingle event handler. */
        this.onPnLSingle = (subscriptions, reqId, pos, dailyPnL, unrealizedPnL, realizedPnL, value) => {
            // get subscription
            const subscription = subscriptions.get(reqId);
            if (!subscription) {
                return;
            }
            // sent change to subscribers
            subscription.next({
                all: {
                    position: pos,
                    dailyPnL: dailyPnL,
                    unrealizedPnL: unrealizedPnL,
                    realizedPnL: realizedPnL,
                    marketValue: value,
                },
            });
        };
        /** tickPrice, tickSize and tickGeneric event handler */
        this.onTick = (subscriptions, reqId, tickType, value) => {
            // convert -1 on Bid/Ask to undefined
            if (value === -1 &&
                (tickType === _1.IBApiTickType.BID ||
                    tickType === _1.IBApiTickType.DELAYED_BID ||
                    tickType === _1.IBApiTickType.ASK ||
                    tickType === _1.IBApiTickType.DELAYED_ASK)) {
                value = undefined;
            }
            // get subscription
            const subscription = subscriptions.get(reqId);
            if (!subscription) {
                return;
            }
            // update latest value on cache
            const cached = subscription.lastAllValue ?? new mutable_market_data_1.MutableMarketData();
            const hasChanged = cached.has(tickType);
            const updatedValue = {
                value,
                ingressTm: Date.now(),
            };
            cached.set(tickType, updatedValue);
            // deliver to subject
            if (hasChanged) {
                subscription.next({
                    all: cached,
                    changed: new mutable_market_data_1.MutableMarketData([[tickType, updatedValue]]),
                });
            }
            else {
                subscription.next({
                    all: cached,
                    added: new mutable_market_data_1.MutableMarketData([[tickType, updatedValue]]),
                });
            }
        };
        /** tickOptionComputationHandler event handler */
        this.onTickOptionComputation = (subscriptions, reqId, field, impliedVolatility, delta, optPrice, pvDividend, gamma, vega, theta, undPrice) => {
            // get subscription
            const subscription = subscriptions.get(reqId);
            if (!subscription) {
                return;
            }
            // generate [[IBApiNext]] market data ticks
            const now = Date.now();
            const ticks = [
                [
                    _1.IBApiNextTickType.OPTION_UNDERLYING,
                    { value: undPrice, ingressTm: now },
                ],
                [
                    _1.IBApiNextTickType.OPTION_PV_DIVIDEND,
                    { value: pvDividend, ingressTm: now },
                ],
            ];
            switch (field) {
                case _1.IBApiTickType.BID_OPTION:
                    ticks.push([
                        _1.IBApiNextTickType.BID_OPTION_IV,
                        { value: impliedVolatility, ingressTm: now },
                    ], [
                        _1.IBApiNextTickType.BID_OPTION_DELTA,
                        { value: delta, ingressTm: now },
                    ], [
                        _1.IBApiNextTickType.BID_OPTION_PRICE,
                        { value: optPrice, ingressTm: now },
                    ], [
                        _1.IBApiNextTickType.BID_OPTION_GAMMA,
                        { value: gamma, ingressTm: now },
                    ], [_1.IBApiNextTickType.BID_OPTION_VEGA, { value: vega, ingressTm: now }], [
                        _1.IBApiNextTickType.BID_OPTION_THETA,
                        { value: theta, ingressTm: now },
                    ]);
                    break;
                case _1.IBApiTickType.DELAYED_BID_OPTION:
                    ticks.push([
                        _1.IBApiNextTickType.DELAYED_BID_OPTION_IV,
                        { value: impliedVolatility, ingressTm: now },
                    ], [
                        _1.IBApiNextTickType.DELAYED_BID_OPTION_DELTA,
                        { value: delta, ingressTm: now },
                    ], [
                        _1.IBApiNextTickType.DELAYED_BID_OPTION_PRICE,
                        { value: optPrice, ingressTm: now },
                    ], [
                        _1.IBApiNextTickType.DELAYED_BID_OPTION_GAMMA,
                        { value: gamma, ingressTm: now },
                    ], [
                        _1.IBApiNextTickType.DELAYED_BID_OPTION_VEGA,
                        { value: vega, ingressTm: now },
                    ], [
                        _1.IBApiNextTickType.DELAYED_BID_OPTION_THETA,
                        { value: theta, ingressTm: now },
                    ]);
                    break;
                case _1.IBApiTickType.ASK_OPTION:
                    ticks.push([
                        _1.IBApiNextTickType.ASK_OPTION_IV,
                        { value: impliedVolatility, ingressTm: now },
                    ], [
                        _1.IBApiNextTickType.ASK_OPTION_DELTA,
                        { value: delta, ingressTm: now },
                    ], [
                        _1.IBApiNextTickType.ASK_OPTION_PRICE,
                        { value: optPrice, ingressTm: now },
                    ], [
                        _1.IBApiNextTickType.ASK_OPTION_GAMMA,
                        { value: gamma, ingressTm: now },
                    ], [_1.IBApiNextTickType.ASK_OPTION_VEGA, { value: vega, ingressTm: now }], [
                        _1.IBApiNextTickType.ASK_OPTION_THETA,
                        { value: theta, ingressTm: now },
                    ]);
                    break;
                case _1.IBApiTickType.DELAYED_ASK_OPTION:
                    ticks.push([
                        _1.IBApiNextTickType.DELAYED_ASK_OPTION_IV,
                        { value: impliedVolatility, ingressTm: now },
                    ], [
                        _1.IBApiNextTickType.DELAYED_ASK_OPTION_DELTA,
                        { value: delta, ingressTm: now },
                    ], [
                        _1.IBApiNextTickType.DELAYED_ASK_OPTION_PRICE,
                        { value: optPrice, ingressTm: now },
                    ], [
                        _1.IBApiNextTickType.DELAYED_ASK_OPTION_GAMMA,
                        { value: gamma, ingressTm: now },
                    ], [
                        _1.IBApiNextTickType.DELAYED_ASK_OPTION_VEGA,
                        { value: vega, ingressTm: now },
                    ], [
                        _1.IBApiNextTickType.DELAYED_ASK_OPTION_THETA,
                        { value: theta, ingressTm: now },
                    ]);
                    break;
                case _1.IBApiTickType.LAST_OPTION:
                    ticks.push([
                        _1.IBApiNextTickType.LAST_OPTION_IV,
                        { value: impliedVolatility, ingressTm: now },
                    ], [
                        _1.IBApiNextTickType.LAST_OPTION_DELTA,
                        { value: delta, ingressTm: now },
                    ], [
                        _1.IBApiNextTickType.LAST_OPTION_PRICE,
                        { value: optPrice, ingressTm: now },
                    ], [
                        _1.IBApiNextTickType.LAST_OPTION_GAMMA,
                        { value: gamma, ingressTm: now },
                    ], [_1.IBApiNextTickType.LAST_OPTION_VEGA, { value: vega, ingressTm: now }], [
                        _1.IBApiNextTickType.LAST_OPTION_THETA,
                        { value: theta, ingressTm: now },
                    ]);
                    break;
                case _1.IBApiTickType.DELAYED_LAST_OPTION:
                    ticks.push([
                        _1.IBApiNextTickType.DELAYED_LAST_OPTION_IV,
                        { value: impliedVolatility, ingressTm: now },
                    ], [
                        _1.IBApiNextTickType.DELAYED_LAST_OPTION_DELTA,
                        { value: delta, ingressTm: now },
                    ], [
                        _1.IBApiNextTickType.DELAYED_LAST_OPTION_PRICE,
                        { value: optPrice, ingressTm: now },
                    ], [
                        _1.IBApiNextTickType.DELAYED_LAST_OPTION_GAMMA,
                        { value: gamma, ingressTm: now },
                    ], [
                        _1.IBApiNextTickType.DELAYED_LAST_OPTION_VEGA,
                        { value: vega, ingressTm: now },
                    ], [
                        _1.IBApiNextTickType.DELAYED_LAST_OPTION_THETA,
                        { value: theta, ingressTm: now },
                    ]);
                    break;
                case _1.IBApiTickType.MODEL_OPTION:
                    ticks.push([
                        _1.IBApiNextTickType.MODEL_OPTION_IV,
                        { value: impliedVolatility, ingressTm: now },
                    ], [
                        _1.IBApiNextTickType.MODEL_OPTION_DELTA,
                        { value: delta, ingressTm: now },
                    ], [
                        _1.IBApiNextTickType.MODEL_OPTION_PRICE,
                        { value: optPrice, ingressTm: now },
                    ], [
                        _1.IBApiNextTickType.MODEL_OPTION_GAMMA,
                        { value: gamma, ingressTm: now },
                    ], [
                        _1.IBApiNextTickType.MODEL_OPTION_VEGA,
                        { value: vega, ingressTm: now },
                    ], [
                        _1.IBApiNextTickType.MODEL_OPTION_THETA,
                        { value: theta, ingressTm: now },
                    ]);
                    break;
                case _1.IBApiTickType.DELAYED_MODEL_OPTION:
                    ticks.push([
                        _1.IBApiNextTickType.DELAYED_MODEL_OPTION_IV,
                        { value: impliedVolatility, ingressTm: now },
                    ], [
                        _1.IBApiNextTickType.DELAYED_MODEL_OPTION_DELTA,
                        { value: delta, ingressTm: now },
                    ], [
                        _1.IBApiNextTickType.DELAYED_MODEL_OPTION_PRICE,
                        { value: optPrice, ingressTm: now },
                    ], [
                        _1.IBApiNextTickType.DELAYED_MODEL_OPTION_GAMMA,
                        { value: gamma, ingressTm: now },
                    ], [
                        _1.IBApiNextTickType.DELAYED_MODEL_OPTION_VEGA,
                        { value: vega, ingressTm: now },
                    ], [
                        _1.IBApiNextTickType.DELAYED_MODEL_OPTION_THETA,
                        { value: theta, ingressTm: now },
                    ]);
                    break;
            }
            // update latest value on cache
            const cached = subscription.lastAllValue ?? new mutable_market_data_1.MutableMarketData();
            const added = new mutable_market_data_1.MutableMarketData();
            const changed = new mutable_market_data_1.MutableMarketData();
            ticks.forEach((tick) => {
                if (cached.has(tick[0])) {
                    changed.set(tick[0], tick[1]);
                }
                else {
                    added.set(tick[0], tick[1]);
                }
                cached.set(tick[0], tick[1]);
            });
            // deliver to subject
            if (cached.size) {
                subscription.next({
                    all: cached,
                    added: added.size ? added : undefined,
                    changed: changed.size ? changed : undefined,
                });
            }
        };
        /** tickSnapshotEnd event handler */
        this.onTickSnapshotEnd = (subscriptions, reqId) => {
            subscriptions.get(reqId)?.complete();
        };
        /**
         * @deprecated please use getMarketDataSnapshot instead of getMarketDataSingle.
         */
        this.getMarketDataSingle = this.getMarketDataSnapshot;
        /** headTimestamp event handler.  */
        this.onHeadTimestamp = (subscriptions, reqId, headTimestamp) => {
            // get subscription
            const subscription = subscriptions.get(reqId);
            if (!subscription) {
                return;
            }
            // signal timestamp
            subscription.next({ all: headTimestamp });
            subscription.complete();
        };
        /** historicalData event handler */
        this.onHistoricalData = (subscriptions, reqId, time, open, high, low, close, volume, count, WAP) => {
            // get subscription
            const subscription = subscriptions.get(reqId);
            if (!subscription) {
                return;
            }
            // append bar or signal completion
            if (time.startsWith("finished")) {
                subscription.complete();
            }
            else {
                const all = subscription.lastAllValue ?? [];
                const current = { time };
                if (open !== -1) {
                    current.open = open;
                }
                if (high !== -1) {
                    current.high = high;
                }
                if (low !== -1) {
                    current.low = low;
                }
                if (close !== -1) {
                    current.close = close;
                }
                if (volume !== -1) {
                    current.volume = volume;
                }
                if (count !== -1) {
                    current.count = count;
                }
                if (WAP !== -1) {
                    current.WAP = WAP;
                }
                all.push(current);
                subscription.next({
                    all,
                });
            }
        };
        /** historicalDataUpdate event handler */
        this.onHistoricalDataUpdate = (subscriptions, reqId, time, open, high, low, close, volume, count, WAP) => {
            // get subscription
            const subscription = subscriptions.get(reqId);
            if (!subscription) {
                return;
            }
            // update bar
            const current = subscription.lastAllValue ?? {};
            current.time = time;
            current.open = open !== -1 ? open : undefined;
            current.high = high !== -1 ? high : undefined;
            current.low = low !== -1 ? low : undefined;
            current.close = close !== -1 ? close : undefined;
            current.volume = volume !== -1 ? volume : undefined;
            current.count = count !== -1 ? count : undefined;
            current.WAP = WAP !== -1 ? WAP : undefined;
            subscription.next({
                all: current,
            });
        };
        /** historicalTicks event handler */
        this.onHistoricalTicks = (subscriptions, reqId, ticks, done) => {
            // get subscription
            const subscription = subscriptions.get(reqId);
            if (!subscription) {
                return;
            }
            // append tick
            let allTicks = subscription.lastAllValue;
            allTicks = allTicks ? allTicks.concat(ticks) : ticks;
            subscription.next({
                all: allTicks,
            });
            if (done) {
                subscription.complete();
            }
        };
        /** historicalTicksBidAsk event handler */
        this.onHistoricalTicksBidAsk = (subscriptions, reqId, ticks, done) => {
            // get subscription
            const subscription = subscriptions.get(reqId);
            if (!subscription) {
                return;
            }
            // append tick
            let allTicks = subscription.lastAllValue;
            allTicks = allTicks ? allTicks.concat(ticks) : ticks;
            subscription.next({
                all: allTicks,
            });
            if (done) {
                subscription.complete();
            }
        };
        /** historicalTicksLast event handler */
        this.onHistoricalTicksLast = (subscriptions, reqId, ticks, done) => {
            // get subscription
            const subscription = subscriptions.get(reqId);
            if (!subscription) {
                return;
            }
            // append tick
            let allTicks = subscription.lastAllValue;
            allTicks = allTicks ? allTicks.concat(ticks) : ticks;
            subscription.next({
                all: allTicks,
            });
            if (done) {
                subscription.complete();
            }
        };
        /** mktDepthExchanges event handler */
        this.onMktDepthExchanges = (subscriptions, depthMktDataDescriptions) => {
            subscriptions.forEach((sub) => {
                sub.next({
                    all: depthMktDataDescriptions,
                });
                sub.complete();
            });
        };
        /** updateMktDepth event handler */
        this.onUpdateMktDepth = (subscriptions, reqId, position, operation, side, price, size) => {
            // forward to L2 handler, but w/o market maker and smart depth set to false
            this.onUpdateMktDepthL2(subscriptions, reqId, position, undefined, operation, side, price, size, false);
        };
        /** marketDepthL2 event handler */
        this.onUpdateMktDepthL2 = (subscriptions, reqId, position, marketMaker, operation, side, price, size, isSmartDepth) => {
            // get subscription
            const subscription = subscriptions.get(reqId);
            if (!subscription) {
                return;
            }
            // update cached
            const cached = subscription.lastAllValue ?? {
                bids: new Map(),
                asks: new Map(),
            };
            const changed = {
                bids: new Map(),
                asks: new Map(),
            };
            let cachedRows = undefined;
            let changedRows = undefined;
            if (side == 0) {
                // ask side
                cachedRows = cached.asks;
                changedRows = changed.asks;
            }
            else if (side == 1) {
                // bid side
                cachedRows = cached.bids;
                changedRows = changed.bids;
            }
            if (cachedRows === undefined || changedRows === undefined) {
                this.logger.error(LOG_TAG, `onUpdateMktDepthL2: unknown side value ${side} received from TWS`);
                return;
            }
            switch (operation) {
                case 0:
                    // it's an insert
                    this.insertAtMapIndex(position, position, {
                        marketMaker: marketMaker,
                        price: price,
                        size: size,
                        isSmartDepth: isSmartDepth,
                    }, cachedRows);
                    this.insertAtMapIndex(position, position, {
                        marketMaker: marketMaker,
                        price: price,
                        size: size,
                        isSmartDepth: isSmartDepth,
                    }, changedRows);
                    subscription.next({
                        all: cached,
                        added: changed,
                    });
                    break;
                case 1:
                    // it's an update
                    cachedRows.set(position, {
                        marketMaker: marketMaker,
                        price: price,
                        size: size,
                        isSmartDepth: isSmartDepth,
                    });
                    changedRows.set(position, {
                        marketMaker: marketMaker,
                        price: price,
                        size: size,
                        isSmartDepth: isSmartDepth,
                    });
                    subscription.next({
                        all: cached,
                        changed: changed,
                    });
                    break;
                case 2:
                    // it's a delete
                    const deletedRow = cachedRows.get(position);
                    cachedRows.delete(position);
                    changedRows.set(position, deletedRow);
                    subscription.next({
                        all: cached,
                        removed: changed,
                    });
                    break;
                default:
                    this.logger.error(LOG_TAG, `onUpdateMktDepthL2: unknown operation value ${operation} received from TWS`);
                    break;
            }
        };
        this.onScannerParameters = (subscriptions, xml) => {
            subscriptions.forEach((sub) => {
                sub.next({ all: xml });
                sub.complete();
            });
        };
        /**
         * Provides the data resulting from the market scanner request.
         * @param subscriptions
         * @param reqId the request's identifier
         * @param rank the ranking within the response of this bar.
         * @param contract the data's ContractDetails
         * @param distance according to query
         * @param benchmark according to query
         * @param projection according to query
         * @param legStr describes the combo legs when the scanner is returning EFP
         * @returns void
         */
        this.onScannerData = (subscriptions, reqId, rank, contract, distance, benchmark, projection, legStr) => {
            // get subscription
            const subscription = subscriptions.get(reqId);
            if (!subscription) {
                return;
            }
            const item = {
                rank,
                contract,
                distance,
                benchmark,
                projection,
                legStr,
            };
            const lastAllValue = subscription.lastAllValue ??
                new Map();
            const existing = lastAllValue.get(rank) != undefined;
            lastAllValue.set(rank, item);
            if (subscription.endEventReceived) {
                const updated = new Map();
                updated.set(rank, item);
                subscription.next({
                    all: lastAllValue,
                    changed: existing ? updated : undefined,
                    added: existing ? undefined : updated,
                });
            }
            else {
                subscription.lastAllValue = lastAllValue;
            }
        };
        /**
         * Indicates the scanner data reception has terminated.
         * @param subscriptions
         * @param reqId the request's identifier
         * @returns
         */
        this.onScannerDataEnd = (subscriptions, reqId) => {
            const subscription = subscriptions.get(reqId);
            if (!subscription) {
                return;
            }
            const lastAllValue = subscription.lastAllValue ??
                new Map();
            const updated = {
                all: lastAllValue,
            };
            subscription.endEventReceived = true;
            subscription.next(updated);
        };
        /** histogramData event handler */
        this.onHistogramData = (subscriptions, reqId, data) => {
            // get the subscription
            const sub = subscriptions.get(reqId);
            if (!sub) {
                return;
            }
            // deliver data
            sub.next({ all: data });
            sub.complete();
        };
        /**
         * Feeds in currently open orders.
         *
         * @param subscriptions listeners
         * @param orderId The order's unique id.
         * @param contract The order's [[Contract]]
         * @param order The currently active [[Order]]
         * @param orderState The order's [[OrderState]]
         *
         * @see [[placeOrder]], [[reqAllOpenOrders]], [[reqAutoOpenOrders]]
         */
        this.onOpenOrder = (subscriptions, orderId, contract, order, orderState) => {
            subscriptions.forEach((sub) => {
                const allOrders = sub.lastAllValue ?? [];
                const changeOrderIndex = allOrders.findIndex((p) => p.order.permId == order.permId);
                if (changeOrderIndex === -1) {
                    // new open order - add it
                    const addedOrder = {
                        orderId,
                        contract,
                        order,
                        orderState,
                        orderStatus: undefined,
                    };
                    allOrders.push(addedOrder);
                    if (sub.endEventReceived) {
                        sub.next({
                            all: allOrders,
                            added: [addedOrder],
                        });
                    }
                    else {
                        sub.lastAllValue = allOrders;
                    }
                }
                else {
                    // update
                    const updatedOrder = allOrders[changeOrderIndex];
                    updatedOrder.order = order;
                    updatedOrder.orderState = orderState;
                    if (updatedOrder.orderStatus !== undefined) {
                        // synchronize orderStatus if exists
                        updatedOrder.orderStatus.clientId = order.clientId;
                        updatedOrder.orderStatus.permId = order.permId;
                        updatedOrder.orderStatus.parentId = order.parentId;
                        updatedOrder.orderStatus.status = orderState.status;
                    }
                    sub.next({
                        all: allOrders,
                        changed: [updatedOrder],
                    });
                }
            });
        };
        /**
         *  Ends the subscription once all openOrders are recieved
         *  @param subscriptions listeners
         */
        this.onOpenOrderComplete = (subscriptions) => {
            subscriptions.forEach((sub) => {
                const allOrders = sub.lastAllValue ?? [];
                sub.endEventReceived = true;
                sub.next({ all: allOrders });
                sub.complete();
            });
        };
        /**
         * Response to API bind order control message.
         *
         * @param subscriptions listeners
         * @param orderId permId (mistake from IB documentation, value is orderId not permId)
         * @param apiClientId API client id.
         * @param apiOrderId API order id.
         *
         * @see [[reqOpenOrders]]
         */
        this.onOrderBound = (
        // TODO finish implementation
        subscriptions, orderId, apiClientId, apiOrderId) => {
            /*
             * This is probably unused now.
             * Neither reqAllOpenOrders, reqAutoOpenOrders nor reqOpenOrders documentation reference this event.
             * Even getAutoOpenOrders(true) doesn't call it!
             */
            this.logger.warn(LOG_TAG, `Unexpected onOrderBound(${orderId}, ${apiClientId}, ${apiOrderId}) called.`);
        };
        /**
         * Response to API status order control message.
         *
         * @param orderId the order's client id.
         * @param status the current status of the order. Possible values: PendingSubmit - indicates that you have transmitted the order, but have not yet received confirmation that it has been accepted by the order destination. PendingCancel - indicates that you have sent a request to cancel the order but have not yet received cancel confirmation from the order destination. At this point, your order is not confirmed canceled. It is not guaranteed that the cancellation will be successful. PreSubmitted - indicates that a simulated order type has been accepted by the IB system and that this order has yet to be elected. The order is held in the IB system until the election criteria are met. At that time the order is transmitted to the order destination as specified . Submitted - indicates that your order has been accepted by the system. ApiCancelled - after an order has been submitted and before it has been acknowledged, an API client client can request its cancelation, producing this state. Cancelled - indicates that the balance of your order has been confirmed canceled by the IB system. This could occur unexpectedly when IB or the destination has rejected your order. Filled - indicates that the order has been completely filled. Market orders executions will not always trigger a Filled status. Inactive - indicates that the order was received by the system but is no longer active because it was rejected or canceled.
         * @param filled number of filled positions.
         * @param remaining the remnant positions.
         * @param avgFillPrice average filling price.
         * @param permId the order's permId used by the TWS to identify orders.
         * @param parentId parent's id. Used for bracket and auto trailing stop orders.
         * @param lastFillPrice price at which the last positions were filled.
         * @param clientId API client which submitted the order.
         * @param whyHeld this field is used to identify an order held when TWS is trying to locate shares for a short sell. The value used to indicate this is 'locate'.
         * @param mktCapPrice If an order has been capped, this indicates the current capped price. Requires TWS 967+ and API v973.04+. Python API specifically requires API v973.06+.
         *
         * @see [[reqOpenOrders]]
         */
        this.onOrderStatus = (subscriptions, orderId, status, filled, remaining, avgFillPrice, permId, parentId, lastFillPrice, clientId, whyHeld, mktCapPrice) => {
            const orderStatus = {
                status,
                filled,
                remaining,
                avgFillPrice: undefined,
                permId,
                parentId,
                lastFillPrice: undefined,
                clientId,
                whyHeld,
                mktCapPrice,
            };
            if (filled) {
                orderStatus.avgFillPrice = avgFillPrice;
                orderStatus.lastFillPrice = lastFillPrice;
            }
            subscriptions.forEach((sub) => {
                const allOrders = sub.lastAllValue ?? [];
                const changeOrderIndex = allOrders.findIndex((p) => p.order.permId == permId);
                if (changeOrderIndex !== -1) {
                    const updatedOrder = allOrders[changeOrderIndex];
                    updatedOrder.orderStatus = orderStatus;
                    updatedOrder.orderState.status = status;
                    if (parentId !== undefined)
                        updatedOrder.order.parentId = parentId;
                    if (permId !== undefined)
                        updatedOrder.order.permId = permId;
                    if (clientId !== undefined)
                        updatedOrder.order.clientId = clientId;
                    sub.next({
                        all: allOrders,
                        changed: [updatedOrder],
                    });
                }
                else {
                    this.logger.warn(LOG_TAG, `onOrderStatus: non existent order ignored. orderId: ${orderId}, permId: ${permId}.`);
                }
            });
        };
        /**
         *  Ends the subscription once all openOrders are recieved
         *  @param subscriptions listeners
         */
        this.onOpenOrderEnd = (subscriptions) => {
            // notify all subscribers
            subscriptions.forEach((subscription) => {
                const lastAllValue = subscription.lastAllValue ?? [];
                subscription.endEventReceived = true;
                subscription.next({ all: lastAllValue });
            });
        };
        /** nextValidId event handler */
        this.onNextValidId = (subscriptions, orderId) => {
            // this is special to other one-shot callbacks:
            // we only want to complete one subscription at a time,
            // to avoid multiple getNextValidOrderId calls to return same value
            const next = subscriptions.entries().next();
            if (next && !next.done && next.value[1]) {
                next.value[1].next({
                    all: orderId,
                });
                next.value[1].complete();
            }
        };
        /**
         *  Ends the subscrition once all trades are recieved
         *  @param subscriptions
         *  @param reqId
         *  @param contract  Contract details that is used for order
         *  @param execution Execution details of an order
         */
        this.onExecDetails = (subscriptions, reqId, contract, execution) => {
            subscriptions.forEach((sub) => {
                const allTrades = sub.lastAllValue ?? [];
                allTrades.push({ reqId, contract, execution });
                sub.next({
                    all: allTrades,
                });
            });
        };
        /**
         *  Ends the subscrition once all trades are recieved
         *  @param subscriptions
         */
        this.onExecDetailsEnd = (subscriptions, reqId) => {
            const sub = subscriptions.get(reqId);
            if (!sub) {
                return;
            }
            if (!sub.lastAllValue) {
                sub.next({ all: [] });
            }
            sub.complete();
        };
        /** comissionReport event handler. */
        this.onComissionReport = (subscriptions, commissionReport) => {
            subscriptions.forEach((sub) => {
                const commissionReports = sub.lastAllValue ?? [];
                commissionReports.push(commissionReport);
                sub.next({
                    all: commissionReports,
                });
            });
        };
        /** symbolSamples event handler. */
        this.onSymbolSamples = (subscriptions, reqId, contractDescriptions) => {
            const sub = subscriptions.get(reqId);
            subscriptions.delete(reqId);
            sub?.next({
                all: contractDescriptions,
            });
            sub?.complete();
        };
        /** @deprecated use getMatchingSymbols instead */
        this.searchContracts = this.getMatchingSymbols;
        /** userInfo event handler. */
        this.onUserInfo = (subscriptions, reqId, whiteBrandingId) => {
            const sub = subscriptions.get(reqId);
            subscriptions.delete(reqId);
            sub?.next({
                all: whiteBrandingId,
            });
            sub?.complete();
        };
        this.logger = new logger_1.IBApiNextLogger(options?.logger ?? new console_logger_1.ConsoleLogger());
        // create the IBApiAutoConnection and subscription registry
        this.api = new auto_connection_1.IBApiAutoConnection(options?.reconnectInterval ?? 0, (options?.connectionWatchdogInterval ?? 0) * 1000, this.logger, options);
        this.subscriptions = new subscription_registry_1.IBApiNextSubscriptionRegistry(this.api, this);
        // setup error event handler (bound to lifetime of IBApiAutoConnection so we never unregister)
        this.api.on(__1.EventName.error, (error, code, reqId, advancedOrderReject) => {
            const apiError = {
                error,
                code,
                reqId,
                advancedOrderReject,
            };
            // handle warnings - they are also reported on TWS error callback, but we DO NOT want to emit
            // it as error into the subject (and cancel the subscription).
            if ((code >= 2100 && code < 3000) ||
                code === __1.ErrorCode.PART_OF_REQUESTED_DATA_NOT_SUBSCRIBED ||
                code === __1.ErrorCode.DISPLAYING_DELAYED_DATA) {
                this.logger.warn(TWS_LOG_TAG, `${error.message} - Code: ${code} - ReqId: ${reqId}`);
                return;
            }
            // emit to the subscription subject
            if (reqId !== INVALID_REQ_ID) {
                this.subscriptions.dispatchError(reqId, apiError);
            }
            // emit to global error subject
            this.errorSubject.next(apiError);
        });
        // setup TWS server version event handler  (bound to lifetime of IBApiAutoConnection so we never unregister)
        this.api.on(__1.EventName.server, (version, connectionTime) => {
            this.logger.info(TWS_LOG_TAG, `Server Version: ${version}. Connection time ${connectionTime}`);
        });
        // setup TWS info message event handler  (bound to lifetime of IBApiAutoConnection so we never unregister)
        this.api.on(__1.EventName.info, (message, code) => {
            this.logger.info(TWS_LOG_TAG, `${message} - Code: ${code}`);
        });
    }
    /**
     * @internal
     * The next unused request id.
     * For internal use only.
     */
    get nextReqId() {
        return this._nextReqId++;
    }
    /** Get the current log level. */
    get logLevel() {
        return this.logger.logLevel;
    }
    /** Set the current log level. */
    set logLevel(level) {
        this.logger.logLevel = level;
        this.api.setServerLogLevel(level);
    }
    /**
     * Get an [[Observable]] to receive errors on IB API.
     *
     * Errors that have a valid request id, will additionally be sent to
     * the observers of the request.
     */
    get error() {
        return this.errorSubject;
    }
    /**
     * Get an [[Observable]] for observing the connection-state.
     */
    get connectionState() {
        return this.api.connectionState;
    }
    /** Returns true if currently connected, false otherwise. */
    get isConnected() {
        return this.api.isConnected;
    }
    /**
     * Connect to the TWS or IB Gateway.
     *
     * @param clientId A fixed client id to be used on all connection
     * attempts. If not specified, the first connection will use the
     * default client id (0) and increment it with each re-connection
     * attempt.
     *
     * @sse [[connectionState]] for observing the connection state.
     */
    connect(clientId) {
        this.logger.debug(LOG_TAG, `connect(${clientId})`);
        this.api.connect(clientId);
        return this;
    }
    /**
     * Disconnect from the TWS or IB Gateway.
     *
     * Use [[connectionState]] for observing the connection state.
     */
    disconnect() {
        this.logger.debug(LOG_TAG, "disconnect()");
        this.api.disconnect();
        return this;
    }
    /**
     * Get TWS's current time.
     */
    getCurrentTime() {
        return (0, rxjs_1.lastValueFrom)(this.subscriptions
            .register(() => {
            this.api.reqCurrentTime();
        }, undefined, [[__1.EventName.currentTime, this.onCurrentTime]], "getCurrentTime")
            .pipe((0, operators_1.map)((v) => v.all)), {
            defaultValue: 0,
        });
    }
    /**
     * Get the accounts to which the logged user has access to.
     */
    getManagedAccounts() {
        return (0, rxjs_1.lastValueFrom)(this.subscriptions
            .register(() => {
            this.api.reqManagedAccts();
        }, undefined, [[__1.EventName.managedAccounts, this.onManagedAccts]], "getManagedAccounts")
            .pipe((0, operators_1.map)((v) => v.all)), {
            defaultValue: [],
        });
    }
    /**
     * Create subscription to receive the account summaries of all linked accounts as presented in the TWS' Account Summary tab.
     *
     * All account summaries are sent on the first event.
     * Use incrementalUpdates argument to switch between incremental or full update mode.
     * With incremental updates, only changed account summary values will be sent after the initial complete list.
     * Without incremental updates, the complete list of account summaries will be sent again if any value has changed.
     *
     * https://www.interactivebrokers.com/en/software/tws/accountwindowtop.htm
     *
     * @param group Set to "All" to return account summary data for all accounts,
     * or set to a specific Advisor Account Group name that has already been created in TWS Global Configuration.
     * @param tags A comma separated list with the desired tags:
     * - AccountType — Identifies the IB account structure
     * - NetLiquidation — The basis for determining the price of the assets in your account. Total cash value + stock value + options value + bond value
     * - TotalCashValue — Total cash balance recognized at the time of trade + futures PNL
     * - SettledCash — Cash recognized at the time of settlement - purchases at the time of trade - commissions - taxes - fees
     * - AccruedCash — Total accrued cash value of stock, commodities and securities
     * - BuyingPower — Buying power serves as a measurement of the dollar value of securities that one may purchase in a securities account without depositing additional funds
     * - EquityWithLoanValue — Forms the basis for determining whether a client has the necessary assets to either initiate or maintain security positions. Cash + stocks + bonds + mutual funds
     * - PreviousDayEquityWithLoanValue — Marginable Equity with Loan value as of 16:00 ET the previous day
     * - GrossPositionValue — The sum of the absolute value of all stock and equity option positions
     * - RegTEquity — Regulation T equity for universal account
     * - RegTMargin — Regulation T margin for universal account
     * - SMA — Special Memorandum Account: Line of credit created when the market value of securities in a Regulation T account increase in value
     * - InitMarginReq — Initial Margin requirement of whole portfolio
     * - MaintMarginReq — Maintenance Margin requirement of whole portfolio
     * - AvailableFunds — This value tells what you have available for trading
     * - ExcessLiquidity — This value shows your margin cushion, before liquidation
     * - Cushion — Excess liquidity as a percentage of net liquidation value
     * - FullInitMarginReq — Initial Margin of whole portfolio with no discounts or intraday credits
     * - FullMaintMarginReq — Maintenance Margin of whole portfolio with no discounts or intraday credits
     * - FullAvailableFunds — Available funds of whole portfolio with no discounts or intraday credits
     * - FullExcessLiquidity — Excess liquidity of whole portfolio with no discounts or intraday credits
     * - LookAheadNextChange — Time when look-ahead values take effect
     * - LookAheadInitMarginReq — Initial Margin requirement of whole portfolio as of next period's margin change
     * - LookAheadMaintMarginReq — Maintenance Margin requirement of whole portfolio as of next period's margin change
     * - LookAheadAvailableFunds — This value reflects your available funds at the next margin change
     * - LookAheadExcessLiquidity — This value reflects your excess liquidity at the next margin change
     * - HighestSeverity — A measure of how close the account is to liquidation
     * - DayTradesRemaining — The Number of Open/Close trades a user could put on before Pattern Day Trading is detected. A value of "-1" means that the user can put on unlimited day trades.
     * - Leverage — GrossPositionValue / NetLiquidation
     * - $LEDGER — Single flag to relay all cash balance tags*, only in base currency.
     * - $LEDGER:CURRENCY — Single flag to relay all cash balance tags*, only in the specified currency.
     * - $LEDGER:ALL — Single flag to relay all cash balance tags* in all currencies.
     */
    getAccountSummary(group, tags) {
        return this.subscriptions.register((reqId) => {
            this.api.reqAccountSummary(reqId, group, tags);
        }, (reqId) => {
            this.api.cancelAccountSummary(reqId);
        }, [
            [__1.EventName.accountSummary, this.onAccountSummary],
            [__1.EventName.accountSummaryEnd, this.onAccountSummaryEnd],
        ], `${group}:${tags}`);
    }
    /**
     * The getAccountUpdates function creates a subscription to the TWS through which account and portfolio information is delivered.
     * This information is the exact same as the one displayed within the TWS' Account Window.
     * In a single account structure, the account number is not necessary.
     * Just as with the TWS' Account Window, unless there is a position change this information is updated at a fixed interval of three minutes.
     *
     * @param acctCode the specific account to retrieve.
     *
     * @see [[reqAccountUpdates]], [[reqGlobalCancel]]
     */
    getAccountUpdates(acctCode) {
        this.logger.debug(LOG_TAG, `getAccountUpdates(${acctCode})`);
        return this.subscriptions.register(() => {
            this.api.reqAccountUpdates(true, acctCode);
        }, () => {
            this.api.reqAccountUpdates(false, acctCode);
        }, [
            [__1.EventName.updateAccountValue, this.onUpdateAccountValue],
            [__1.EventName.updatePortfolio, this.onUpdatePortfolio],
            [__1.EventName.updateAccountTime, this.onUpdateAccountTime],
            [__1.EventName.accountDownloadEnd, this.onAccountDownloadEnd],
        ], acctCode ? `getAccountUpdates+${acctCode}` : "getAccountUpdates");
    }
    /**
     * Create subscription to receive the positions on all accessible accounts.
     */
    getPositions() {
        return this.subscriptions.register(() => {
            this.api.reqPositions();
        }, () => {
            this.api.cancelPositions();
        }, [
            [__1.EventName.position, this.onPosition],
            [__1.EventName.positionEnd, this.onPositionEnd],
        ], "getPositions");
    }
    /**
     * Request contract information from TWS.
     * This method will provide all the contracts matching the contract provided.
     *
     * It can also be used to retrieve complete options and futures chains.
     * Though it is now (in API version > 9.72.12) advised to use reqSecDefOptParams for that purpose.
     *
     * This information will be emitted as contractDetails event.
     *
     * @param contract The contract used as sample to query the available contracts.
     */
    getContractDetails(contract) {
        return (0, rxjs_1.lastValueFrom)(this.subscriptions
            .register((reqId) => {
            this.api.reqContractDetails(reqId, contract);
        }, undefined, [
            [__1.EventName.contractDetails, this.onContractDetails],
            [__1.EventName.bondContractDetails, this.onContractDetails],
            [__1.EventName.contractDetailsEnd, this.onContractDetailsEnd],
        ])
            .pipe((0, operators_1.map)((v) => v.all)), {
            defaultValue: [],
        });
    }
    /**
     * Requests security definition option parameters for viewing a contract's option chain.
     *
     * This information will be emitted as securityDefinitionOptionParameter event.
     *
     * @param underlyingSymbol The underlying symbol to query the available contracts.
     * @param futFopExchange The exchange on which the returned options are trading. Can be set to the empty string "" for all exchanges.
     * @param underlyingSecType The type of the underlying security, i.e. STK.
     * @param underlyingConId the contract ID of the underlying security.
     */
    getSecDefOptParams(underlyingSymbol, futFopExchange, underlyingSecType, underlyingConId) {
        return (0, rxjs_1.lastValueFrom)(this.subscriptions
            .register((reqId) => {
            this.api.reqSecDefOptParams(reqId, underlyingSymbol, futFopExchange, underlyingSecType, underlyingConId);
        }, undefined, [
            [
                __1.EventName.securityDefinitionOptionParameter,
                this.onSecurityDefinitionOptionParameter,
            ],
            [
                __1.EventName.securityDefinitionOptionParameterEnd,
                this.onSecurityDefinitionOptionParameterEnd,
            ],
        ])
            .pipe((0, operators_1.map)((v) => v.all)), {
            defaultValue: [],
        });
    }
    /**
     * Create a subscription to receive real time daily PnL and unrealized PnL updates.
     *
     * @param account Account for which to receive PnL updates.
     * @param modelCode Specify to request PnL updates for a specific model.
     */
    getPnL(account, modelCode) {
        return this.subscriptions
            .register((reqId) => {
            this.api.reqPnL(reqId, account, modelCode);
        }, (reqId) => {
            this.api.cancelPnL(reqId);
        }, [[__1.EventName.pnl, this.onPnL]], `${account}:${modelCode}`)
            .pipe((0, operators_1.map)((v) => v.all));
    }
    /**
     * Create a subscription to receive real time updates for daily PnL of individual positions.
     *
     * @param account Account in which position exists.
     * @param modelCode Model in which position exists.
     * @param conId Contract ID (conId) of contract to receive daily PnL updates for.
     */
    getPnLSingle(account, modelCode, conId) {
        return this.subscriptions
            .register((reqId) => {
            this.api.reqPnLSingle(reqId, account, modelCode, conId);
        }, (reqId) => {
            this.api.cancelPnLSingle(reqId);
        }, [[__1.EventName.pnlSingle, this.onPnLSingle]], `${account}:${modelCode}:${conId}`)
            .pipe((0, operators_1.map)((v) => v.all));
    }
    /**
     * Switches data type returned from reqMktData request to "frozen", "delayed" or "delayed-frozen" market data.
     * Requires TWS/IBG v963+.
     *
     * By default only real-time [[MarketDataType.REALTIME]] market data is enabled.
     *
     * The API can receive frozen market data from Trader Workstation.
     * Frozen market data is the last data recorded in our system.
     * During normal trading hours, the API receives real-time market data.
     * Invoking this function with argument [[MarketDataType.FROZEN]] requests a switch to frozen data immediately or after the close.
     * When the market reopens, the market data type will automatically switch back to real time if available.
     *
     * @param type The requested market data type.
     */
    setMarketDataType(type) {
        this.api.reqMarketDataType(type);
    }
    /**
     * Create a subscription to receive real time market data.
     * Returns market data for an instrument either in real time or 10-15 minutes delayed (depending on the market data type specified,
     * see [[setMarketDataType]]).
     * If you plan to use `getMarketData` with either `snapshot` or `regulatorySnapshot`set to `true`
     * then you should consider using `getMarketDataSingle` instead.
     *
     * @param contract The [[Contract]] for which the data is being requested
     * @param genericTickList comma  separated ids of the available generic ticks:
     * - 100 Option Volume (currently for stocks)
     * - 101 Option Open Interest (currently for stocks)
     * - 104 Historical Volatility (currently for stocks)
     * - 105 Average Option Volume (currently for stocks)
     * - 106 Option Implied Volatility (currently for stocks)
     * - 162 Index Future Premium
     * - 165 Miscellaneous Stats
     * - 221 Mark Price (used in TWS P&L computations)
     * - 225 Auction values (volume, price and imbalance)
     * - 233 RTVolume - contains the last trade price, last trade size, last trade time, total volume, VWAP, and single trade flag.
     * - 236 Shortable
     * - 256 Inventory
     * - 258 Fundamental Ratios
     * - 411 Realtime Historical Volatility
     * - 456 IBDividends
     * @param snapshot For users with corresponding real time market data subscriptions.
     * A `true` value will return a one-time snapshot, completing the Observable when finished, after 11s latest.
     * A `false` value will provide endless streaming data, never completing the Observable.
     * @param regulatorySnapshot Snapshot for US stocks requests NBBO snapshots for users which have "US Securities Snapshot Bundle" subscription
     * but not corresponding Network A, B, or C subscription necessary for streaming * market data.
     * One-time snapshot of current market price that will incur a fee of 1 cent to the account per snapshot.
     */
    getMarketData(contract, genericTickList, snapshot, regulatorySnapshot) {
        return this.subscriptions.register((reqId) => {
            this.api.reqMktData(reqId, contract, genericTickList, snapshot, regulatorySnapshot);
        }, (reqId) => {
            // when using snapshot, cancel will cause a "Can't find EId with tickerId" error.
            if (!snapshot && !regulatorySnapshot) {
                this.api.cancelMktData(reqId);
            }
        }, [
            [__1.EventName.tickPrice, this.onTick],
            [__1.EventName.tickSize, this.onTick],
            [__1.EventName.tickGeneric, this.onTick],
            [__1.EventName.tickOptionComputation, this.onTickOptionComputation],
            [__1.EventName.tickSnapshotEnd, this.onTickSnapshotEnd],
        ], snapshot || regulatorySnapshot
            ? undefined
            : `${JSON.stringify(contract)}:${genericTickList}`);
    }
    /**
     * Fetch a snapshot of real time market data.
     * Returns market data for an instrument either in real time or 10-15 minutes delayed (depending on the market data type specified,
     * see [[setMarketDataType]]).
     * getMarketDataSingle will collect market data for a maximum of 11 seconds and then return the result.
     *
     * @param contract The [[Contract]] for which the data is being requested
     * @param genericTickList comma  separated ids of the generic ticks
     * Look at getMarketData documentation for a list of available generic ticks.
     * @param regulatorySnapshot Snapshot for US stocks requests NBBO snapshots for users which have "US Securities Snapshot Bundle" subscription
     * but not corresponding Network A, B, or C subscription necessary for streaming * market data.
     * One-time snapshot of current market price that will incur a fee of 1 cent to the account per snapshot.
     */
    getMarketDataSnapshot(contract, genericTickList, regulatorySnapshot) {
        return (0, rxjs_1.lastValueFrom)(this.getMarketData(contract, genericTickList, true, regulatorySnapshot).pipe((0, operators_1.map)((v) => v.all)), {
            defaultValue: new mutable_market_data_1.MutableMarketData(),
        });
    }
    /**
     * Get the timestamp of earliest available historical data for a contract and data type.
     *
     * @param contract [[Contract]] object for which head timestamp is being requested.
     * @param whatToShow Type of data for head timestamp - "BID", "ASK", "TRADES", etc
     * @param useRTH Use regular trading hours only, `true` for yes or `false` for no.
     * @param formatDate Set to 1 to obtain the bars' time as yyyyMMdd HH:mm:ss, set to 2 to obtain it like system time format in seconds.
     */
    getHeadTimestamp(contract, whatToShow, useRTH, formatDate) {
        return (0, rxjs_1.lastValueFrom)(this.subscriptions
            .register((reqId) => {
            this.api.reqHeadTimestamp(reqId, contract, whatToShow, useRTH, formatDate);
        }, (reqId) => {
            this.api.cancelHeadTimestamp(reqId);
        }, [[__1.EventName.headTimestamp, this.onHeadTimestamp]], `${JSON.stringify(contract)}:${whatToShow}:${useRTH}:${formatDate}`)
            .pipe((0, operators_1.map)((v) => v.all)), {
            defaultValue: "",
        });
    }
    /**
     * Get a contracts historical data.
     *
     * When requesting historical data, a finishing time and date is required along with a duration string.
     * For example, having:
     * - endDateTime: 20130701 23:59:59 GMT
     * - durationStr: 3 D
     * will return three days of data counting backwards from July 1st 2013 at 23:59:59 GMT resulting in all the available bars of the last three days
     * until the date and time specified.
     *
     * It is possible to specify a timezone optionally.
     *
     * @see https://interactivebrokers.github.io/tws-api/historical_bars.html for details.
     *
     * @param contract The contract for which we want to retrieve the data.
     * @param endDateTime Request's ending time with format yyyyMMdd HH:mm:ss {TMZ}.
     * @param durationStr The amount of time for which the data needs to be retrieved:
     * - [n] S (seconds)
     * - [n] D (days)
     * - [n] W (weeks)
     * - [n] M (months)
     * - [n] Y (years)
     * @param barSizeSetting the size of the bar:
     * - 1 secs
     * - 5 secs
     * - 15 secs
     * - 30 secs
     * - 1 min
     * - 2 mins
     * - 3 mins
     * - 5 mins
     * - 15 mins
     * - 30 mins
     * - 1 hour
     * - 1 day
     * @param whatToShow the kind of information being retrieved:
     * - TRADES
     * - MIDPOINT
     * - BID
     * - ASK
     * - BID_ASK
     * - HISTORICAL_VOLATILITY
     * - OPTION_IMPLIED_VOLATILITY
     * - FEE_RATE
     * - REBATE_RATE
     * @param useRTH Set to 0 to obtain the data which was also generated outside of the Regular Trading Hours, set to 1 to obtain only the RTH data
     * @param formatDate Set to 1 to obtain the bars' time as yyyyMMdd HH:mm:ss, set to 2 to obtain it like system time format in seconds
     */
    getHistoricalData(contract, endDateTime, durationStr, barSizeSetting, whatToShow, useRTH, formatDate) {
        return (0, rxjs_1.lastValueFrom)(this.subscriptions
            .register((reqId) => {
            this.api.reqHistoricalData(reqId, contract, endDateTime, durationStr, barSizeSetting, whatToShow, useRTH, formatDate, false);
        }, undefined, [[__1.EventName.historicalData, this.onHistoricalData]], undefined)
            .pipe((0, operators_1.map)((v) => v.all)), {
            defaultValue: [],
        });
    }
    /**
     * Create a subscription to receive update on the most recent historical data bar of a contract.
     *
     * Use {@link IBApiNext.getHistoricalData} to receive history data and use this function if
     * you want to continue receiving real-time updates on most recent bar.
     *
     * @see https://interactivebrokers.github.io/tws-api/historical_bars.html for details.
     *
     * @param contract The contract for which we want to retrieve the data.
     * @param barSizeSetting the size of the bar:
     * - 1 secs
     * - 5 secs
     * - 15 secs
     * - 30 secs
     * - 1 min
     * - 2 mins
     * - 3 mins
     * - 5 mins
     * - 15 mins
     * - 30 mins
     * - 1 hour
     * - 1 day
     * @param whatToShow the kind of information being retrieved:
     * - TRADES
     * - MIDPOINT
     * - BID
     * - ASK
     * - BID_ASK
     * - HISTORICAL_VOLATILITY
     * - OPTION_IMPLIED_VOLATILITY
     * - FEE_RATE
     * - REBATE_RATE
     * @param formatDate Set to 1 to obtain the bars' time as yyyyMMdd HH:mm:ss, set to 2 to obtain it like system time format in seconds
     */
    getHistoricalDataUpdates(contract, barSizeSetting, whatToShow, formatDate) {
        return this.subscriptions
            .register((reqId) => {
            this.api.reqHistoricalData(reqId, contract, "", "1 D", barSizeSetting, whatToShow, 0, formatDate, true);
        }, (reqId) => {
            this.api.cancelHistoricalData(reqId);
        }, [[__1.EventName.historicalDataUpdate, this.onHistoricalDataUpdate]], `${JSON.stringify(contract)}:${barSizeSetting}:${whatToShow}:${formatDate}`)
            .pipe((0, operators_1.map)((v) => v.all));
    }
    /**
     * Create a subscription to receive historical mid prices from Time&Sales data of an instrument.
     * The next callback will be invoked each time a new tick is received from TWS.
     * The complete callback will be invoked when all required ticks have been
     * received.
     *
     * @param contract [[Contract]] object that is subject of query
     * @param startDateTime "20170701 12:01:00". Uses TWS timezone specified at login.
     * @param endDateTime "20170701 13:01:00". In TWS timezone. Exactly one of start time and end time has to be defined.
     * @param numberOfTicks Number of distinct data points. Max currently 1000 per request.
     * @param useRTH Data from regular trading hours (1), or all available hours (0)
     */
    getHistoricalTicksMid(contract, startDateTime, endDateTime, numberOfTicks, useRTH) {
        return this.subscriptions
            .register((reqId) => {
            this.api.reqHistoricalTicks(reqId, contract, startDateTime, endDateTime, numberOfTicks, __1.WhatToShow.MIDPOINT, useRTH, false);
        }, undefined, [[__1.EventName.historicalTicks, this.onHistoricalTicks]], undefined)
            .pipe((0, operators_1.map)((v) => v.all));
    }
    /**
     * Create a subscription to receive historical bid and ask prices from Time&Sales data of an instrument.
     * The next callback will be invoked each time a new tick is received from TWS.
     * The complete callback will be invoked when all required ticks have been
     * received.
     *
     * @param contract [[Contract]] object that is subject of query
     * @param startDateTime "20170701 12:01:00". Uses TWS timezone specified at login.
     * @param endDateTime "20170701 13:01:00". In TWS timezone. Exactly one of start time and end time has to be defined.
     * @param numberOfTicks Number of distinct data points. Max currently 1000 per request.
     * @param useRTH Data from regular trading hours (1), or all available hours (0)
     * @param ignoreSize A filter only used when the source price is Bid_Ask
     */
    getHistoricalTicksBidAsk(contract, startDateTime, endDateTime, numberOfTicks, useRTH, ignoreSize) {
        return this.subscriptions
            .register((reqId) => {
            this.api.reqHistoricalTicks(reqId, contract, startDateTime, endDateTime, numberOfTicks, __1.WhatToShow.BID_ASK, useRTH, ignoreSize);
        }, undefined, [[__1.EventName.historicalTicksBidAsk, this.onHistoricalTicksBidAsk]], undefined)
            .pipe((0, operators_1.map)((v) => v.all));
    }
    /**
     * Create a subscription to receive historical last trade prices from Time&Sales data of an instrument.
     * The next callback will be invoked each time a new tick is received from TWS.
     * The complete callback will be invoked when all required ticks have been
     * received.
     *
     * @param contract [[Contract]] object that is subject of query
     * @param startDateTime "20170701 12:01:00". Uses TWS timezone specified at login.
     * @param endDateTime "20170701 13:01:00". In TWS timezone. Exactly one of start time and end time has to be defined.
     * @param numberOfTicks Number of distinct data points. Max 1000 per request.
     * @param useRTH Data from regular trading hours (1), or all available hours (0)
     */
    getHistoricalTicksLast(contract, startDateTime, endDateTime, numberOfTicks, useRTH) {
        return this.subscriptions
            .register((reqId) => {
            this.api.reqHistoricalTicks(reqId, contract, startDateTime, endDateTime, numberOfTicks, __1.WhatToShow.TRADES, useRTH, false);
        }, undefined, [[__1.EventName.historicalTicksLast, this.onHistoricalTicksLast]], undefined)
            .pipe((0, operators_1.map)((v) => v.all));
    }
    /**
     * Get venues for which market data is returned on getMarketDepthL2 (those with market makers).
     */
    getMarketDepthExchanges() {
        return (0, rxjs_1.lastValueFrom)(this.subscriptions
            .register(() => {
            this.api.reqMktDepthExchanges();
        }, undefined, [[__1.EventName.mktDepthExchanges, this.onMktDepthExchanges]], "getMarketDepthExchanges")
            .pipe((0, operators_1.map)((v) => v.all)), {
            defaultValue: [],
        });
    }
    // mutable
    insertAtMapIndex(index, key, value, map) {
        const arr = Array.from(map);
        arr.splice(index, 0, [key, value]);
        map.clear();
        arr.forEach(([k, v]) => map.set(k, v));
        return map;
    }
    /**
     * Requests the contract's market depth (order book).
     *
     * This request must be direct-routed to an exchange and not smart-routed.
     *
     * The number of simultaneous market depth requests allowed in an account is calculated based on a formula
     * that looks at an accounts equity, commissions, and quote booster packs.
     *
     * @param contract The [[Contract]] for which the depth is being requested.
     * @param numRows The number of rows on each side of the order book.
     * @param isSmartDepth Flag indicates that this is smart depth request.
     * @param mktDepthOptions TODO document
     */
    getMarketDepth(contract, numRows, isSmartDepth, mktDepthOptions) {
        return this.subscriptions.register((reqId) => {
            this.api.reqMktDepth(reqId, contract, numRows, isSmartDepth, mktDepthOptions);
        }, (reqId) => {
            this.api.cancelMktDepth(reqId, isSmartDepth);
        }, [
            [__1.EventName.updateMktDepth, this.onUpdateMktDepth],
            [__1.EventName.updateMktDepthL2, this.onUpdateMktDepthL2],
        ], `${JSON.stringify(contract)}:${numRows}:${isSmartDepth}:${mktDepthOptions}`);
    }
    /**
     * Requests an XML string that describes all possible scanner queries.
     */
    getScannerParameters() {
        return (0, rxjs_1.lastValueFrom)(this.subscriptions
            .register(() => {
            this.api.reqScannerParameters();
        }, undefined, [[__1.EventName.scannerParameters, this.onScannerParameters]], "getScannerParameters")
            .pipe((0, operators_1.map)((v) => v.all)), {
            defaultValue: "",
        });
    }
    /**
     * It returns an observable that will emit a list of scanner subscriptions.
     * @param {ScannerSubscription} scannerSubscription - ScannerSubscription
     * @param {TagValue[]} [scannerSubscriptionOptions] - An array of TagValue objects.
     * @param {TagValue[]} [scannerSubscriptionFilterOptions] - An optional array of TagValue objects.
     * @returns An observable that will emit a list of items.
     */
    getMarketScanner(scannerSubscription, scannerSubscriptionOptions, scannerSubscriptionFilterOptions) {
        return this.subscriptions.register((reqId) => {
            this.api.reqScannerSubscription(reqId, scannerSubscription, scannerSubscriptionOptions, scannerSubscriptionFilterOptions);
        }, (reqId) => {
            this.api.cancelScannerSubscription(reqId);
        }, [
            [__1.EventName.scannerData, this.onScannerData],
            [__1.EventName.scannerDataEnd, this.onScannerDataEnd],
        ], `getMarketScanner-${JSON.stringify(scannerSubscription)}`);
    }
    /**
     * Get data histogram of specified contract.
     *
     * @param contract [[Contract]] object for which histogram is being requested
     * @param useRTH Use regular trading hours only, `true` for yes or `false` for no.
     * @param duration Period duration of which data is being requested
     * @param durationUnit Duration unit of which data is being requested
     */
    getHistogramData(contract, useRTH, duration, durationUnit) {
        return (0, rxjs_1.lastValueFrom)(this.subscriptions
            .register((reqId) => {
            this.api.reqHistogramData(reqId, contract, useRTH, duration, durationUnit);
        }, (reqId) => {
            this.api.cancelHistogramData(reqId);
        }, [[__1.EventName.histogramData, this.onHistogramData]], `${JSON.stringify(contract)}:${useRTH}:${duration}:${durationUnit}`)
            .pipe((0, operators_1.map)((v) => v.all)), {
            defaultValue: [],
        });
    }
    /**
     * Requests all current open orders in associated accounts at the current moment.
     */
    getAllOpenOrders() {
        return (0, rxjs_1.lastValueFrom)(this.subscriptions
            .register(() => {
            this.api.reqAllOpenOrders();
        }, undefined, [
            [__1.EventName.openOrder, this.onOpenOrder],
            [__1.EventName.orderStatus, this.onOrderStatus],
            [__1.EventName.orderBound, this.onOrderBound],
            [__1.EventName.openOrderEnd, this.onOpenOrderComplete],
        ], "getAllOpenOrders")
            .pipe((0, operators_1.map)((v) => v.all)), {
            defaultValue: [],
        });
    }
    /**
     * Requests all open orders placed by this specific API client (identified by the API client id).
     * For client ID 0, this will bind previous manual TWS orders.
     */
    getOpenOrders() {
        return this.subscriptions.register(() => {
            this.api.reqOpenOrders();
        }, undefined, [
            [__1.EventName.openOrder, this.onOpenOrder],
            [__1.EventName.orderStatus, this.onOrderStatus],
            [__1.EventName.orderBound, this.onOrderBound],
            [__1.EventName.openOrderEnd, this.onOpenOrderEnd],
        ], "getOpenOrders");
    }
    /**
     * Requests status updates AND (IB documentation not correct on this point) future orders placed from TWS. Can only be used with client ID 0.
     *
     * @param autoBind if set to `true`, the newly created orders will be assigned an API order ID and implicitly
     *   associated with this client. If set to `false, future orders will not be.
     *
     * @see [[reqAllOpenOrders]], [[reqOpenOrders]], [[cancelOrder]], [[reqGlobalCancel]]
     */
    getAutoOpenOrders(autoBind) {
        return this.subscriptions.register(() => {
            this.api.reqAutoOpenOrders(autoBind);
        }, undefined, [
            [__1.EventName.openOrder, this.onOpenOrder],
            [__1.EventName.orderStatus, this.onOrderStatus],
            [__1.EventName.orderBound, this.onOrderBound],
            [__1.EventName.openOrderEnd, this.onOpenOrderEnd],
        ], "getAutoOpenOrders");
    }
    /**
     * Requests the next valid order ID at the current moment.
     */
    getNextValidOrderId() {
        return (0, rxjs_1.lastValueFrom)(this.subscriptions
            .register(() => {
            this.api.reqIds();
        }, undefined, [[__1.EventName.nextValidId, this.onNextValidId]])
            .pipe((0, operators_1.map)((v) => v.all)), {
            defaultValue: -1,
        });
    }
    /**
     * Places or modifies an order.
     * @param id The order's unique identifier.
     * Use a sequential id starting with the id received at the nextValidId method.
     * If a new order is placed with an order ID less than or equal to the order ID of a previous order an error will occur.
     * @param contract The order's [[Contract]].
     * @param order The [[Order]] object.
     */
    placeOrder(id, contract, order) {
        this.api.placeOrder(id, contract, order);
    }
    /**
     * Places new order.
     * This method does use the order id as returned by getNextValidOrderId() method and returns it as a result.
     * If you want to send multiple orders, consider using  placeOrder method instead and increase the order id manually for each new order, avoiding the overhead of calling getNextValidOrderId() for each.
     * @param contract The order's [[Contract]].
     * @param order The [[Order]] object.
     *  @see [[getNextValidOrderId]]
     */
    async placeNewOrder(contract, order) {
        const orderId = await this.getNextValidOrderId();
        this.placeOrder(orderId, contract, order);
        return orderId;
    }
    /**
     * Places new order.
     * @param id The order's unique identifier.
     * @param contract The order's [[Contract]].
     * @param order The [[Order]] object.
     *
     */
    modifyOrder(id, contract, order) {
        this.api.placeOrder(id, contract, order);
    }
    /**
     * Cancels an active order placed by from the same API client ID.
     *
     * Note: API clients cannot cancel individual orders placed by other clients.
     * Use [[cancelAllOrders]] instead.
     *
     * @param orderId Specify which order should be cancelled by its identifier.
     * @param manualOrderCancelTime Specify the time the order should be cancelled. An empty string will cancel the order immediately.
     */
    cancelOrder(orderId, manualOrderCancelTime) {
        this.api.cancelOrder(orderId, manualOrderCancelTime);
    }
    /**
     * Cancels all active orders.
     * This method will cancel ALL open orders including those placed directly from TWS.
     *
     * @see [[cancelOrder]]
     */
    cancelAllOrders() {
        this.api.reqGlobalCancel();
    }
    /**
     * Get execution details of all executed trades.
     * @param filter  filter trade data on [[ExecutionFilter]]
     */
    getExecutionDetails(filter) {
        return (0, rxjs_1.lastValueFrom)(this.subscriptions
            .register((reqId) => {
            this.api.reqExecutions(reqId, filter);
        }, undefined, [
            [__1.EventName.execDetails, this.onExecDetails],
            [__1.EventName.execDetailsEnd, this.onExecDetailsEnd],
        ])
            .pipe((0, operators_1.map)((v) => v.all)), {
            defaultValue: [],
        });
    }
    /**
     * Get commication reports details of all executed trades.
     * @param filter  filter trade data on [[ExecutionFilter]]
     */
    getCommissionReport(filter) {
        return (0, rxjs_1.lastValueFrom)(this.subscriptions
            .register((reqId) => {
            this.api.reqExecutions(reqId, filter);
        }, undefined, [
            [__1.EventName.execDetailsEnd, this.onExecDetailsEnd],
            [__1.EventName.commissionReport, this.onComissionReport],
        ])
            .pipe((0, operators_1.map)((v) => v.all)), {
            defaultValue: [],
        });
    }
    /**
     * Search contracts where name or symbol matches the given text pattern.
     *
     * @param pattern Either start of ticker symbol or (for larger strings) company name.
     */
    getMatchingSymbols(pattern) {
        return (0, rxjs_1.lastValueFrom)(this.subscriptions
            .register((reqId) => {
            this.api.reqMatchingSymbols(reqId, pattern);
        }, undefined, [[__1.EventName.symbolSamples, this.onSymbolSamples]])
            .pipe((0, operators_1.map)((v) => v.all)));
    }
    /**
     * Get the user info of the logged user.
     */
    getUserInfo() {
        return (0, rxjs_1.lastValueFrom)(this.subscriptions
            .register((reqId) => {
            this.api.reqUserInfo(reqId);
        }, undefined, [[__1.EventName.userInfo, this.onUserInfo]], "getUserInfo")
            .pipe((0, operators_1.map)((v) => v.all)), {
            defaultValue: undefined,
        });
    }
}
exports.IBApiNext = IBApiNext;
//# sourceMappingURL=api-next.js.map