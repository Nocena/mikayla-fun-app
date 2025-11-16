declare namespace JSX {
  interface IntrinsicElements {
    webview: React.DetailedHTMLProps<
      React.HTMLAttributes<WebviewTag> & {
        src?: string;
        allowpopups?: boolean;
        webpreferences?: string;
        partition?: string;
        useragent?: string;
        preload?: string;
      },
      WebviewTag
    >;
  }
}


