import {
    ContractDetails,
    ErrorCode,
    EventName,
    IBApi,
    Instrument,
    LocationCode,
    ScanCode,
} from "../../..";
import configuration from "../../../common/configuration";

describe("IBApi market scanner tests", () => {
  jest.setTimeout(10 * 1000);

  let ib: IBApi;
  const clientId = Math.floor(Math.random() * 32766) + 1; // ensure unique client

  beforeEach(() => {
    ib = new IBApi({
      host: configuration.ib_host,
      port: configuration.ib_port,
      clientId,
    });
  });

  afterEach(() => {
    if (ib) {
      ib.disconnect();
      ib = undefined;
    }
  });

  test("Scanner parameters", (done) => {
    ib.on(EventName.scannerParameters, (xml: string) => {
      const match = '<?xml version="1.0" encoding="UTF-8"?>'; // eslint-disable-line quotes
      expect(xml.substring(0, match.length)).toEqual(match);
      ib.disconnect();
    })
      .on(EventName.disconnected, () => {
        done();
      })
      .on(EventName.error, (err, code: ErrorCode, reqId) => {
        if (reqId !== -1) done(`[${reqId}] ${err.message} (#${code})`);
      });

    ib.connect().reqScannerParameters();
  });

  test("Most active US stocks", (done) => {
    const refId = 1;
    ib.once(EventName.nextValidId, (_reqId) => {
      ib.reqScannerSubscription(refId, {
        abovePrice: 1,
        scanCode: ScanCode.MOST_ACTIVE,
        locationCode: LocationCode.STK_US,
        instrument: Instrument.STK,
        numberOfRows: 20,
      });
    })
      .on(
        EventName.scannerData,
        (
          reqId,
          _rank: number,
          _contract: ContractDetails,
          _distance: string,
          _benchmark: string,
          _projection: string,
          _legStr: string,
        ) => {
          expect(reqId).toEqual(refId);
        },
      )
      .on(EventName.scannerDataEnd, (reqId) => {
        expect(reqId).toEqual(refId);
        if (ib) ib.disconnect();
      })
      .on(EventName.disconnected, () => {
        done();
      })
      .on(EventName.error, (err, code, reqId) => {
        if (reqId === refId) {
          if (code === ErrorCode.SCANNER_LOW_PRECISION) return;
          done(`[${reqId}] ${err.message} (#${code})`);
        }
      });

    ib.connect();
  });
});
