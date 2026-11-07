import type { HydratedDocument, Model } from "mongoose";

export interface IPaginationInfo {
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface IPagination<T> extends IPaginationInfo {
  data: T;
}

export interface IDefaultVirtuals {
  id: string;
}

export type THydratedDocument<T, V = IDefaultVirtuals> = HydratedDocument<
  T,
  V & {},
  {},
  V
>;

export type TModel<T, V = {}> = Model<T, {}, {}, V>;
