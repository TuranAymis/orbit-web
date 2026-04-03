import { useEffect, useState } from "react";

export function useMutationFeedback(error: unknown) {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (error instanceof Error) {
      setMessage(error.message);
      return;
    }

    setMessage(null);
  }, [error]);

  return {
    message,
    clearMessage: () => setMessage(null),
  };
}
