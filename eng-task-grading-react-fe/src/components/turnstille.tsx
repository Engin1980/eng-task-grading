import { useEffect, useRef, useCallback } from "react";
import { useTurnstile } from "../hooks/use-turnstile";

interface TurnstileProps {
  siteKey: string;
  onVerify: (token: string) => void;
}

export function Turnstile({ siteKey, onVerify }: TurnstileProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isRenderedRef = useRef<boolean>(false);

  useTurnstile();

  // Stabilizuj callback aby se neměnil při každém renderu
  const stableOnVerify = useCallback(onVerify, []);

  useEffect(() => {
    if (window.turnstile && ref.current && !isRenderedRef.current) {
      try {
        // Vyčisti obsah před renderováním
        if (ref.current) {
          ref.current.innerHTML = '';
        }
        
        window.turnstile.render(ref.current, {
          sitekey: siteKey,
          callback: stableOnVerify, //TODO vyřešit tady onVerify vs stableOnVerify
        });
        
        isRenderedRef.current = true;
      } catch (error) {
        console.error('Turnstile render error:', error);
      }
    }

    // Cleanup function
    return () => {
      if (isRenderedRef.current && ref.current) {
        ref.current.innerHTML = '';
        isRenderedRef.current = false;
      }
    };
  }, [siteKey, stableOnVerify]);

  return <div ref={ref} className="flex justify-center py-4" />;
}
