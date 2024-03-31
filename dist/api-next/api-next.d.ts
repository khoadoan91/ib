import { Observable, Subject } from "rxjs";
import { Bar, BarSizeSetting, CommissionReport, Contract, ContractDescription, ContractDetails, DepthMktDataDescription, DurationUnit, ExecutionDetail, ExecutionFilter, HistogramEntry, HistoricalTick, HistoricalTickBidAsk, HistoricalTickLast, OpenOrder, Order, OrderBookUpdate, ScannerSubscription, SecType, TagValue, WhatToShow } from "../";
import LogLevel from "../api/data/enum/log-level";
import { MutableMarketData } from "../core/api-next/api/market/mutable-market-data";
import { IBApiNextLogger } from "../core/api-next/logger";
import { AccountPositionsUpdate, AccountSummariesUpdate, AccountUpdatesUpdate, ConnectionState, IBApiNextError, MarketDataType, MarketDataUpdate, OpenOrdersUpdate, PnL, PnLSingle, SecurityDefinitionOptionParameterType } from "./";
import { Logger } from "./common/logger";
import { MarketScannerUpdate } from "./market-scanner/market-scanner";
/**
 * Input arguments on the [[IBApiNext]] constructor.
 */
export interface IBApiNextCreationOptions {
    /**
     * Hostname of the TWS (or IB Gateway).
     *
     * Default is 'localhost'.
     */
    host?: string;
    /**
     * Hostname of the TWS (or IB Gateway).
     *
     * Default is 7496, which is the default setting on TWS for live-accounts.
     */
    port?: number;
    /**
     * The auto-reconnect interval in milliseconds.
     * If 0 or undefined, auto-reconnect will be disabled.
     */
    reconnectInterval?: number;
    /**
     * The connection-watchdog timeout interval in seconds.
     *
     * The connection-watchdog monitors the socket connection to TWS/IB Gateway for
     * activity and triggers a re-connect if TWS/IB Gateway does not response within
     * the given amount of time.
     * If 0 or undefined, the connection-watchdog will be disabled.
     */
    connectionWatchdogInterval?: number;
    /**
     * Max. number of requests per second, sent to TWS/IB Gateway.
     * Default is 40. IB specifies 50 requests/s as maximum.
     *
     * Note that sending large amount of requests within a small amount of time, significantly increases resource
     * consumption of the TWS/IB Gateway (especially memory consumption). If you experience any lags, hangs or crashes
     * on TWS/IB Gateway while sending request bursts, try to reduce this value.
     */
    maxReqPerSec?: number;
    /**
     * Custom logger implementation.
     *
     * By default [[IBApiNext]] does log to console.
     * If you want to log to a different target (i.e. a file or pipe),
     * set this attribute to your custom [[IBApiNextLogger]] implementation.
     */
    logger?: Logger;
}
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
export declare class IBApiNext {
    /**
     * Create an [[IBApiNext]] object.
     *
     * @param options Creation options.
     */
    constructor(options?: IBApiNextCreationOptions);
    /** The [[IBApiNextLogger]] instance. */
    readonly logger: IBApiNextLogger;
    /** The [[IBApi]] with auto-reconnect. */
    private readonly api;
    /** The subscription registry. */
    private readonly subscriptions;
    /**
     * @internal
     * The next unused request id.
     * For internal use only.
     */
    get nextReqId(): number;
    private _nextReqId;
    /**
     * The IBApi error [[Subject]].
     *
     * All errors from [[IBApi]] error events will be sent to this subject.
     */
    readonly errorSubject: Subject<IBApiNextError>;
    /** Get the current log level. */
    get logLevel(): LogLevel;
    /** Set the current log level. */
    set logLevel(level: LogLevel);
    /**
     * Get an [[Observable]] to receive errors on IB API.
     *
     * Errors that have a valid request id, will additionally be sent to
     * the observers of the request.
     */
    get error(): Observable<IBApiNextError>;
    /**
     * Get an [[Observable]] for observing the connection-state.
     */
    get connectionState(): Observable<ConnectionState>;
    /** Returns true if currently connected, false otherwise. */
    get isConnected(): boolean;
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
    connect(clientId?: number): IBApiNext;
    /**
     * Disconnect from the TWS or IB Gateway.
     *
     * Use [[connectionState]] for observing the connection state.
     */
    disconnect(): IBApiNext;
    /** currentTime event handler.  */
    private readonly onCurrentTime;
    /**
     * Get TWS's current time.
     */
    getCurrentTime(): Promise<number>;
    /** managedAccounts event handler.  */
    private onManagedAccts;
    /**
     * Get the accounts to which the logged user has access to.
     */
    getManagedAccounts(): Promise<string[]>;
    /** accountSummary event handler */
    private readonly onAccountSummary;
    /** accountSummaryEnd event handler */
    private readonly onAccountSummaryEnd;
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
    getAccountSummary(group: string, tags: string): Observable<AccountSummariesUpdate>;
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
    private readonly onUpdateAccountValue;
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
    private readonly onUpdatePortfolio;
    /**
     * Response to API updateAccountTime control message.
     *
     * @param subscriptions listeners
     * @param timeStamp the current timestamp
     *
     * @see [[reqAccountUpdates]]
     */
    private readonly onUpdateAccountTime;
    /**
     * Response to API accountDownloadEnd control message.
     *
     * @param subscriptions listeners
     * @param accountName the account name
     *
     * @see [[reqAccountUpdates]]
     */
    private readonly onAccountDownloadEnd;
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
    getAccountUpdates(acctCode?: string): Observable<AccountUpdatesUpdate>;
    /** position event handler */
    private readonly onPosition;
    /** position end enumeration event handler */
    private readonly onPositionEnd;
    /**
     * Create subscription to receive the positions on all accessible accounts.
     */
    getPositions(): Observable<AccountPositionsUpdate>;
    /** contractDetails event handler */
    private readonly onContractDetails;
    /** contractDetailsEnd event handler */
    private readonly onContractDetailsEnd;
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
    getContractDetails(contract: Contract): Promise<ContractDetails[]>;
    /** securityDefinitionOptionParameter event handler */
    private readonly onSecurityDefinitionOptionParameter;
    /** securityDefinitionOptionParameterEnd event handler */
    private readonly onSecurityDefinitionOptionParameterEnd;
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
    getSecDefOptParams(underlyingSymbol: string, futFopExchange: string, underlyingSecType: SecType, underlyingConId: number): Promise<SecurityDefinitionOptionParameterType[]>;
    /** pnl event handler. */
    private onPnL;
    /**
     * Create a subscription to receive real time daily PnL and unrealized PnL updates.
     *
     * @param account Account for which to receive PnL updates.
     * @param modelCode Specify to request PnL updates for a specific model.
     */
    getPnL(account: string, modelCode?: string): Observable<PnL>;
    /** pnlSingle event handler. */
    private readonly onPnLSingle;
    /**
     * Create a subscription to receive real time updates for daily PnL of individual positions.
     *
     * @param account Account in which position exists.
     * @param modelCode Model in which position exists.
     * @param conId Contract ID (conId) of contract to receive daily PnL updates for.
     */
    getPnLSingle(account: string, modelCode: string, conId: number): Observable<PnLSingle>;
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
    setMarketDataType(type: MarketDataType): void;
    /** tickPrice, tickSize and tickGeneric event handler */
    private readonly onTick;
    /** tickOptionComputationHandler event handler */
    private readonly onTickOptionComputation;
    /** tickSnapshotEnd event handler */
    private readonly onTickSnapshotEnd;
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
    getMarketData(contract: Contract, genericTickList: string, snapshot: boolean, regulatorySnapshot: boolean): Observable<MarketDataUpdate>;
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
    getMarketDataSnapshot(contract: Contract, genericTickList: string, regulatorySnapshot: boolean): Promise<MutableMarketData>;
    /**
     * @deprecated please use getMarketDataSnapshot instead of getMarketDataSingle.
     */
    getMarketDataSingle: (contract: Contract, genericTickList: string, regulatorySnapshot: boolean) => Promise<MutableMarketData>;
    /** headTimestamp event handler.  */
    private onHeadTimestamp;
    /**
     * Get the timestamp of earliest available historical data for a contract and data type.
     *
     * @param contract [[Contract]] object for which head timestamp is being requested.
     * @param whatToShow Type of data for head timestamp - "BID", "ASK", "TRADES", etc
     * @param useRTH Use regular trading hours only, `true` for yes or `false` for no.
     * @param formatDate Set to 1 to obtain the bars' time as yyyyMMdd HH:mm:ss, set to 2 to obtain it like system time format in seconds.
     */
    getHeadTimestamp(contract: Contract, whatToShow: WhatToShow, useRTH: boolean, formatDate: number): Promise<string>;
    /** historicalData event handler */
    private readonly onHistoricalData;
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
    getHistoricalData(contract: Contract, endDateTime: string | undefined, durationStr: string, barSizeSetting: BarSizeSetting, whatToShow: WhatToShow, useRTH: number, formatDate: number): Promise<Bar[]>;
    /** historicalDataUpdate event handler */
    private readonly onHistoricalDataUpdate;
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
    getHistoricalDataUpdates(contract: Contract, barSizeSetting: BarSizeSetting, whatToShow: WhatToShow, formatDate: number): Observable<Bar>;
    /** historicalTicks event handler */
    private readonly onHistoricalTicks;
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
    getHistoricalTicksMid(contract: Contract, startDateTime: string, endDateTime: string, numberOfTicks: number, useRTH: number): Observable<HistoricalTick[]>;
    /** historicalTicksBidAsk event handler */
    private readonly onHistoricalTicksBidAsk;
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
    getHistoricalTicksBidAsk(contract: Contract, startDateTime: string, endDateTime: string, numberOfTicks: number, useRTH: number, ignoreSize: boolean): Observable<HistoricalTickBidAsk[]>;
    /** historicalTicksLast event handler */
    private readonly onHistoricalTicksLast;
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
    getHistoricalTicksLast(contract: Contract, startDateTime: string, endDateTime: string, numberOfTicks: number, useRTH: number): Observable<HistoricalTickLast[]>;
    /** mktDepthExchanges event handler */
    private readonly onMktDepthExchanges;
    /**
     * Get venues for which market data is returned on getMarketDepthL2 (those with market makers).
     */
    getMarketDepthExchanges(): Promise<DepthMktDataDescription[]>;
    /** updateMktDepth event handler */
    private readonly onUpdateMktDepth;
    private insertAtMapIndex;
    /** marketDepthL2 event handler */
    private readonly onUpdateMktDepthL2;
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
    getMarketDepth(contract: Contract, numRows: number, isSmartDepth: boolean, mktDepthOptions?: TagValue[]): Observable<OrderBookUpdate>;
    private readonly onScannerParameters;
    /**
     * Requests an XML string that describes all possible scanner queries.
     */
    getScannerParameters(): Promise<string>;
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
    private readonly onScannerData;
    /**
     * Indicates the scanner data reception has terminated.
     * @param subscriptions
     * @param reqId the request's identifier
     * @returns
     */
    private readonly onScannerDataEnd;
    /**
     * It returns an observable that will emit a list of scanner subscriptions.
     * @param {ScannerSubscription} scannerSubscription - ScannerSubscription
     * @param {TagValue[]} [scannerSubscriptionOptions] - An array of TagValue objects.
     * @param {TagValue[]} [scannerSubscriptionFilterOptions] - An optional array of TagValue objects.
     * @returns An observable that will emit a list of items.
     */
    getMarketScanner(scannerSubscription: ScannerSubscription, scannerSubscriptionOptions?: TagValue[], scannerSubscriptionFilterOptions?: TagValue[]): Observable<MarketScannerUpdate>;
    /** histogramData event handler */
    private readonly onHistogramData;
    /**
     * Get data histogram of specified contract.
     *
     * @param contract [[Contract]] object for which histogram is being requested
     * @param useRTH Use regular trading hours only, `true` for yes or `false` for no.
     * @param duration Period duration of which data is being requested
     * @param durationUnit Duration unit of which data is being requested
     */
    getHistogramData(contract: Contract, useRTH: boolean, duration: number, durationUnit: DurationUnit): Promise<HistogramEntry[]>;
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
    private readonly onOpenOrder;
    /**
     *  Ends the subscription once all openOrders are recieved
     *  @param subscriptions listeners
     */
    private readonly onOpenOrderComplete;
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
    private readonly onOrderBound;
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
    private readonly onOrderStatus;
    /**
     *  Ends the subscription once all openOrders are recieved
     *  @param subscriptions listeners
     */
    private readonly onOpenOrderEnd;
    /**
     * Requests all current open orders in associated accounts at the current moment.
     */
    getAllOpenOrders(): Promise<OpenOrder[]>;
    /**
     * Requests all open orders placed by this specific API client (identified by the API client id).
     * For client ID 0, this will bind previous manual TWS orders.
     */
    getOpenOrders(): Observable<OpenOrdersUpdate>;
    /**
     * Requests status updates AND (IB documentation not correct on this point) future orders placed from TWS. Can only be used with client ID 0.
     *
     * @param autoBind if set to `true`, the newly created orders will be assigned an API order ID and implicitly
     *   associated with this client. If set to `false, future orders will not be.
     *
     * @see [[reqAllOpenOrders]], [[reqOpenOrders]], [[cancelOrder]], [[reqGlobalCancel]]
     */
    getAutoOpenOrders(autoBind: boolean): Observable<OpenOrdersUpdate>;
    /** nextValidId event handler */
    private readonly onNextValidId;
    /**
     * Requests the next valid order ID at the current moment.
     */
    getNextValidOrderId(): Promise<number>;
    /**
     * Places or modifies an order.
     * @param id The order's unique identifier.
     * Use a sequential id starting with the id received at the nextValidId method.
     * If a new order is placed with an order ID less than or equal to the order ID of a previous order an error will occur.
     * @param contract The order's [[Contract]].
     * @param order The [[Order]] object.
     */
    placeOrder(id: number, contract: Contract, order: Order): void;
    /**
     * Places new order.
     * This method does use the order id as returned by getNextValidOrderId() method and returns it as a result.
     * If you want to send multiple orders, consider using  placeOrder method instead and increase the order id manually for each new order, avoiding the overhead of calling getNextValidOrderId() for each.
     * @param contract The order's [[Contract]].
     * @param order The [[Order]] object.
     *  @see [[getNextValidOrderId]]
     */
    placeNewOrder(contract: Contract, order: Order): Promise<number>;
    /**
     * Places new order.
     * @param id The order's unique identifier.
     * @param contract The order's [[Contract]].
     * @param order The [[Order]] object.
     *
     */
    modifyOrder(id: number, contract: Contract, order: Order): void;
    /**
     * Cancels an active order placed by from the same API client ID.
     *
     * Note: API clients cannot cancel individual orders placed by other clients.
     * Use [[cancelAllOrders]] instead.
     *
     * @param orderId Specify which order should be cancelled by its identifier.
     * @param manualOrderCancelTime Specify the time the order should be cancelled. An empty string will cancel the order immediately.
     */
    cancelOrder(orderId: number, manualOrderCancelTime?: string): void;
    /**
     * Cancels all active orders.
     * This method will cancel ALL open orders including those placed directly from TWS.
     *
     * @see [[cancelOrder]]
     */
    cancelAllOrders(): void;
    /**
     *  Ends the subscrition once all trades are recieved
     *  @param subscriptions
     *  @param reqId
     *  @param contract  Contract details that is used for order
     *  @param execution Execution details of an order
     */
    private readonly onExecDetails;
    /**
     *  Ends the subscrition once all trades are recieved
     *  @param subscriptions
     */
    private readonly onExecDetailsEnd;
    /** comissionReport event handler. */
    private readonly onComissionReport;
    /**
     * Get execution details of all executed trades.
     * @param filter  filter trade data on [[ExecutionFilter]]
     */
    getExecutionDetails(filter: ExecutionFilter): Promise<ExecutionDetail[]>;
    /**
     * Get commication reports details of all executed trades.
     * @param filter  filter trade data on [[ExecutionFilter]]
     */
    getCommissionReport(filter: ExecutionFilter): Promise<CommissionReport[]>;
    /** symbolSamples event handler. */
    private readonly onSymbolSamples;
    /**
     * Search contracts where name or symbol matches the given text pattern.
     *
     * @param pattern Either start of ticker symbol or (for larger strings) company name.
     */
    getMatchingSymbols(pattern: string): Promise<ContractDescription[]>;
    /** @deprecated use getMatchingSymbols instead */
    searchContracts: (pattern: string) => Promise<ContractDescription[]>;
    /** userInfo event handler. */
    private readonly onUserInfo;
    /**
     * Get the user info of the logged user.
     */
    getUserInfo(): Promise<string>;
}
