import type {
  ApplyBasicCreateCasting,
  CreateOptions,
  DeepPartial,
  DeleteResult,
  InferId,
  MongooseBaseQueryOptions,
  MongooseUpdateQueryOptions,
  ProjectionType,
  QueryFilter,
  QueryOptions,
  Require_id,
  SaveOptions,
  Types,
  UpdateQuery,
  UpdateResult,
} from "mongoose";
import type { IPagination, THydratedDocument, TModel } from "../common/types";

type TCreateDoc<T> = DeepPartial<ApplyBasicCreateCasting<Require_id<T>>>;

export class DatabaseRepository<TRawDocType, V = {}> {
  constructor(protected readonly model: TModel<TRawDocType, V>) {}

  async exists(
    filter: QueryFilter<TRawDocType>,
  ): Promise<{ _id: InferId<TRawDocType> } | null> {
    return this.model.exists(filter);
  }

  async create(doc: TRawDocType): Promise<THydratedDocument<TRawDocType, V>>;
  async create(
    docs: TCreateDoc<TRawDocType>[],
    options?: CreateOptions,
  ): Promise<THydratedDocument<TRawDocType, V>[]>;
  async create(
    docOrDocs: TRawDocType | TCreateDoc<TRawDocType>[],
    options?: CreateOptions,
  ): Promise<
    THydratedDocument<TRawDocType, V> | THydratedDocument<TRawDocType, V>[]
  > {
    if (options) {
      return this.model.create(docOrDocs as TCreateDoc<TRawDocType>[], options);
    }
    return this.model.create(docOrDocs as TRawDocType);
  }

  async insertOne(
    doc: Partial<ApplyBasicCreateCasting<TRawDocType>>,
    options?: SaveOptions,
  ): Promise<THydratedDocument<TRawDocType, V>> {
    return this.model.insertOne(doc, options);
  }

  async deleteMany(
    filter: QueryFilter<TRawDocType>,
    options?: MongooseBaseQueryOptions<TRawDocType>,
  ): Promise<DeleteResult> {
    return this.model.deleteMany(filter, options);
  }

  async deleteOne(
    filter: QueryFilter<TRawDocType>,
    options?: MongooseBaseQueryOptions<TRawDocType>,
  ): Promise<DeleteResult> {
    return this.model.deleteOne(filter, options);
  }

  async updateMany(
    filter: QueryFilter<TRawDocType>,
    update: UpdateQuery<TRawDocType>,
    options?: MongooseUpdateQueryOptions<TRawDocType>,
  ): Promise<UpdateResult> {
    return this.model.updateMany(filter, update, options);
  }

  async updateOne(
    filter: QueryFilter<TRawDocType>,
    update: UpdateQuery<TRawDocType>,
    options?: MongooseUpdateQueryOptions<TRawDocType>,
  ): Promise<UpdateResult> {
    return this.model.updateOne(filter, update, options);
  }

  async findById(
    id: Types.ObjectId | string,
    projection: ProjectionType<TRawDocType> | undefined,
    options: QueryOptions<TRawDocType> & { lean: true },
  ): Promise<TRawDocType | null>;
  async findById(
    id: Types.ObjectId | string,
    projection?: ProjectionType<TRawDocType>,
    options?: QueryOptions<TRawDocType>,
  ): Promise<THydratedDocument<TRawDocType, V> | null>;
  async findById(
    id: Types.ObjectId | string,
    projection?: ProjectionType<TRawDocType>,
    options?: QueryOptions<TRawDocType>,
  ): Promise<THydratedDocument<TRawDocType, V> | TRawDocType | null> {
    return this.model.findById(id, projection, options);
  }

  async findByIdAndDelete(
    id: Types.ObjectId | string,
    options: QueryOptions<TRawDocType> & { lean: true },
  ): Promise<TRawDocType | null>;
  async findByIdAndDelete(
    id: Types.ObjectId | string,
    options?: QueryOptions<TRawDocType>,
  ): Promise<THydratedDocument<TRawDocType, V> | null>;
  async findByIdAndDelete(
    id: Types.ObjectId | string,
    options?: QueryOptions<TRawDocType>,
  ): Promise<THydratedDocument<TRawDocType, V> | TRawDocType | null> {
    return this.model.findByIdAndDelete(id, options);
  }

  async findByIdAndUpdate(
    id: Types.ObjectId | string,
    update: UpdateQuery<TRawDocType>,
    options: QueryOptions<TRawDocType> & { lean: true },
  ): Promise<TRawDocType | null>;
  async findByIdAndUpdate(
    id: Types.ObjectId | string,
    update: UpdateQuery<TRawDocType>,
    options?: QueryOptions<TRawDocType>,
  ): Promise<THydratedDocument<TRawDocType, V> | null>;
  async findByIdAndUpdate(
    id: Types.ObjectId | string,
    update: UpdateQuery<TRawDocType>,
    options?: QueryOptions<TRawDocType>,
  ): Promise<THydratedDocument<TRawDocType, V> | TRawDocType | null> {
    return this.model.findByIdAndUpdate(id, update, options);
  }

