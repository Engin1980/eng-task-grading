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

// Runtime-injected config (created by server/entrypoint as env.js or similar)
interface Window {
  __APP_CONFIG__?: Record<string, string | boolean | undefined>

}