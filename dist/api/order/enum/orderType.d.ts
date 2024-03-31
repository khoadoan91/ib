/**
 * Order types.
 */
export declare enum OrderType {
    None = "",
    MKT = "MKT",
    LMT = "LMT",
    STP = "STP",
    STP_LMT = "STP LMT",
    REL = "REL",
    TRAIL = "TRAIL",
    BOX_TOP = "BOX TOP",
    FIX_PEGGED = "FIX PEGGED",
    LIT = "LIT",
    LMT_PLUS_MKT = "LMT + MKT",
    LOC = "LOC",
    MIT = "MIT",
    MKT_PRT = "MKT PRT",
    MOC = "MOC",
    MTL = "MTL",
    PASSV_REL = "PASSV REL",
    PEG_BENCH = "PEG BENCH",
    PEG_BEST = "PEG BEST",
    PEG_MID = "PEG MID",
    PEG_MKT = "PEG MKT",
    PEG_PRIM = "PEG PRIM",
    PEG_STK = "PEG STK",
    REL_PLUS_LMT = "REL + LMT",
    REL_PLUS_MKT = "REL + MKT",
    SNAP_MID = "SNAP MID",
    SNAP_MKT = "SNAP MKT",
    SNAP_PRIM = "SNAP PRIM",
    STP_PRT = "STP PRT",
    TRAIL_LIMIT = "TRAIL LIMIT",
    TRAIL_LIT = "TRAIL LIT",
    TRAIL_LMT_PLUS_MKT = "TRAIL LMT + MKT",
    TRAIL_MIT = "TRAIL MIT",
    TRAIL_REL_PLUS_MKT = "TRAIL REL + MKT",
    VOL = "VOL",
    VWAP = "VWAP",
    QUOTE = "QUOTE",
    PEG_PRIM_VOL = "PPV",
    PEG_MID_VOL = "PDV",
    PEG_MKT_VOL = "PMV",
    PEG_SRF_VOL = "PSV"
}
export declare const isPegBenchOrder: (orderType: OrderType) => boolean;
export declare const isPegBestOrder: (orderType: OrderType) => boolean;
export declare const isPegMidOrder: (orderType: OrderType) => boolean;
export default OrderType;
