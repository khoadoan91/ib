"use strict";
/**
 * This App will print historical chart data of a contract.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const what_to_show_1 = require("../api/historical/what-to-show");
const ib_api_next_app_1 = require("./common/ib-api-next-app");
/////////////////////////////////////////////////////////////////////////////////
// The help text                                                               //
/////////////////////////////////////////////////////////////////////////////////
const DESCRIPTION_TEXT = "Print historical chart data of a contract.";
const USAGE_TEXT = "Usage: historical-data.js <options>";
const OPTION_ARGUMENTS = [
    [
        "conid=<number>",
        "(required) Contract ID (conId) of contract to receive historical chart data for.",
    ],
    ["exchange=<name>", "The destination exchange name."],
    [
        "duration=<durationString>",
        "(required) The amount of time to go back from the request's given end date and time.",
    ],
    ["barSize=<durationString>", "(required) The data granularity."],
    [
        "endTime=<dateTimeString>",
        "(optional) Request's ending time with format yyyyMMdd HH:mm:ss {TMZ}. Today/now will be used if not specified.",
    ],
];
const EXAMPLE_TEXT = "historical-data.js -conid=3691937 -exchange=SMART -duration=3 M -barSize=1 day";
//////////////////////////////////////////////////////////////////////////////
// The App code                                                             //
//////////////////////////////////////////////////////////////////////////////
class PrintPositionsApp extends ib_api_next_app_1.IBApiNextApp {
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
        if (!this.cmdLineArgs.duration) {
            this.error("-duration argument missing.");
        }
        if (!this.cmdLineArgs.barSize) {
            this.error("-barSize argument missing.");
        }
        let endTime = this.cmdLineArgs.endTime;
        if (!endTime) {
            const now = new Date();
            endTime = `${now.getFullYear()}${("0" + (now.getMonth() + 1)).slice(-2)}${("0" + now.getDate()).slice(-2)} ${("0" + now.getHours()).slice(-2)}:${("0" + now.getMinutes()).slice(-2)}:${("0" + now.getSeconds()).slice(-2)}`;
        }
        this.api
            .getHistoricalData({
            conId: this.cmdLineArgs.conid,
            exchange: this.cmdLineArgs.exchange,
        }, endTime, this.cmdLineArgs.duration, this.cmdLineArgs.barSize, what_to_show_1.WhatToShow.MIDPOINT, 0, 1)
            .then((bars) => {
            this.printObject(bars);
            this.exit();
        })
            .catch((err) => {
            this.error(`getHistoricalData failed with '${err.error.message}'`);
        });
    }
}
// run the app
new PrintPositionsApp().start();
//# sourceMappingURL=historical-data.js.map