"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TickType = void 0;
/**
 * Market data tick types added by [[IBApiNext]].
 */
var TickType;
(function (TickType) {
    TickType[TickType["API_NEXT_FIRST_TICK_ID"] = 10000] = "API_NEXT_FIRST_TICK_ID";
    TickType[TickType["OPTION_PV_DIVIDEND"] = 10001] = "OPTION_PV_DIVIDEND";
    TickType[TickType["OPTION_UNDERLYING"] = 10002] = "OPTION_UNDERLYING";
    TickType[TickType["BID_OPTION_IV"] = 10003] = "BID_OPTION_IV";
    TickType[TickType["BID_OPTION_PRICE"] = 10004] = "BID_OPTION_PRICE";
    TickType[TickType["BID_OPTION_DELTA"] = 10005] = "BID_OPTION_DELTA";
    TickType[TickType["BID_OPTION_GAMMA"] = 10006] = "BID_OPTION_GAMMA";
    TickType[TickType["BID_OPTION_VEGA"] = 10007] = "BID_OPTION_VEGA";
    TickType[TickType["BID_OPTION_THETA"] = 10008] = "BID_OPTION_THETA";
    TickType[TickType["DELAYED_BID_OPTION_IV"] = 10009] = "DELAYED_BID_OPTION_IV";
    TickType[TickType["DELAYED_BID_OPTION_PRICE"] = 10010] = "DELAYED_BID_OPTION_PRICE";
    TickType[TickType["DELAYED_BID_OPTION_DELTA"] = 10011] = "DELAYED_BID_OPTION_DELTA";
    TickType[TickType["DELAYED_BID_OPTION_GAMMA"] = 10012] = "DELAYED_BID_OPTION_GAMMA";
    TickType[TickType["DELAYED_BID_OPTION_VEGA"] = 10013] = "DELAYED_BID_OPTION_VEGA";
    TickType[TickType["DELAYED_BID_OPTION_THETA"] = 10014] = "DELAYED_BID_OPTION_THETA";
    TickType[TickType["ASK_OPTION_IV"] = 10015] = "ASK_OPTION_IV";
    TickType[TickType["ASK_OPTION_PRICE"] = 10016] = "ASK_OPTION_PRICE";
    TickType[TickType["ASK_OPTION_DELTA"] = 10017] = "ASK_OPTION_DELTA";
    TickType[TickType["ASK_OPTION_GAMMA"] = 10018] = "ASK_OPTION_GAMMA";
    TickType[TickType["ASK_OPTION_VEGA"] = 10019] = "ASK_OPTION_VEGA";
    TickType[TickType["ASK_OPTION_THETA"] = 10020] = "ASK_OPTION_THETA";
    TickType[TickType["DELAYED_ASK_OPTION_IV"] = 10021] = "DELAYED_ASK_OPTION_IV";
    TickType[TickType["DELAYED_ASK_OPTION_PRICE"] = 10022] = "DELAYED_ASK_OPTION_PRICE";
    TickType[TickType["DELAYED_ASK_OPTION_DELTA"] = 10023] = "DELAYED_ASK_OPTION_DELTA";
    TickType[TickType["DELAYED_ASK_OPTION_GAMMA"] = 10024] = "DELAYED_ASK_OPTION_GAMMA";
    TickType[TickType["DELAYED_ASK_OPTION_VEGA"] = 10025] = "DELAYED_ASK_OPTION_VEGA";
    TickType[TickType["DELAYED_ASK_OPTION_THETA"] = 10026] = "DELAYED_ASK_OPTION_THETA";
    TickType[TickType["LAST_OPTION_IV"] = 10027] = "LAST_OPTION_IV";
    TickType[TickType["LAST_OPTION_PRICE"] = 10028] = "LAST_OPTION_PRICE";
    TickType[TickType["LAST_OPTION_DELTA"] = 10029] = "LAST_OPTION_DELTA";
    TickType[TickType["LAST_OPTION_GAMMA"] = 10030] = "LAST_OPTION_GAMMA";
    TickType[TickType["LAST_OPTION_VEGA"] = 10031] = "LAST_OPTION_VEGA";
    TickType[TickType["LAST_OPTION_THETA"] = 10032] = "LAST_OPTION_THETA";
    TickType[TickType["DELAYED_LAST_OPTION_IV"] = 10033] = "DELAYED_LAST_OPTION_IV";
    TickType[TickType["DELAYED_LAST_OPTION_PRICE"] = 10034] = "DELAYED_LAST_OPTION_PRICE";
    TickType[TickType["DELAYED_LAST_OPTION_DELTA"] = 10035] = "DELAYED_LAST_OPTION_DELTA";
    TickType[TickType["DELAYED_LAST_OPTION_GAMMA"] = 10036] = "DELAYED_LAST_OPTION_GAMMA";
    TickType[TickType["DELAYED_LAST_OPTION_VEGA"] = 10037] = "DELAYED_LAST_OPTION_VEGA";
    TickType[TickType["DELAYED_LAST_OPTION_THETA"] = 10038] = "DELAYED_LAST_OPTION_THETA";
    TickType[TickType["MODEL_OPTION_IV"] = 10039] = "MODEL_OPTION_IV";
    TickType[TickType["MODEL_OPTION_PRICE"] = 10040] = "MODEL_OPTION_PRICE";
    TickType[TickType["MODEL_OPTION_DELTA"] = 10041] = "MODEL_OPTION_DELTA";
    TickType[TickType["MODEL_OPTION_GAMMA"] = 10042] = "MODEL_OPTION_GAMMA";
    TickType[TickType["MODEL_OPTION_VEGA"] = 10043] = "MODEL_OPTION_VEGA";
    TickType[TickType["MODEL_OPTION_THETA"] = 10044] = "MODEL_OPTION_THETA";
    TickType[TickType["DELAYED_MODEL_OPTION_IV"] = 10045] = "DELAYED_MODEL_OPTION_IV";
    TickType[TickType["DELAYED_MODEL_OPTION_PRICE"] = 10046] = "DELAYED_MODEL_OPTION_PRICE";
    TickType[TickType["DELAYED_MODEL_OPTION_DELTA"] = 10047] = "DELAYED_MODEL_OPTION_DELTA";
    TickType[TickType["DELAYED_MODEL_OPTION_GAMMA"] = 10048] = "DELAYED_MODEL_OPTION_GAMMA";
    TickType[TickType["DELAYED_MODEL_OPTION_VEGA"] = 10049] = "DELAYED_MODEL_OPTION_VEGA";
    TickType[TickType["DELAYED_MODEL_OPTION_THETA"] = 10050] = "DELAYED_MODEL_OPTION_THETA";
})(TickType || (exports.TickType = TickType = {}));
//# sourceMappingURL=tick-type.js.map