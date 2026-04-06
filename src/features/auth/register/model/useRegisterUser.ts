import { useMutation } from "@tanstack/react-query";
import {
  registerUser,
  type RegisterUserInput,
  type RegisterUserResult,
} from "@/features/auth/register/api/registerUser";

export function useRegisterUser() {
  return useMutation<RegisterUserResult, Error, RegisterUserInput>({
    mutationFn: registerUser,
  });
}
