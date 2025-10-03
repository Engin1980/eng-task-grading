import { useState } from "react";

export function useLoadingState() {
  const [loading, setLoadingInternal] = useState<boolean>(true);
  const [error, setErrorInternal] = useState<string | null>(null);
  const [done, setDoneInternal] = useState<boolean>(false);

  const setLoading = () => {
    setLoadingInternal(true);
    setErrorInternal(null);
    setDoneInternal(false);
  }

  const setDone = () => {
    setLoadingInternal(false);
    setErrorInternal(null);
    setDoneInternal(true);
  }

  const setError = (message?: string | Error | any) => {
    let messageText: string;
    if (message) {
      if (message instanceof Error)
        messageText = message.message;
      else
        messageText = message;
    }
    else
      messageText = 'Neznámá chyba';

    setLoadingInternal(false);
    setErrorInternal(messageText);
    setDoneInternal(false);
  }

  return {
    loading, error, done, setLoading, setError, setDone
  };
}