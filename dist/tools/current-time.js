"use strict";
/**
 * This App will print current TWS time to console.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const ib_api_next_app_1 = require("./common/ib-api-next-app");
/////////////////////////////////////////////////////////////////////////////////
// Help text and command line parsing                                          //
/////////////////////////////////////////////////////////////////////////////////
const DESCRIPTION_TEXT = "Prints the current TWS time.";
const USAGE_TEXT = "Usage: current-time.js <options>";
const OPTION_ARGUMENTS = [];
const EXAMPLE_TEXT = "current-time.js -host=localhost -port=4001";
//////////////////////////////////////////////////////////////////////////////
// The App code                                                             //
//////////////////////////////////////////////////////////////////////////////
class PrintCurrentTimeApp extends ib_api_next_app_1.IBApiNextApp {
    constructor() {
        super(DESCRIPTION_TEXT, USAGE_TEXT, OPTION_ARGUMENTS, EXAMPLE_TEXT);
    }
    /**
     * Start the app.
     */
    start() {
        super.start();
        // print current time
        this.api
            .getCurrentTime()
            .then((time) => {
            const dateTime = new Date(time * 1000); // IB count in seconds since 1970, not ms.
            this.printText(`${dateTime.toLocaleTimeString()}`);
            this.exit();
        })
            .catch((err) => {
            this.error(`getCurrentTime failed with '${err.error.message}'`);
        });
    }
}
// run the app
new PrintCurrentTimeApp().start();
//# sourceMappingURL=current-time.js.map