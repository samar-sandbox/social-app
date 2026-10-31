export type IBasicResponse<E = {}> = E & {
  message: string;
};

export type IDataResponse<T, E = {}> = IBasicResponse<E> & {
  data: T;
};
