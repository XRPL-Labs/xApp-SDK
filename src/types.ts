export type AnyJson = Record<string, any>;

export interface xAppDomWindow {
  ReactNativeWebView?: {
    postMessage(message: any): void; // Required, Android doesn't accept 2nd argument
  };
  parent?: {
    postMessage(message: any, target: string): void; // Required, Android doesn't accept 2nd argument
  };
}

export enum xAppEvents {
  scanQr = "scanQr",
  payloadResolved = "payloadResolved",
  selectDestination = "selectDestination",
}

export interface qrEventData {
  contents?: null;
  reason: "USER_CLOSE" | "INVALID_QR" | "SCANNED";
}

export interface payloadEventData {
  reason: "DECLINED" | "SIGNED";
}

export interface destinationEventData {
  destination?: {
    address: string;
    tag?: number;
    name?: string;
  };
  info?: {
    blackHole: boolean;
    disallowIncomingXRP: false;
    exist: boolean;
    possibleExchange: false;
    requireDestinationTag: boolean;
    risk: "ERROR" | "UNKNOWS" | "PROBABLE" | "HIGH_PROBABILITY" | "CONFIRMED";
  };
  reason: "SELECTED" | "USER_CLOSE";
}

///

export interface xAppReceivedEvent extends Event {
  data: string;
}

export interface xAppReceivedEventData {
  method?: keyof xAppEvents;
}

///

export interface xAppEvent {
  qr: (data: qrEventData) => void;
  payload: (data: payloadEventData) => void;
  destination: (data: destinationEventData) => void;
}

export interface xAppActionNavigate extends AnyJson {
  // command: xAppNavigate
  xApp: string;
}

export interface xAppActionOpenSignRequest {
  // command: openSignRequest
  uuid: string;
}

export interface xAppActionOpenBrowser {
  // command: openBrowser
  url: string;
}

export interface xAppActionShare {
  // command: share
  title?: string;
  text?: string;
  url?: string;
}

export interface xAppActionClose {
  // command: close
  refreshEvents?: boolean;
}

export interface xAppActionTxDetails {
  // command: txDetails
  tx: string;
  account: string;
}

// export interface xAppActionSelectDestination {
//   // command: selectDestination
// }

// export interface xAppActionScanQr {
//   // command: scanQr
// }
