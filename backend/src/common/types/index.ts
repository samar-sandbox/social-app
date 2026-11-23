import { z } from "zod";
import { uploadSchema } from "../validation";

export * from "./db.type";
export * from "./jwt.type";
export * from "./response.type";
export * from "./express.type";

export type TSchema<S extends (...args: any) => any> = z.infer<ReturnType<S>>;

export type TUpload = TSchema<typeof uploadSchema>;
