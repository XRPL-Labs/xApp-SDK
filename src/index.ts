import { EventEmitter } from "events";
import { debug as Debug } from "debug";

import {
  xAppEvent,
  xAppActionNavigate,
  xAppActionOpenSignRequest,
  xAppActionOpenBrowser,
  xAppActionTxDetails,
  xAppActionClose,
  xAppEvents,
  xAppReceivedEvent,
  xAppReceivedEventData,
  payloadEventData,
  qrEventData,
  destinationEventData,
  xAppDomWindow,
} from "./types";

export * from "./types";

localStorage.debug = "xapp*";

const attemptMs = 250;
const attemptDuration = 2000;

Debug.log = console.log.bind(console);
const log = Debug("xapp");

let documentIsReady: (value?: unknown) => void;
const documentReadyPromise = new Promise((resolve) => {
  documentIsReady = resolve;
});

documentReadyPromise
  .then(() => {
    log("documentReadyPromise resolved");
  })
  .catch((e) => {
    log(e);
  });

document.addEventListener("readystatechange", (event) => {
  log("(readystatechange: [ " + document.readyState + " ])");
  if (document.readyState === "complete") {
    documentIsReady();
  }
});

log("Loading xApp SDK");

export declare interface xApp {
  on<U extends keyof xAppEvent>(event: U, listener: xAppEvent[U]): this;
  off<U extends keyof xAppEvent>(event: U, listener: xAppEvent[U]): this;
  // emit<U extends keyof xAppEvent>(
  //   event: U,
  //   ...args: Parameters<xAppEvent[U]>
  // ): boolean;
}

const xAppActionAttempt = async (
  command: string,
  options?:
    | xAppActionNavigate
    | xAppActionOpenSignRequest
    | xAppActionOpenBrowser
    | xAppActionClose
    | xAppActionTxDetails,
  attempt = 0
): Promise<boolean | Error> => {
  await documentReadyPromise;

  const _window = window as xAppDomWindow;
  if (typeof _window?.ReactNativeWebView !== "undefined") {
    _window.ReactNativeWebView?.postMessage(
      JSON.stringify({ command, ...(options || {}) }),
      "*"
    );
    log("xAppActionAttempt Success", command, options);

    return true;
  } else {
    if (attempt * attemptMs < attemptDuration) {
      // Another attempt
      log(
        "xAppActionAttempt Attempt " + attempt + " » Retry",
        command,
        options
      );
      await new Promise((resolve) => {
        setTimeout(resolve, attemptMs);
      });
      return xAppActionAttempt(command, options, attempt + 1);
    } else {
      // Nope
      log(
        "xAppActionAttempt Failed after attempt " + attempt,
        command,
        options
      );

      return new Error(
        "xApp." +
          command.replace(/^xApp/, "") +
          ": could not contact Xumm App Host"
      );
    }
  }
};

export class xApp extends EventEmitter {
  constructor() {
    super();

    log("Constructed new xApp object");
    log(
      "(Document ready state during consteructing: " + document.readyState + ")"
    );
    if (document.readyState === "complete") {
      documentIsReady();
    }

    const eventHandler = (event: Event): void => {
      const _event: xAppReceivedEventData = JSON.parse(
        (event as xAppReceivedEvent)?.data || "{}"
      );

      log({ _event });

      if (typeof _event === "object" && _event !== null) {
        if (typeof _event.method === "string" && _event.method in xAppEvents) {
          log("xApp Event received", _event.method, _event);

          const method = _event.method;
          delete _event.method;

          switch (method) {
            case String(xAppEvents.payloadResolved):
              this.emit("payload", _event as unknown as payloadEventData);
              break;
            case String(xAppEvents.scanQr):
              this.emit("qr", _event as unknown as qrEventData);
              break;
            case String(xAppEvents.selectDestination):
              this.emit(
                "destination",
                _event as unknown as destinationEventData
              );
              break;
          }
        } else {
          log(
            "xApp Event received, not in xAppEvents",
            _event.method,
            xAppEvents
          );
        }
      }
    };

    if (typeof window.addEventListener === "function") {
      window.addEventListener("message", eventHandler);
    }

    if (typeof document.addEventListener === "function") {
      document.addEventListener("message", eventHandler);
    }
  }

  navigate(navigateOptions: xAppActionNavigate): Promise<boolean | Error> {
    if (typeof navigateOptions?.xApp !== "string") {
      return Promise.reject(
        new Error("xApp.navigate: Invalid argument: `xApp`")
      );
    }
    return xAppActionAttempt("xAppNavigate", navigateOptions);
  }

  openSignRequest(
    openSignRequestOptions: xAppActionOpenSignRequest
  ): Promise<boolean | Error> {
    if (typeof openSignRequestOptions?.uuid !== "string") {
      return Promise.reject(
        new Error("xApp.openSignRequest: Invalid argument: `uuid`")
      );
    }
    if (
      !openSignRequestOptions.uuid.match(
        /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
      )
    ) {
      return Promise.reject(
        new Error("xApp.openSignRequest: Invalid payload UUID")
      );
    }
    return xAppActionAttempt("openSignRequest", openSignRequestOptions);
  }

  selectDestination(): Promise<boolean | Error> {
    return xAppActionAttempt("selectDestination");
  }

  openBrowser(
    openBrowserOptions: xAppActionOpenBrowser
  ): Promise<boolean | Error> {
    if (typeof openBrowserOptions?.url !== "string") {
      return Promise.reject(
        new Error("xApp.openBrowser: Invalid argument: `url`")
      );
    }
    return xAppActionAttempt("openBrowser", openBrowserOptions);
  }

  scanQr(): Promise<boolean | Error> {
    return xAppActionAttempt("scanQr");
  }

  tx(txOptions: xAppActionTxDetails): Promise<boolean | Error> {
    if (typeof txOptions?.tx !== "string") {
      return Promise.reject(new Error("xApp.tx: Invalid argument: `tx`"));
    }
    if (typeof txOptions?.account !== "string") {
      return Promise.reject(new Error("xApp.tx: Invalid argument: `account`"));
    }
    return xAppActionAttempt("txDetails", txOptions);
  }

  close(closeOptions?: xAppActionClose): Promise<boolean | Error> {
    return xAppActionAttempt("close", closeOptions);
  }
}
