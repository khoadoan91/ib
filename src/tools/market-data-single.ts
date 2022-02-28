/**
 * This App will print real time market data of a given contract id.
 */

import path from "path";
import { Subscription } from "rxjs";

import { SecType } from "../";
import { IBApiNextError, IBApiNextTickType, IBApiTickType, MarketDataType } from "../api-next";
import logger from "../common/logger";
import { IBApiNextApp } from "./common/ib-api-next-app";

/////////////////////////////////////////////////////////////////////////////////
// The help text                                                               //
/////////////////////////////////////////////////////////////////////////////////

const DESCRIPTION_TEXT = "Print real time market data of a given contract id.";
const USAGE_TEXT = "Usage: market-data.js <options>";
const OPTION_ARGUMENTS: [string, string][] = [
    ["conid=<number>", "Contract ID (conId) of the contract."],
    ["symbol=<name>", "The symbol name."],
    [
        "sectype=<type>",
        "The security type. Valid values: STK, OPT, FUT, IND, FOP, CFD, CASH, BAG, BOND, CMDTY, NEWS and FUND",
    ],
    ["exchange=<name>", "The destination exchange name."],
    ["currency=<currency>", "The contract currency."],
];
const EXAMPLE_TEXT =
    "market-data-single.js -symbol=AAPL -conid=265598 -sectype=STK -exchange=SMART";

//////////////////////////////////////////////////////////////////////////////
// The App code                                                             //
//////////////////////////////////////////////////////////////////////////////

class PrintMarketDataSingleApp extends IBApiNextApp {
    constructor() {
        super(DESCRIPTION_TEXT, USAGE_TEXT, OPTION_ARGUMENTS, EXAMPLE_TEXT);
    }

    /** The [[Subscription]] on the PnLSingle. */
    private subscription$: Subscription;

    /**
     * Start the the app.
     */
    start(): void {
        const scriptName = path.basename(__filename);
        logger.debug(`Starting ${scriptName} script`);
        this.connect(this.cmdLineArgs.watch ? 10000 : 0);
        this.api.setMarketDataType(MarketDataType.FROZEN);
        this.api
            .getMarketDataSingle(
                {
                    conId: this.cmdLineArgs.conid as number ?? undefined,
                    symbol: this.cmdLineArgs.symbol as string,
                    secType: this.cmdLineArgs.sectype as SecType,
                    exchange: this.cmdLineArgs.exchange as string,
                    currency: this.cmdLineArgs.currency as string,
                },
                "",
                true,
                false
            )
            .then((marketData) => {
                // this.printObject(marketData);
                const dataWithTickNames = new Map<string, number>();
                marketData.forEach((tick, type) => {
                    if (type > IBApiNextTickType.API_NEXT_FIRST_TICK_ID) {
                        dataWithTickNames.set(
                            IBApiNextTickType[type],
                            tick.value
                        );
                    } else {
                        dataWithTickNames.set(
                            IBApiTickType[type],
                            tick.value
                        );
                    }
                });
                this.printObject(dataWithTickNames);
                this.stop();
            })
            .catch((err: IBApiNextError) => {
                this.error(`getMarketDataSingle failed with '${err.error.message}'`);
            });
    }

    /**
     * Stop the the app with success code.
     */
    stop() {
        this.subscription$?.unsubscribe();
        this.exit();
    }
}

// run the app

new PrintMarketDataSingleApp().start();