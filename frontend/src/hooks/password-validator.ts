import { useState } from "react";

export function usePasswordValidator() {
  const [errors, setErrors] = useState<string[]>([]);

  const validatePassword = (password: string, confirmPassword: string) => {
    const newErrors = [];

    if (password.length < 8) {
      newErrors.push("Password must be at least 8 characters long.");
    }
    if (!/[a-z]/.test(password)) {
      newErrors.push("Password must contain at least one lowercase letter.");
    }
    if (!/[A-Z]/.test(password)) {
      newErrors.push("Password must contain at least one uppercase letter.");
    }
    if (!/[0-9]/.test(password)) {
      newErrors.push("Password must contain at least one number.");
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      newErrors.push("Password must contain at least one special character.");
    }
    if (password !== confirmPassword) {
        newErrors.push("Passwords do not match.");
      }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  return { errors, validatePassword };
}
