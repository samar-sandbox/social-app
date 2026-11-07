import { FOLLOW_STATUS, PROFILE_PRIVACY } from "../../common/enums";
import {
  BadRequestException,
  NotFoundException,
} from "../../common/exceptions";
import { buildUserKey, redisService } from "../../common/services/redis";
import { decrypt } from "../../common/services/security";
import { IBasicResponse } from "../../common/types";
import type { TUserHydratedDoc } from "../../database";
import { followRepository } from "../follow/follow.repo";
import { LIMITED_FIELDS, PUBLIC_FIELDS } from "./user.const";
import type {
  ISearchRes,
  ISuggestionsRes,
  IUploadImagesRes,
  IUserRes,
  IUsersRes,
  TSearchDTO,
  TUpdatePrivacyDTO,
} from "./user.dto";
import { userRepository } from "./user.repo";

class UserService {
  async getActiveUser(
    id: string,
    projection: Record<string, number> = LIMITED_FIELDS,
  ): Promise<TUserHydratedDoc> {
    const user = await userRepository.findById(id, projection);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async deleteUserResources(userId: string): Promise<void> {
    await userRepository.updateOne(
      { _id: userId },
      { tokensValidAfter: new Date() },
    );

    const userKeys = await redisService.keys(buildUserKey(userId));
    if (userKeys.length > 0) {
      await redisService.del(userKeys);
    }
  }

  async getUsers(userId: string): Promise<IUsersRes> {
    const users = await userRepository.find(
      { _id: { $ne: userId } },
      { password: 0 },
      { lean: true },
    );

    return {
      message: "Users retrieved successfully",
      data: users.map((user) => ({
        ...user,
        phone: user.phone ? decrypt(user.phone) : user.phone,
      })),
    };
  }

  async getProfile(
    userId: string,
    targetId: string = userId,
  ): Promise<IUserRes> {
    const isSelf = userId === targetId;

    const user = await this.getActiveUser(targetId, PUBLIC_FIELDS);

    const follow = isSelf
      ? null
      : await followRepository.findOne(
          { follower: userId, following: targetId },
          undefined,
          { lean: true },
        );

    const canView =
      isSelf ||
      user.privacy === PROFILE_PRIVACY.PUBLIC ||
      follow?.status === FOLLOW_STATUS.ACCEPTED;

    const [followers, following] = await Promise.all([
      followRepository.countDocuments({
        following: targetId,
        status: FOLLOW_STATUS.ACCEPTED,
      }),
      followRepository.countDocuments({
        follower: targetId,
        status: FOLLOW_STATUS.ACCEPTED,
      }),
    ]);

    const base = {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image ?? null,
      privacy: user.privacy ?? PROFILE_PRIVACY.PUBLIC,
      followers,
      following,
      relationship: isSelf ? ("self" as const) : (follow?.status ?? null),
      createdAt: user.createdAt,
    };

    return {
      message: "Profile retrieved successfully",
      data: canView
        ? {
            ...base,
            coverImages: user.coverImages ?? [],
            age: user.age,
            gender: user.gender,
          }
        : base,
    };
  }

  async uploadImages(
    userId: string,
    paths: Record<string, string[]> = {},
  ): Promise<IUploadImagesRes> {
    if (Object.keys(paths).length === 0) {
      throw new BadRequestException("At least on image is required");
    }

    const user = await userRepository.exists({ _id: userId });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const normalizePath = (path: string) => path.replaceAll("\\", "/");

    for (const [field, fieldPaths] of Object.entries(paths)) {
      paths[field] = fieldPaths.map((path) => normalizePath(path));
    }

    await userRepository.updateOne(
      { _id: userId },
      { ...paths, image: paths.image?.[0] },
    );

    return {
      message: "Files uploaded successfully",
      data: paths,
    };
  }

  async updatePrivacy(
    userId: string,
    { isPrivate }: TUpdatePrivacyDTO["body"],
  ) {
    const user = await userRepository.exists({ _id: userId });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    await userRepository.updateOne(
      { _id: userId },
      { privacy: isPrivate ? PROFILE_PRIVACY.PRIVATE : PROFILE_PRIVACY.PUBLIC },
    );

    return { message: "Privacy updated successfully" };
  }

  async search(
    userId: string,
    { q, page, limit }: TSearchDTO["query"],
  ): Promise<ISearchRes> {
    const query = q.toLowerCase().trim();

    const filter = {
      _id: { $ne: userId },
      $or: [
        { firstName: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "i" } },
      ],
    };

    const { data, pagination } = await userRepository.findAndPaginate(
      filter,
      LIMITED_FIELDS,
      {
        page,
        limit,
        sort: { firstName: 1 },
      },
    );

    const profiles = data.map((user) => ({
      id: user.id,
      name: user.name,
      image: user.image ?? null,
      privacy: user.privacy ?? PROFILE_PRIVACY.PUBLIC,
    }));

    return {
      message: "Search results retrieved successfully",
      data: profiles,
      pagination,
    };
  }

  async getSuggestions(userId: string, limit = 10): Promise<ISuggestionsRes> {
    const follows = await followRepository.find(
      { follower: userId },
      { following: 1 },
      { lean: true },
    );

    const excluded = [userId, ...follows.map((f) => f.following.toString())];
    const accepted = follows
      .filter((f) => f.status === FOLLOW_STATUS.ACCEPTED)
      .map((f) => f.following.toString());

    const candidates = await followRepository.mutualCandidates(
      accepted,
      excluded,
      limit,
    );
    const candidateIds = candidates.map((c) => c._id);

    const found = candidateIds.length
      ? await userRepository.find(
          { _id: { $in: candidateIds } },
          LIMITED_FIELDS,
        )
      : [];

    const remaining = limit - found.length;

    let filler: TUserHydratedDoc[] = [];
    if (remaining > 0) {
      filler = await userRepository.find(
        { _id: { $nin: [...excluded, ...candidateIds] } },
        LIMITED_FIELDS,
        { sort: { createdAt: -1 }, limit: remaining },
      );
    }

    const suggestions = [...found, ...filler].map((user) => ({
      id: user.id,
      name: user.name,
      image: user.image ?? null,
      privacy: user.privacy ?? PROFILE_PRIVACY.PUBLIC,
    }));

    return {
      message: "Suggestions retrieved successfully",
      data: suggestions,
    };
  }

  async deleteUser(userId: string): Promise<IBasicResponse> {
    await userRepository.updateOne({ _id: userId }, { deletedAt: new Date() });

    return { message: "User deleted successfully" };
  }

  async forceDeleteUser(userId: string): Promise<IBasicResponse> {
    const { deletedCount } = await userRepository.deleteOne(
      { _id: userId },
      { force: true },
    );

    if (!deletedCount) {
      throw new NotFoundException("User not found");
    }

    return { message: "User deleted successfully" };
  }
}

const userService = new UserService();

export { userService };
