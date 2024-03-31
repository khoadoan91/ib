"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This App will print historical bid / ask price Time&Sales data of and instrument.
 */
const rxjs_1 = require("rxjs");
const ib_api_next_app_1 = require("./common/ib-api-next-app");
/////////////////////////////////////////////////////////////////////////////////
// The help text                                                               //
/////////////////////////////////////////////////////////////////////////////////
const DESCRIPTION_TEXT = "Print historical bid / ask price Time&Sales data of and instrument.";
const USAGE_TEXT = "Usage: historical-ticks-mid.js <options>";
const OPTION_ARGUMENTS = [
    [
        "conid=<number>",
        "(required) Contract ID (conId) of contract to receive historical bid / ask price Time&Sales data for.",
    ],
    ["exchange=<name>", "The destination exchange name."],
    [
        "start=<dateTimeString>",
        "(required if -end not specified) The start date/time of the request. '20170701 12:01:00'. Uses TWS timezone specified at login.",
    ],
    [
        "end=<dateTimeString>",
        "(required if -start not specified) The end date/time of the request. '20170701 13:01:00'. In TWS timezone.",
    ],
    [
        "count=<number>",
        "(required) Number of distinct data points. Max 1000 per request.",
    ],
    [
        "rth=<0/1>",
        "(optional) Data from regular trading hours (1), or all available hours (0). Default is 1",
    ],
];
const EXAMPLE_TEXT = "historical-ticks-mid.js -conid=3691937 -exchange=SMART -start=20210604 16:00:00 -count=100";
//////////////////////////////////////////////////////////////////////////////
// The App code                                                             //
//////////////////////////////////////////////////////////////////////////////
class PrintHistoricalTicksMidApp extends ib_api_next_app_1.IBApiNextApp {
    constructor() {
        super(DESCRIPTION_TEXT, USAGE_TEXT, OPTION_ARGUMENTS, EXAMPLE_TEXT);
    }
    /**
     * Start the app.
     */
    start() {
        super.start();
        if (!this.cmdLineArgs.conid) {
            this.error("-conid argument missing.");
        }
        if (!this.cmdLineArgs.exchange) {
            this.error("-exchange argument missing.");
        }
        if (!this.cmdLineArgs.start && !this.cmdLineArgs.end) {
            this.error("-start or -end argument missing.");
        }
        if (this.cmdLineArgs.start && this.cmdLineArgs.end) {
            this.error("-start and -end argument specified, only use one of both.");
        }
        if (!this.cmdLineArgs.count) {
            this.error("-count argument missing.");
        }
        // We use lastValueFrom here as we are not interested in getting
        // incremental updates.
        // If you do so (e.g. to show results incrementally as received from TWS),
        // use .subscribe({next: update => ...}) instead.
        (0, rxjs_1.lastValueFrom)(this.api.getHistoricalTicksBidAsk({
            conId: this.cmdLineArgs.conid,
            exchange: this.cmdLineArgs.exchange,
        }, this.cmdLineArgs.start, this.cmdLineArgs.end, this.cmdLineArgs.count, this.cmdLineArgs.rth ?? 1, false))
            .then((ticks) => {
            this.printObject(ticks);
            this.stop();
        })
            .catch((err) => {
            this.error(`getHistoricalTicksBidAsk failed with '${err.error.message}'`);
        });
    }
    /**
     * Stop the app with success code.
     */
    stop() {
        this.exit();
    }
}
// run the app
new PrintHistoricalTicksMidApp().start();
//# sourceMappingURL=historical-ticks-bid-ask.js.map