"use strict";
/**
 * This file implements tests for the [[IBApiNext.getHistoricalTicksMid]] function.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../../..");
describe("RxJS Wrapper: getHistoricalTicksMid()", () => {
    test("Error Event", (done) => {
        const apiNext = new __1.IBApiNext();
        const api = apiNext.api;
        // emit a error event and verify RxJS result
        const testValue = "We want this error";
        apiNext
            .getHistoricalTicksMid({}, "", "", 1, 1)
            // eslint-disable-next-line rxjs/no-ignored-subscription
            .subscribe({
            next: () => {
                fail();
            },
            error: (error) => {
                expect(error.error.message).toEqual(testValue);
                done();
            },
        });
        api.emit(__1.EventName.error, new Error(testValue), -1, 1);
    });
    test("Incremental collection and complete event", (done) => {
        const apiNext = new __1.IBApiNext();
        const api = apiNext.api;
        // emit historicalTicks events and verify all subscribers receive it
        const firstTick = {
            time: 12345,
            price: 101,
            size: 102,
        };
        const secondTick = {
            time: 12346,
            price: 201,
            size: 202,
        };
        apiNext
            .getHistoricalTicksMid({}, "", "", 1, 1)
            // eslint-disable-next-line rxjs/no-ignored-subscription
            .subscribe({
            next: (ticks) => {
                if (!ticks || !ticks.length || ticks.length > 2) {
                    fail();
                }
                if (ticks.length >= 1) {
                    expect(ticks[0].time).toEqual(firstTick.time);
                    expect(ticks[0].price).toEqual(firstTick.price);
                    expect(ticks[0].size).toEqual(firstTick.size);
                }
                if (ticks.length == 2) {
                    expect(ticks[1].time).toEqual(secondTick.time);
                    expect(ticks[1].price).toEqual(secondTick.price);
                    expect(ticks[1].size).toEqual(secondTick.size);
                }
            },
            complete: () => {
                done();
            },
            error: () => {
                fail();
            },
        });
        api.emit(__1.EventName.historicalTicks, 1, [firstTick], false);
        api.emit(__1.EventName.historicalTicks, 1, [secondTick], true);
    });
});
//# sourceMappingURL=get-historical-ticks-mid.test.js.map