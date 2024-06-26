"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScanCode = exports.Instrument = exports.LocationCode = void 0;
var LocationCode;
(function (LocationCode) {
    LocationCode["BOND_US"] = "BOND.US";
    LocationCode["EFP"] = "EFP";
    //  FUT_ECBOT = "FUT.ECBOT",
    LocationCode["FUT_EU_BELFOX"] = "FUT.EU.BELFOX";
    //  FUT_EU_DTB = "FUT.EU.DTB",
    LocationCode["FUT_EU_FTA"] = "FUT.EU.FTA";
    LocationCode["FUT_EU_IDEM"] = "FUT.EU.IDEM";
    LocationCode["FUT_EU_LIFFE"] = "FUT.EU.LIFFE";
    LocationCode["FUT_EU_MEFFRV"] = "FUT.EU.MEFFRV";
    LocationCode["FUT_EU_MONEP"] = "FUT.EU.MONEP";
    LocationCode["FUT_EU"] = "FUT.EU";
    //  FUT_GLOBEX = "FUT.GLOBEX",
    LocationCode["FUT_HK_HKFE"] = "FUT.HK.HKFE";
    LocationCode["FUT_HK_JAPAN"] = "FUT.HK.JAPAN";
    LocationCode["FUT_HK_KSE"] = "FUT.HK.KSE";
    LocationCode["FUT_HK_NSE"] = "FUT.HK.NSE";
    LocationCode["FUT_HK_OSE_JPN"] = "FUT.HK.OSE.JPN";
    LocationCode["FUT_HK_SGX"] = "FUT.HK.SGX";
    LocationCode["FUT_HK_SNFE"] = "FUT.HK.SNFE";
    LocationCode["FUT_HK_TSE_JPN"] = "FUT.HK.TSE.JPN";
    LocationCode["FUT_HK"] = "FUT.HK";
    LocationCode["FUT_IPE"] = "FUT.IPE";
    LocationCode["FUT_NA_CDE"] = "FUT.NA.CDE";
    LocationCode["FUT_NA"] = "FUT.NA";
    LocationCode["FUT_NYBOT"] = "FUT.NYBOT";
    // FUT_NYMEX = "FUT.NYMEX",
    LocationCode["FUT_NYSELIFFE"] = "FUT.NYSELIFFE";
    LocationCode["FUT_US"] = "FUT.US";
    LocationCode["IND_EU_BELFOX"] = "IND.EU.BELFOX";
    // IND_EU_DTB = "IND.EU.DTB",
    LocationCode["IND_EU_FTA"] = "IND.EU.FTA";
    LocationCode["IND_EU_LIFFE"] = "IND.EU.LIFFE";
    LocationCode["IND_EU_MONEP"] = "IND.EU.MONEP";
    LocationCode["IND_EU"] = "IND.EU";
    LocationCode["IND_HK_HKFE"] = "IND.HK.HKFE";
    LocationCode["IND_HK_JAPAN"] = "IND.HK.JAPAN";
    LocationCode["IND_HK_KSE"] = "IND.HK.KSE";
    LocationCode["IND_HK_NSE"] = "IND.HK.NSE";
    LocationCode["IND_HK_OSE_JPN"] = "IND.HK.OSE.JPN";
    LocationCode["IND_HK_SGX"] = "IND.HK.SGX";
    LocationCode["IND_HK_SNFE"] = "IND.HK.SNFE";
    LocationCode["IND_HK_TSE_JPN"] = "IND.HK.TSE.JPN";
    LocationCode["IND_HK"] = "IND.HK";
    LocationCode["IND_US"] = "IND.US";
    LocationCode["SLB_AQS"] = "SLB.AQS";
    LocationCode["STK_AMEX"] = "STK.AMEX";
    LocationCode["STK_ARCA"] = "STK.ARCA";
    LocationCode["STK_EU_AEB"] = "STK.EU.AEB";
    LocationCode["STK_EU_BM"] = "STK.EU.BM";
    LocationCode["STK_EU_BVME"] = "STK.EU.BVME";
    LocationCode["STK_EU_EBS"] = "STK.EU.EBS";
    LocationCode["STK_EU_IBIS"] = "STK.EU.IBIS";
    LocationCode["STK_EU_IBIS_ETF"] = "STK.EU.IBIS-ETF";
    LocationCode["STK_EU_IBIS_EUSTARS"] = "STK.EU.IBIS-EUSTARS";
    LocationCode["STK_EU_IBIS_NEWX"] = "STK.EU.IBIS-NEWX";
    LocationCode["STK_EU_IBIS_USSTARS"] = "STK.EU.IBIS-USSTARS";
    LocationCode["STK_EU_IBIS_XETRA"] = "STK.EU.IBIS-XETRA";
    LocationCode["STK_EU_LSE"] = "STK.EU.LSE";
    LocationCode["STK_EU_SBF"] = "STK.EU.SBF";
    LocationCode["STK_EU_SBVM"] = "STK.EU.SBVM";
    LocationCode["STK_EU_SFB"] = "STK.EU.SFB";
    LocationCode["STK_EU_SWISS"] = "STK.EU.SWISS";
    LocationCode["STK_EU_VIRTX"] = "STK.EU.VIRTX";
    LocationCode["STK_EU"] = "STK.EU";
    LocationCode["STK_HK_ASX"] = "STK.HK.ASX";
    LocationCode["STK_HK_NSE"] = "STK.HK.NSE";
    LocationCode["STK_HK_SEHK"] = "STK.HK.SEHK";
    LocationCode["STK_HK_SGX"] = "STK.HK.SGX";
    LocationCode["STK_HK_TSE_JPN"] = "STK.HK.TSE.JPN";
    LocationCode["STK_HK"] = "STK.HK";
    LocationCode["STK_NA_CANADA"] = "STK.NA.CANADA";
    LocationCode["STK_NA_TSE"] = "STK.NA.TSE";
    LocationCode["STK_NA_VENTURE"] = "STK.NA.VENTURE";
    LocationCode["STK_NA"] = "STK.NA";
    LocationCode["STK_NASDAQ_NMS"] = "STK.NASDAQ.NMS";
    LocationCode["STK_NASDAQ_SCM"] = "STK.NASDAQ.SCM";
    LocationCode["STK_NASDAQ"] = "STK.NASDAQ";
    LocationCode["STK_NYSE"] = "STK.NYSE";
    LocationCode["STK_OTCBB"] = "STK.OTCBB";
    LocationCode["STK_PINK"] = "STK.PINK";
    LocationCode["STK_US_MAJOR"] = "STK.US.MAJOR";
    LocationCode["STK_US_MINOR"] = "STK.US.MINOR";
    LocationCode["STK_US"] = "STK.US";
    LocationCode["WAR_EU_ALL"] = "WAR.EU.ALL";
})(LocationCode || (exports.LocationCode = LocationCode = {}));
var Instrument;
(function (Instrument) {
    Instrument["STK"] = "STK";
    Instrument["BOND"] = "BOND";
    Instrument["EFP"] = "EFP";
    Instrument["FUT_EU"] = "FUT.EU";
    Instrument["FUT_HK"] = "FUT.HK";
    Instrument["FUT_NA"] = "FUT.NA";
    Instrument["FUT_US"] = "FUT.US";
    Instrument["IND_EU"] = "IND.EU";
    Instrument["IND_HK"] = "IND.HK";
    Instrument["IND_US"] = "IND.US";
    Instrument["PMONITOR"] = "PMONITOR";
    Instrument["PMONITORM"] = "PMONITORM";
    Instrument["SLB_US"] = "SLB.US";
    Instrument["STOCK_EU"] = "STOCK.EU";
    Instrument["STOCK_HK"] = "STOCK.HK";
    Instrument["STOCK_NA"] = "STOCK.NA";
    Instrument["WAR_EU"] = "WAR.EU";
})(Instrument || (exports.Instrument = Instrument = {}));
var ScanCode;
(function (ScanCode) {
    ScanCode[ScanCode["TOP_PERC_GAIN"] = 0] = "TOP_PERC_GAIN";
    ScanCode[ScanCode["TOP_PERC_LOSE"] = 1] = "TOP_PERC_LOSE";
    ScanCode[ScanCode["MOST_ACTIVE"] = 2] = "MOST_ACTIVE";
    ScanCode[ScanCode["ALL_SYMBOLS_ASC"] = 3] = "ALL_SYMBOLS_ASC";
    ScanCode[ScanCode["ALL_SYMBOLS_DESC"] = 4] = "ALL_SYMBOLS_DESC";
    ScanCode[ScanCode["BOND_CUSIP_AZ"] = 5] = "BOND_CUSIP_AZ";
    ScanCode[ScanCode["BOND_CUSIP_ZA"] = 6] = "BOND_CUSIP_ZA";
    ScanCode[ScanCode["FAR_MATURITY_DATE"] = 7] = "FAR_MATURITY_DATE";
    ScanCode[ScanCode["HALTED"] = 8] = "HALTED";
    ScanCode[ScanCode["HIGH_BOND_ASK_CURRENT_YIELD_ALL"] = 9] = "HIGH_BOND_ASK_CURRENT_YIELD_ALL";
    ScanCode[ScanCode["HIGH_BOND_ASK_YIELD_ALL"] = 10] = "HIGH_BOND_ASK_YIELD_ALL";
    ScanCode[ScanCode["HIGH_BOND_DEBT_2_BOOK_RATIO"] = 11] = "HIGH_BOND_DEBT_2_BOOK_RATIO";
    ScanCode[ScanCode["HIGH_BOND_DEBT_2_EQUITY_RATIO"] = 12] = "HIGH_BOND_DEBT_2_EQUITY_RATIO";
    ScanCode[ScanCode["HIGH_BOND_DEBT_2_TAN_BOOK_RATIO"] = 13] = "HIGH_BOND_DEBT_2_TAN_BOOK_RATIO";
    ScanCode[ScanCode["HIGH_BOND_EQUITY_2_BOOK_RATIO"] = 14] = "HIGH_BOND_EQUITY_2_BOOK_RATIO";
    ScanCode[ScanCode["HIGH_BOND_EQUITY_2_TAN_BOOK_RATIO"] = 15] = "HIGH_BOND_EQUITY_2_TAN_BOOK_RATIO";
    ScanCode[ScanCode["HIGH_BOND_NET_ASK_CURRENT_YIELD_ALL"] = 16] = "HIGH_BOND_NET_ASK_CURRENT_YIELD_ALL";
    ScanCode[ScanCode["HIGH_BOND_NET_ASK_YIELD_ALL"] = 17] = "HIGH_BOND_NET_ASK_YIELD_ALL";
    ScanCode[ScanCode["HIGH_BOND_NET_SPREAD_ALL"] = 18] = "HIGH_BOND_NET_SPREAD_ALL";
    ScanCode[ScanCode["HIGH_BOND_SPREAD_ALL"] = 19] = "HIGH_BOND_SPREAD_ALL";
    ScanCode[ScanCode["HIGH_COUPON_RATE"] = 20] = "HIGH_COUPON_RATE";
    ScanCode[ScanCode["HIGH_DIVIDEND_YIELD"] = 21] = "HIGH_DIVIDEND_YIELD";
    ScanCode[ScanCode["HIGH_DIVIDEND_YIELD_IB"] = 22] = "HIGH_DIVIDEND_YIELD_IB";
    ScanCode[ScanCode["HIGHEST_SLB_BID"] = 23] = "HIGHEST_SLB_BID";
    ScanCode[ScanCode["HIGH_GROWTH_RATE"] = 24] = "HIGH_GROWTH_RATE";
    ScanCode[ScanCode["HIGH_MOODY_RATING_ALL"] = 25] = "HIGH_MOODY_RATING_ALL";
    ScanCode[ScanCode["HIGH_OPEN_GAP"] = 26] = "HIGH_OPEN_GAP";
    ScanCode[ScanCode["HIGH_OPT_IMP_VOLAT"] = 27] = "HIGH_OPT_IMP_VOLAT";
    ScanCode[ScanCode["HIGH_OPT_IMP_VOLAT_OVER_HIST"] = 28] = "HIGH_OPT_IMP_VOLAT_OVER_HIST";
    ScanCode[ScanCode["HIGH_OPT_OPEN_INTEREST_PUT_CALL_RATIO"] = 29] = "HIGH_OPT_OPEN_INTEREST_PUT_CALL_RATIO";
    ScanCode[ScanCode["HIGH_OPT_VOLUME_PUT_CALL_RATIO"] = 30] = "HIGH_OPT_VOLUME_PUT_CALL_RATIO";
    ScanCode[ScanCode["HIGH_PE_RATIO"] = 31] = "HIGH_PE_RATIO";
    ScanCode[ScanCode["HIGH_PRICE_2_BOOK_RATIO"] = 32] = "HIGH_PRICE_2_BOOK_RATIO";
    ScanCode[ScanCode["HIGH_PRICE_2_TAN_BOOK_RATIO"] = 33] = "HIGH_PRICE_2_TAN_BOOK_RATIO";
    ScanCode[ScanCode["HIGH_QUICK_RATIO"] = 34] = "HIGH_QUICK_RATIO";
    ScanCode[ScanCode["HIGH_RETURN_ON_EQUITY"] = 35] = "HIGH_RETURN_ON_EQUITY";
    ScanCode[ScanCode["HIGH_SYNTH_BID_REV_NAT_YIELD"] = 36] = "HIGH_SYNTH_BID_REV_NAT_YIELD";
    ScanCode[ScanCode["HIGH_VS_13W_HL"] = 37] = "HIGH_VS_13W_HL";
    ScanCode[ScanCode["HIGH_VS_26W_HL"] = 38] = "HIGH_VS_26W_HL";
    ScanCode[ScanCode["HIGH_VS_52W_HL"] = 39] = "HIGH_VS_52W_HL";
    ScanCode[ScanCode["HOT_BY_OPT_VOLUME"] = 40] = "HOT_BY_OPT_VOLUME";
    ScanCode[ScanCode["HOT_BY_PRICE"] = 41] = "HOT_BY_PRICE";
    ScanCode[ScanCode["HOT_BY_PRICE_RANGE"] = 42] = "HOT_BY_PRICE_RANGE";
    ScanCode[ScanCode["HOT_BY_VOLUME"] = 43] = "HOT_BY_VOLUME";
    ScanCode[ScanCode["LIMIT_UP_DOWN"] = 44] = "LIMIT_UP_DOWN";
    ScanCode[ScanCode["LOW_BOND_BID_CURRENT_YIELD_ALL"] = 45] = "LOW_BOND_BID_CURRENT_YIELD_ALL";
    ScanCode[ScanCode["LOW_BOND_BID_YIELD_ALL"] = 46] = "LOW_BOND_BID_YIELD_ALL";
    ScanCode[ScanCode["LOW_BOND_DEBT_2_BOOK_RATIO"] = 47] = "LOW_BOND_DEBT_2_BOOK_RATIO";
    ScanCode[ScanCode["LOW_BOND_DEBT_2_EQUITY_RATIO"] = 48] = "LOW_BOND_DEBT_2_EQUITY_RATIO";
    ScanCode[ScanCode["LOW_BOND_DEBT_2_TAN_BOOK_RATIO"] = 49] = "LOW_BOND_DEBT_2_TAN_BOOK_RATIO";
    ScanCode[ScanCode["LOW_BOND_EQUITY_2_BOOK_RATIO"] = 50] = "LOW_BOND_EQUITY_2_BOOK_RATIO";
    ScanCode[ScanCode["LOW_BOND_EQUITY_2_TAN_BOOK_RATIO"] = 51] = "LOW_BOND_EQUITY_2_TAN_BOOK_RATIO";
    ScanCode[ScanCode["LOW_BOND_NET_BID_CURRENT_YIELD_ALL"] = 52] = "LOW_BOND_NET_BID_CURRENT_YIELD_ALL";
    ScanCode[ScanCode["LOW_BOND_NET_BID_YIELD_ALL"] = 53] = "LOW_BOND_NET_BID_YIELD_ALL";
    ScanCode[ScanCode["LOW_BOND_NET_SPREAD_ALL"] = 54] = "LOW_BOND_NET_SPREAD_ALL";
    ScanCode[ScanCode["LOW_BOND_SPREAD_ALL"] = 55] = "LOW_BOND_SPREAD_ALL";
    ScanCode[ScanCode["LOW_COUPON_RATE"] = 56] = "LOW_COUPON_RATE";
    ScanCode[ScanCode["LOWEST_SLB_ASK"] = 57] = "LOWEST_SLB_ASK";
    ScanCode[ScanCode["LOW_GROWTH_RATE"] = 58] = "LOW_GROWTH_RATE";
    ScanCode[ScanCode["LOW_MOODY_RATING_ALL"] = 59] = "LOW_MOODY_RATING_ALL";
    ScanCode[ScanCode["LOW_OPEN_GAP"] = 60] = "LOW_OPEN_GAP";
    ScanCode[ScanCode["LOW_OPT_IMP_VOLAT"] = 61] = "LOW_OPT_IMP_VOLAT";
    ScanCode[ScanCode["LOW_OPT_IMP_VOLAT_OVER_HIST"] = 62] = "LOW_OPT_IMP_VOLAT_OVER_HIST";
    ScanCode[ScanCode["LOW_OPT_OPEN_INTEREST_PUT_CALL_RATIO"] = 63] = "LOW_OPT_OPEN_INTEREST_PUT_CALL_RATIO";
    ScanCode[ScanCode["LOW_OPT_VOLUME_PUT_CALL_RATIO"] = 64] = "LOW_OPT_VOLUME_PUT_CALL_RATIO";
    ScanCode[ScanCode["LOW_PE_RATIO"] = 65] = "LOW_PE_RATIO";
    ScanCode[ScanCode["LOW_PRICE_2_BOOK_RATIO"] = 66] = "LOW_PRICE_2_BOOK_RATIO";
    ScanCode[ScanCode["LOW_PRICE_2_TAN_BOOK_RATIO"] = 67] = "LOW_PRICE_2_TAN_BOOK_RATIO";
    ScanCode[ScanCode["LOW_QUICK_RATIO"] = 68] = "LOW_QUICK_RATIO";
    ScanCode[ScanCode["LOW_RETURN_ON_EQUITY"] = 69] = "LOW_RETURN_ON_EQUITY";
    ScanCode[ScanCode["LOW_SYNTH_ASK_REV_NAT_YIELD"] = 70] = "LOW_SYNTH_ASK_REV_NAT_YIELD";
    ScanCode[ScanCode["LOW_VS_13W_HL"] = 71] = "LOW_VS_13W_HL";
    ScanCode[ScanCode["LOW_VS_26W_HL"] = 72] = "LOW_VS_26W_HL";
    ScanCode[ScanCode["LOW_VS_52W_HL"] = 73] = "LOW_VS_52W_HL";
    ScanCode[ScanCode["LOW_WAR_REL_IMP_VOLAT"] = 74] = "LOW_WAR_REL_IMP_VOLAT";
    ScanCode[ScanCode["MARKET_CAP_USD_ASC"] = 75] = "MARKET_CAP_USD_ASC";
    ScanCode[ScanCode["MARKET_CAP_USD_DESC"] = 76] = "MARKET_CAP_USD_DESC";
    ScanCode[ScanCode["MOST_ACTIVE_AVG_USD"] = 77] = "MOST_ACTIVE_AVG_USD";
    ScanCode[ScanCode["MOST_ACTIVE_USD"] = 78] = "MOST_ACTIVE_USD";
    ScanCode[ScanCode["NEAR_MATURITY_DATE"] = 79] = "NEAR_MATURITY_DATE";
    ScanCode[ScanCode["NOT_OPEN"] = 80] = "NOT_OPEN";
    ScanCode[ScanCode["OPT_OPEN_INTEREST_MOST_ACTIVE"] = 81] = "OPT_OPEN_INTEREST_MOST_ACTIVE";
    ScanCode[ScanCode["OPT_VOLUME_MOST_ACTIVE"] = 82] = "OPT_VOLUME_MOST_ACTIVE";
    ScanCode[ScanCode["PMONITOR_AVAIL_CONTRACTS"] = 83] = "PMONITOR_AVAIL_CONTRACTS";
    ScanCode[ScanCode["PMONITOR_CTT"] = 84] = "PMONITOR_CTT";
    ScanCode[ScanCode["PMONITOR_IBOND"] = 85] = "PMONITOR_IBOND";
    ScanCode[ScanCode["PMONITOR_RFQ"] = 86] = "PMONITOR_RFQ";
    ScanCode[ScanCode["TOP_OPEN_PERC_GAIN"] = 87] = "TOP_OPEN_PERC_GAIN";
    ScanCode[ScanCode["TOP_OPEN_PERC_LOSE"] = 88] = "TOP_OPEN_PERC_LOSE";
    ScanCode[ScanCode["TOP_OPT_IMP_VOLAT_GAIN"] = 89] = "TOP_OPT_IMP_VOLAT_GAIN";
    ScanCode[ScanCode["TOP_OPT_IMP_VOLAT_LOSE"] = 90] = "TOP_OPT_IMP_VOLAT_LOSE";
    ScanCode[ScanCode["TOP_PRICE_RANGE"] = 91] = "TOP_PRICE_RANGE";
    ScanCode[ScanCode["TOP_STOCK_BUY_IMBALANCE_ADV_RATIO"] = 92] = "TOP_STOCK_BUY_IMBALANCE_ADV_RATIO";
    ScanCode[ScanCode["TOP_STOCK_SELL_IMBALANCE_ADV_RATIO"] = 93] = "TOP_STOCK_SELL_IMBALANCE_ADV_RATIO";
    ScanCode[ScanCode["TOP_TRADE_COUNT"] = 94] = "TOP_TRADE_COUNT";
    ScanCode[ScanCode["TOP_TRADE_RATE"] = 95] = "TOP_TRADE_RATE";
    ScanCode[ScanCode["TOP_VOLUME_RATE"] = 96] = "TOP_VOLUME_RATE";
    ScanCode[ScanCode["WSH_NEXT_ANALYST_MEETING"] = 97] = "WSH_NEXT_ANALYST_MEETING";
    ScanCode[ScanCode["WSH_NEXT_EARNINGS"] = 98] = "WSH_NEXT_EARNINGS";
    ScanCode[ScanCode["WSH_NEXT_EVENT"] = 99] = "WSH_NEXT_EVENT";
    ScanCode[ScanCode["WSH_NEXT_MAJOR_EVENT"] = 100] = "WSH_NEXT_MAJOR_EVENT";
    ScanCode[ScanCode["WSH_PREV_ANALYST_MEETING"] = 101] = "WSH_PREV_ANALYST_MEETING";
    ScanCode[ScanCode["WSH_PREV_EARNINGS"] = 102] = "WSH_PREV_EARNINGS";
    ScanCode[ScanCode["WSH_PREV_EVENT"] = 103] = "WSH_PREV_EVENT";
})(ScanCode || (exports.ScanCode = ScanCode = {}));
//# sourceMappingURL=market-scanner.js.map