  async findOne(
    filter: QueryFilter<TRawDocType>,
    projection: ProjectionType<TRawDocType> | undefined,
    options: QueryOptions<TRawDocType> & { lean: true },
  ): Promise<TRawDocType | null>;
  async findOne(
    filter: QueryFilter<TRawDocType>,
    projection?: ProjectionType<TRawDocType>,
    options?: QueryOptions<TRawDocType>,
  ): Promise<THydratedDocument<TRawDocType, V> | null>;
  async findOne(
    filter: QueryFilter<TRawDocType>,
    projection?: ProjectionType<TRawDocType>,
    options?: QueryOptions<TRawDocType>,
  ): Promise<THydratedDocument<TRawDocType, V> | TRawDocType | null> {
    return this.model.findOne(filter, projection, options);
  }

  async findOneAndDelete(
    filter: QueryFilter<TRawDocType>,
    options: QueryOptions<TRawDocType> & { lean: true },
  ): Promise<TRawDocType | null>;
  async findOneAndDelete(
    filter: QueryFilter<TRawDocType>,
    options?: QueryOptions<TRawDocType>,
  ): Promise<THydratedDocument<TRawDocType, V> | null>;
  async findOneAndDelete(
    filter: QueryFilter<TRawDocType>,
    options?: QueryOptions<TRawDocType>,
  ): Promise<THydratedDocument<TRawDocType, V> | TRawDocType | null> {
    return this.model.findOneAndDelete(filter, options);
  }

  async findOneAndUpdate(
    filter: QueryFilter<TRawDocType>,
    update: UpdateQuery<TRawDocType>,
    options: QueryOptions<TRawDocType> & { lean: true },
  ): Promise<TRawDocType | null>;
  async findOneAndUpdate(
    filter: QueryFilter<TRawDocType>,
    update: UpdateQuery<TRawDocType>,
    options?: QueryOptions<TRawDocType>,
  ): Promise<THydratedDocument<TRawDocType, V> | null>;
  async findOneAndUpdate(
    filter: QueryFilter<TRawDocType>,
    update: UpdateQuery<TRawDocType>,
    options?: QueryOptions<TRawDocType>,
  ): Promise<THydratedDocument<TRawDocType, V> | TRawDocType | null> {
    return this.model.findOneAndUpdate(filter, update, options);
  }

  async find(
    filter: QueryFilter<TRawDocType>,
    projection: ProjectionType<TRawDocType> | undefined,
    options: QueryOptions<TRawDocType> & { lean: true },
  ): Promise<TRawDocType[]>;
  async find(
    filter: QueryFilter<TRawDocType>,
    projection?: ProjectionType<TRawDocType>,
    options?: QueryOptions<TRawDocType>,
  ): Promise<THydratedDocument<TRawDocType, V>[]>;
  async find(
    filter: QueryFilter<TRawDocType>,
    projection?: ProjectionType<TRawDocType> | undefined,
    options?: QueryOptions<TRawDocType>,
  ): Promise<THydratedDocument<TRawDocType, V>[] | TRawDocType[]> {
    return this.model.find(filter, projection, options);
  }

  async findAndCount(
    filter: QueryFilter<TRawDocType>,
    projection: ProjectionType<TRawDocType> | undefined,
    options: QueryOptions<TRawDocType> & {
      sort: any;
      limit: number;
      lean: true;
    },
  ): Promise<[TRawDocType[], number]>;
  async findAndCount(
    filter: QueryFilter<TRawDocType>,
    projection: ProjectionType<TRawDocType> | undefined,
    options: QueryOptions<TRawDocType> & { sort: any; limit: number },
  ): Promise<[THydratedDocument<TRawDocType, V>[], number]>;
  async findAndCount(
    filter: QueryFilter<TRawDocType>,
    projection: ProjectionType<TRawDocType> | undefined,
    options: QueryOptions<TRawDocType> & { sort: any; limit: number },
  ): Promise<[THydratedDocument<TRawDocType, V>[] | TRawDocType[], number]> {
    return this.model.findAndCount(filter, projection, options);
  }

  async countDocuments(
    filter?: QueryFilter<TRawDocType>,
    options?: MongooseBaseQueryOptions<TRawDocType>,
  ): Promise<number> {
    return this.model.countDocuments(filter, options);
  }

  async findAndPaginate(
    filter: QueryFilter<TRawDocType>,
    projection: ProjectionType<TRawDocType> | undefined,
    options: QueryOptions<TRawDocType> & {
      page?: number;
      sort?: any;
      limit?: number;
      lean: true;
    },
  ): Promise<IPagination<TRawDocType[]>>;
  async findAndPaginate(
    filter: QueryFilter<TRawDocType>,
    projection: ProjectionType<TRawDocType> | undefined,
    options: QueryOptions<TRawDocType> & {
      page?: number;
      sort?: any;
      limit?: number;
    },
  ): Promise<IPagination<THydratedDocument<TRawDocType, V>[]>>;
  async findAndPaginate(
    filter: QueryFilter<TRawDocType>,
    projection: ProjectionType<TRawDocType> | undefined,
    options: QueryOptions<TRawDocType> & {
      page?: number;
      sort?: any;
      limit?: number;
    },
  ): Promise<IPagination<THydratedDocument<TRawDocType, V>[] | TRawDocType[]>> {
    const { page = 1, limit = 10, sort = { createdAt: -1 }, ...rest } = options;

    const skip = (page - 1) * limit;

    const [data, total] = await this.findAndCount(filter, projection, {
      ...rest,
      sort,
      limit,
      skip,
    });

    return {
      data,
      pagination: {
        total,
        limit,
        page,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
