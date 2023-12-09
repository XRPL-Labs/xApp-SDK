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
  ready = "ready",
  scanQr = "scanQr",
  payloadResolved = "payloadResolved",
  selectDestination = "selectDestination",
  networkSwitch = "networkSwitch",
}

export interface qrEventData {
  qrContents?: null;
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

export interface xAppActionOpenSignRequest extends AnyJson {
  // command: openSignRequest
  uuid: string;
}

export interface xAppActionOpenBrowser extends AnyJson {
  // command: openBrowser
  url: string;
}

export interface xAppActionShare {
  // command: share
  text?: string;
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

export interface xAppActionReady {}

export interface xAppActionSelectDestination {
  // command: selectDestination
  ignoreDestinationTag?: boolean;
}

export interface xAppNetworkSwitch {
  // command: selectDestination
  network?: string;
}

export interface xAppEnvironment {
  version: string;
  ott: string;
}

// export interface xAppActionScanQr {
//   // command: scanQr
// }
