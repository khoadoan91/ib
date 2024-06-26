export declare enum LocationCode {
    BOND_US = "BOND.US",
    EFP = "EFP",
    FUT_EU_BELFOX = "FUT.EU.BELFOX",
    FUT_EU_FTA = "FUT.EU.FTA",
    FUT_EU_IDEM = "FUT.EU.IDEM",
    FUT_EU_LIFFE = "FUT.EU.LIFFE",
    FUT_EU_MEFFRV = "FUT.EU.MEFFRV",
    FUT_EU_MONEP = "FUT.EU.MONEP",
    FUT_EU = "FUT.EU",
    FUT_HK_HKFE = "FUT.HK.HKFE",
    FUT_HK_JAPAN = "FUT.HK.JAPAN",
    FUT_HK_KSE = "FUT.HK.KSE",
    FUT_HK_NSE = "FUT.HK.NSE",
    FUT_HK_OSE_JPN = "FUT.HK.OSE.JPN",
    FUT_HK_SGX = "FUT.HK.SGX",
    FUT_HK_SNFE = "FUT.HK.SNFE",
    FUT_HK_TSE_JPN = "FUT.HK.TSE.JPN",
    FUT_HK = "FUT.HK",
    FUT_IPE = "FUT.IPE",
    FUT_NA_CDE = "FUT.NA.CDE",
    FUT_NA = "FUT.NA",
    FUT_NYBOT = "FUT.NYBOT",
    FUT_NYSELIFFE = "FUT.NYSELIFFE",
    FUT_US = "FUT.US",
    IND_EU_BELFOX = "IND.EU.BELFOX",
    IND_EU_FTA = "IND.EU.FTA",
    IND_EU_LIFFE = "IND.EU.LIFFE",
    IND_EU_MONEP = "IND.EU.MONEP",
    IND_EU = "IND.EU",
    IND_HK_HKFE = "IND.HK.HKFE",
    IND_HK_JAPAN = "IND.HK.JAPAN",
    IND_HK_KSE = "IND.HK.KSE",
    IND_HK_NSE = "IND.HK.NSE",
    IND_HK_OSE_JPN = "IND.HK.OSE.JPN",
    IND_HK_SGX = "IND.HK.SGX",
    IND_HK_SNFE = "IND.HK.SNFE",
    IND_HK_TSE_JPN = "IND.HK.TSE.JPN",
    IND_HK = "IND.HK",
    IND_US = "IND.US",
    SLB_AQS = "SLB.AQS",
    STK_AMEX = "STK.AMEX",
    STK_ARCA = "STK.ARCA",
    STK_EU_AEB = "STK.EU.AEB",
    STK_EU_BM = "STK.EU.BM",
    STK_EU_BVME = "STK.EU.BVME",
    STK_EU_EBS = "STK.EU.EBS",
    STK_EU_IBIS = "STK.EU.IBIS",
    STK_EU_IBIS_ETF = "STK.EU.IBIS-ETF",
    STK_EU_IBIS_EUSTARS = "STK.EU.IBIS-EUSTARS",
    STK_EU_IBIS_NEWX = "STK.EU.IBIS-NEWX",
    STK_EU_IBIS_USSTARS = "STK.EU.IBIS-USSTARS",
    STK_EU_IBIS_XETRA = "STK.EU.IBIS-XETRA",
    STK_EU_LSE = "STK.EU.LSE",
    STK_EU_SBF = "STK.EU.SBF",
    STK_EU_SBVM = "STK.EU.SBVM",
    STK_EU_SFB = "STK.EU.SFB",
    STK_EU_SWISS = "STK.EU.SWISS",
    STK_EU_VIRTX = "STK.EU.VIRTX",
    STK_EU = "STK.EU",
    STK_HK_ASX = "STK.HK.ASX",
    STK_HK_NSE = "STK.HK.NSE",
    STK_HK_SEHK = "STK.HK.SEHK",
    STK_HK_SGX = "STK.HK.SGX",
    STK_HK_TSE_JPN = "STK.HK.TSE.JPN",
    STK_HK = "STK.HK",
    STK_NA_CANADA = "STK.NA.CANADA",
    STK_NA_TSE = "STK.NA.TSE",
    STK_NA_VENTURE = "STK.NA.VENTURE",
    STK_NA = "STK.NA",
    STK_NASDAQ_NMS = "STK.NASDAQ.NMS",
    STK_NASDAQ_SCM = "STK.NASDAQ.SCM",
    STK_NASDAQ = "STK.NASDAQ",
    STK_NYSE = "STK.NYSE",
    STK_OTCBB = "STK.OTCBB",
    STK_PINK = "STK.PINK",
    STK_US_MAJOR = "STK.US.MAJOR",
    STK_US_MINOR = "STK.US.MINOR",
    STK_US = "STK.US",
    WAR_EU_ALL = "WAR.EU.ALL"
}
export declare enum Instrument {
    STK = "STK",
    BOND = "BOND",
    EFP = "EFP",
    FUT_EU = "FUT.EU",
    FUT_HK = "FUT.HK",
    FUT_NA = "FUT.NA",
    FUT_US = "FUT.US",
    IND_EU = "IND.EU",
    IND_HK = "IND.HK",
    IND_US = "IND.US",
    PMONITOR = "PMONITOR",
    PMONITORM = "PMONITORM",
    SLB_US = "SLB.US",
    STOCK_EU = "STOCK.EU",
    STOCK_HK = "STOCK.HK",
    STOCK_NA = "STOCK.NA",
    WAR_EU = "WAR.EU"
}
export declare enum ScanCode {
    TOP_PERC_GAIN = 0,
    TOP_PERC_LOSE = 1,
    MOST_ACTIVE = 2,
    ALL_SYMBOLS_ASC = 3,
    ALL_SYMBOLS_DESC = 4,
    BOND_CUSIP_AZ = 5,
    BOND_CUSIP_ZA = 6,
    FAR_MATURITY_DATE = 7,
    HALTED = 8,
    HIGH_BOND_ASK_CURRENT_YIELD_ALL = 9,
    HIGH_BOND_ASK_YIELD_ALL = 10,
    HIGH_BOND_DEBT_2_BOOK_RATIO = 11,
    HIGH_BOND_DEBT_2_EQUITY_RATIO = 12,
    HIGH_BOND_DEBT_2_TAN_BOOK_RATIO = 13,
    HIGH_BOND_EQUITY_2_BOOK_RATIO = 14,
    HIGH_BOND_EQUITY_2_TAN_BOOK_RATIO = 15,
    HIGH_BOND_NET_ASK_CURRENT_YIELD_ALL = 16,
    HIGH_BOND_NET_ASK_YIELD_ALL = 17,
    HIGH_BOND_NET_SPREAD_ALL = 18,
    HIGH_BOND_SPREAD_ALL = 19,
    HIGH_COUPON_RATE = 20,
    HIGH_DIVIDEND_YIELD = 21,
    HIGH_DIVIDEND_YIELD_IB = 22,
    HIGHEST_SLB_BID = 23,
    HIGH_GROWTH_RATE = 24,
    HIGH_MOODY_RATING_ALL = 25,
    HIGH_OPEN_GAP = 26,
    HIGH_OPT_IMP_VOLAT = 27,
    HIGH_OPT_IMP_VOLAT_OVER_HIST = 28,
    HIGH_OPT_OPEN_INTEREST_PUT_CALL_RATIO = 29,
    HIGH_OPT_VOLUME_PUT_CALL_RATIO = 30,
    HIGH_PE_RATIO = 31,
    HIGH_PRICE_2_BOOK_RATIO = 32,
    HIGH_PRICE_2_TAN_BOOK_RATIO = 33,
    HIGH_QUICK_RATIO = 34,
    HIGH_RETURN_ON_EQUITY = 35,
    HIGH_SYNTH_BID_REV_NAT_YIELD = 36,
    HIGH_VS_13W_HL = 37,
    HIGH_VS_26W_HL = 38,
    HIGH_VS_52W_HL = 39,
    HOT_BY_OPT_VOLUME = 40,
    HOT_BY_PRICE = 41,
    HOT_BY_PRICE_RANGE = 42,
    HOT_BY_VOLUME = 43,
    LIMIT_UP_DOWN = 44,
    LOW_BOND_BID_CURRENT_YIELD_ALL = 45,
    LOW_BOND_BID_YIELD_ALL = 46,
    LOW_BOND_DEBT_2_BOOK_RATIO = 47,
    LOW_BOND_DEBT_2_EQUITY_RATIO = 48,
    LOW_BOND_DEBT_2_TAN_BOOK_RATIO = 49,
    LOW_BOND_EQUITY_2_BOOK_RATIO = 50,
    LOW_BOND_EQUITY_2_TAN_BOOK_RATIO = 51,
    LOW_BOND_NET_BID_CURRENT_YIELD_ALL = 52,
    LOW_BOND_NET_BID_YIELD_ALL = 53,
    LOW_BOND_NET_SPREAD_ALL = 54,
    LOW_BOND_SPREAD_ALL = 55,
    LOW_COUPON_RATE = 56,
    LOWEST_SLB_ASK = 57,
    LOW_GROWTH_RATE = 58,
    LOW_MOODY_RATING_ALL = 59,
    LOW_OPEN_GAP = 60,
    LOW_OPT_IMP_VOLAT = 61,
    LOW_OPT_IMP_VOLAT_OVER_HIST = 62,
    LOW_OPT_OPEN_INTEREST_PUT_CALL_RATIO = 63,
    LOW_OPT_VOLUME_PUT_CALL_RATIO = 64,
    LOW_PE_RATIO = 65,
    LOW_PRICE_2_BOOK_RATIO = 66,
    LOW_PRICE_2_TAN_BOOK_RATIO = 67,
    LOW_QUICK_RATIO = 68,
    LOW_RETURN_ON_EQUITY = 69,
    LOW_SYNTH_ASK_REV_NAT_YIELD = 70,
    LOW_VS_13W_HL = 71,
    LOW_VS_26W_HL = 72,
    LOW_VS_52W_HL = 73,
    LOW_WAR_REL_IMP_VOLAT = 74,
    MARKET_CAP_USD_ASC = 75,
    MARKET_CAP_USD_DESC = 76,
    MOST_ACTIVE_AVG_USD = 77,
    MOST_ACTIVE_USD = 78,
    NEAR_MATURITY_DATE = 79,
    NOT_OPEN = 80,
    OPT_OPEN_INTEREST_MOST_ACTIVE = 81,
    OPT_VOLUME_MOST_ACTIVE = 82,
    PMONITOR_AVAIL_CONTRACTS = 83,
    PMONITOR_CTT = 84,
    PMONITOR_IBOND = 85,
    PMONITOR_RFQ = 86,
    TOP_OPEN_PERC_GAIN = 87,
    TOP_OPEN_PERC_LOSE = 88,
    TOP_OPT_IMP_VOLAT_GAIN = 89,
    TOP_OPT_IMP_VOLAT_LOSE = 90,
    TOP_PRICE_RANGE = 91,
    TOP_STOCK_BUY_IMBALANCE_ADV_RATIO = 92,
    TOP_STOCK_SELL_IMBALANCE_ADV_RATIO = 93,
    TOP_TRADE_COUNT = 94,
    TOP_TRADE_RATE = 95,
    TOP_VOLUME_RATE = 96,
    WSH_NEXT_ANALYST_MEETING = 97,
    WSH_NEXT_EARNINGS = 98,
    WSH_NEXT_EVENT = 99,
    WSH_NEXT_MAJOR_EVENT = 100,
    WSH_PREV_ANALYST_MEETING = 101,
    WSH_PREV_EARNINGS = 102,
    WSH_PREV_EVENT = 103
}
