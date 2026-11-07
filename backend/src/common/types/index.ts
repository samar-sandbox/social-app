import { z } from "zod";

export * from "./db.type";
export * from "./jwt.type";
export * from "./response.type";

export type TSchema<S extends (...args: any) => any> = z.infer<ReturnType<S>>;
