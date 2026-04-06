import { useMutation } from "@tanstack/react-query";
import {
  verifyUserEmail,
  type VerifyUserEmailInput,
  type VerifyUserEmailResult,
} from "@/features/auth/verify/api/verifyUserEmail";

export function useVerifyUserEmail() {
  return useMutation<VerifyUserEmailResult, Error, VerifyUserEmailInput>({
    mutationFn: verifyUserEmail,
  });
}
