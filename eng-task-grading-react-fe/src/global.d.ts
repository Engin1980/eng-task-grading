interface Window {
  turnstile: {
    render: (
      container: HTMLElement,
      options: {
        sitekey: string;
        callback: (token: string) => void;
        [key: string]: any;
      }
    ) => void;
  };
}