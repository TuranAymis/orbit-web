import { useMutation } from "@tanstack/react-query";
import {
  resendVerificationCode,
  type ResendVerificationCodeInput,
  type ResendVerificationCodeResult,
} from "@/features/auth/resend-verification-code/api/resendVerificationCode";

export function useResendVerificationCode() {
  return useMutation<
    ResendVerificationCodeResult,
    Error,
    ResendVerificationCodeInput
  >({
    mutationFn: resendVerificationCode,
  });
}
