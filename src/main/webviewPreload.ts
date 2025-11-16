// This preload runs inside each <webview> guest page.
// It patches WebSocket to capture sent/received frames and forwards them to the embedder.

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { ipcRenderer } = require('electron') as typeof import('electron');

(function () {
  try {
    const OriginalWebSocket = window.WebSocket;

    function wrapWebSocket(url: string | URL, protocols?: string | string[]) {
      const ws = protocols ? new OriginalWebSocket(url, protocols) : new OriginalWebSocket(url);

      const originalSend = ws.send.bind(ws);
      ws.send = function (data: any) {
        try {
          ipcRenderer.sendToHost('ws-event', {
            direction: 'outgoing',
            url: typeof url === 'string' ? url : url.toString(),
            time: Date.now(),
            data: serializeData(data),
          });
        } catch {}
        return originalSend(data);
      };

      ws.addEventListener('message', (event) => {
        try {
          ipcRenderer.sendToHost('ws-event', {
            direction: 'incoming',
            url: ws.url,
            time: Date.now(),
            data: serializeData(event.data),
          });
        } catch {}
      });

      return ws;
    }

    Object.defineProperty(wrapWebSocket, 'CONNECTING', { get: () => OriginalWebSocket.CONNECTING });
    Object.defineProperty(wrapWebSocket, 'OPEN', { get: () => OriginalWebSocket.OPEN });
    Object.defineProperty(wrapWebSocket, 'CLOSING', { get: () => OriginalWebSocket.CLOSING });
    Object.defineProperty(wrapWebSocket, 'CLOSED', { get: () => OriginalWebSocket.CLOSED });
    wrapWebSocket.prototype = OriginalWebSocket.prototype;

    Object.defineProperty(window, 'WebSocket', {
      configurable: true,
      writable: false,
      value: wrapWebSocket,
    });
  } catch {
    // no-op
  }

  function serializeData(data: any): { type: string; text?: string; byteLength?: number } {
    if (typeof data === 'string') {
      return { type: 'text', text: data };
    }
    if (data instanceof ArrayBuffer) {
      return { type: 'binary', byteLength: data.byteLength };
    }
    if (ArrayBuffer.isView(data)) {
      return { type: 'binary', byteLength: (data as ArrayBufferView).byteLength };
    }
    try {
      return { type: 'text', text: String(data) };
    } catch {
      return { type: 'binary' };
    }
  }
})();


