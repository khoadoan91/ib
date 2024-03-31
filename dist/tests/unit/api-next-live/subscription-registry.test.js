"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../../..");
describe("Subscription registry Tests", () => {
    jest.setTimeout(20000);
    const clientId = Math.floor(Math.random() * 32766) + 1; // ensure unique client
    let subscription$;
    let api;
    let error$;
    beforeEach(() => {
        api = new __1.IBApiNext();
        if (!error$) {
            error$ = api.errorSubject.subscribe((error) => {
                if (error.reqId === -1) {
                    console.warn(`${error.error.message} (Error #${error.code})`);
                }
                else {
                    console.error(`${error.error.message} (Error #${error.code}) ${error.advancedOrderReject ? error.advancedOrderReject : ""}`);
                }
            });
        }
        try {
            api.connect(clientId);
        }
        catch (error) {
            console.error(error.message);
        }
    });
    afterEach(() => {
        if (api) {
            api.disconnect();
            api = undefined;
        }
    });
    it("Twice the same event callback bug", (done) => {
        // Two active subscriptions for the same Event #193
        done("Please fix issue #193");
        return;
        subscription$ = api.getOpenOrders().subscribe({
            next: (data) => {
                console.log(data);
            },
            complete: () => {
                console.log("getOpenOrders completed.");
                done();
            },
            error: (err) => {
                console.error(`getOpenOrders failed with '${err.error.message}'`);
            },
        });
        api
            .getAllOpenOrders()
            .then((orders) => {
            console.log(orders);
            subscription$.unsubscribe();
        })
            .catch((err) => {
            console.error(`getAllOpenOrders failed with '${err}'`);
        });
        // awaitTimeout(15).then(() => {
        //   subscription$.unsubscribe();
        //   done();
        // });
    });
});
//# sourceMappingURL=subscription-registry.test.js.map