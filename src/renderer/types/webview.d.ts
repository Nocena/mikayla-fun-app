// Type definitions for Electron webview element
interface WebviewTag extends HTMLElement {
  src: string;
  allowpopups: boolean;
  webpreferences: string;
  executeJavaScript(code: string): Promise<any>;
  addEventListener(
    type: 'dom-ready' | 'did-navigate' | 'did-navigate-in-page' | 'did-fail-load',
    listener: (event: any) => void
  ): void;
  removeEventListener(
    type: 'dom-ready' | 'did-navigate' | 'did-navigate-in-page' | 'did-fail-load',
    listener: (event: any) => void
  ): void;
}

declare namespace JSX {
  interface IntrinsicElements {
    webview: React.DetailedHTMLProps<
      React.HTMLAttributes<WebviewTag> & {
        src?: string;
        allowpopups?: boolean;
        webpreferences?: string;
        ref?: React.Ref<WebviewTag>;
      },
      WebviewTag
    >;
  }
}

