import { useEffect } from "react";

export function useTurnstile() {
  useEffect(() => {
    const scriptId = "cf-turnstile";

    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      script.defer = true;
      script.id = scriptId;
      document.body.appendChild(script);
    }
  }, []);
}