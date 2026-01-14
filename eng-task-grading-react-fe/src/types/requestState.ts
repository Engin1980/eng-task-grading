import { useState } from "react";

export function useRequestState() {
  const [ready, setReadyInternal] = useState<boolean>(true);
  const [busy, setBusyInternal] = useState<boolean>(false);
  const [error, setErrorInternal] = useState<string | null>(null);
  const [done, setDoneInternal] = useState<boolean>(false);

  const setReady = () => {
    setReadyInternal(true);
    setBusyInternal(false);
    setErrorInternal(null);
    setDoneInternal(false);
  }

  const setBusy = () => {
    setReadyInternal(false);
    setBusyInternal(true);
    setErrorInternal(null);
    setDoneInternal(false);
  }

  const setDone = () => {
    setReadyInternal(false);
    setBusyInternal(false);
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

    setReadyInternal(false);
    setBusyInternal(false);
    setErrorInternal(messageText);
    setDoneInternal(false);
  }

  return {
    ready, busy, error, done, setReady, setBusy, setError, setDone
  };
}