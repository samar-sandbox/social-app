import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Email must be a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const sendOTPSchema = z.object({
  email: z.email("Email must be a valid email address"),
});

export const verifyOTPSchema = z.object({
  email: z.email("Email must be a valid email address"),
  otp: z.string().regex(/[0-9]{6}/, "Invalid OTP"),
});

export const resetPasswordSchema = verifyOTPSchema
  .extend({
    password: z
      .string()
      .regex(
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{6,}$/,
        "Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match",
  });

export const signupSchema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters long"),
    email: loginSchema.shape.email,
    password: z
      .string()
      .regex(
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{6,}$/,
        "Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character",
      ),
    confirmPassword: z.string(),
    phone: z
      .string()
      .regex(
        /^01[0125][0-9]{8}$/,
        "Enter a valid Egyptian number (010/011/012/015 + 8 digits)",
      ),
    age: z.coerce
      .number()
      .int()
      .min(18, "Age must be at least 18")
      .max(60, "Age must be at most 60"),
    gender: z.enum(["male", "female"]),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match",
  });
