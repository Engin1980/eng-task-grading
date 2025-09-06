import { useEffect, useRef } from "react";
import { useTurnstile } from "../hooks/use-turnstile";

interface TurnstileProps {
  siteKey: string;
  onVerify: (token: string) => void;
}

export function Turnstile({ siteKey, onVerify }: TurnstileProps) {
  const ref = useRef<HTMLDivElement>(null);

  useTurnstile();

  useEffect(() => {
    if (window.turnstile && ref.current) {
      window.turnstile.render(ref.current, {
        sitekey: siteKey,
        callback: onVerify,
      });
    }
  }, [siteKey, onVerify]);

  return <div ref={ref} className="flex justify-center py-4" />;
}
