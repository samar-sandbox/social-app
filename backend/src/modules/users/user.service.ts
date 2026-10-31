import { Types } from "mongoose";
import { FOLLOW_STATUS, PROFILE_PRIVACY } from "../../common/enums";
import {
  BadRequestException,
  NotFoundException,
} from "../../common/exceptions";
import { buildUserKey, redisService } from "../../common/services/redis";
import { decrypt } from "../../common/services/security";
import type { TUserHydratedDoc } from "../../database";
import { followRepository } from "./follow.repo";
import type {
  IFollowRequest,
  IGetFollowRequestsRes,
  ISearchRes,
  ISuggestionsRes,
  IUploadImagesRes,
  IUserRes,
  IUsersRes,
  TGetFollowRequestsDTO,
  TSearchDTO,
  TUpdatePrivacyDTO,
} from "./user.dto";
import { userRepository } from "./user.repo";
import { IBasicResponse } from "../../common/types";

const LIMITED_FIELDS = {
  firstName: 1,
  lastName: 1,
  image: 1,
  privacy: 1,
};

const PUBLIC_FIELDS = {
  ...LIMITED_FIELDS,
  email: 1,
  coverImages: 1,
  age: 1,
  gender: 1,
  createdAt: 1,
};

class UserService {
  private async getActiveUser(
    id: string,
    projection?: Record<string, number>,
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

  async follow(userId: string, targetId: string): Promise<IBasicResponse> {
    if (userId === targetId) {
      throw new BadRequestException("You cannot follow yourself");
    }

    const request = await followRepository.findOne(
      { follower: targetId, following: userId },
      { status: 1 },
      { lean: true },
    );

    if (request) {
      throw new BadRequestException(
        request.status === FOLLOW_STATUS.PENDING
          ? "Follow request is pending from this user"
          : "This user is already following you",
      );
    }

    const follow = await followRepository.findOne(
      { follower: userId, following: targetId },
      { status: 1 },
      { lean: true },
    );

    if (follow) {
      throw new BadRequestException(
        follow.status === FOLLOW_STATUS.PENDING
          ? "Follow request is pending"
          : "You are already following this user",
      );
    }

    const user = await this.getActiveUser(targetId, LIMITED_FIELDS);

    const status =
      user.privacy === PROFILE_PRIVACY.PRIVATE
        ? FOLLOW_STATUS.PENDING
        : FOLLOW_STATUS.ACCEPTED;

    await followRepository.create({
      follower: new Types.ObjectId(userId),
      following: new Types.ObjectId(targetId),
      status,
    });

    return {
      message:
        status === FOLLOW_STATUS.PENDING
          ? `Follow request sent to ${user.name}`
          : `You are now following ${user.name}`,
    };
  }

  async deleteRelation(
    userId: string,
    relationId: string,
  ): Promise<IBasicResponse> {
    const follow = await followRepository.findOne(
      { _id: relationId },
      undefined,
      {
        lean: true,
      },
    );

    if (!follow) {
      throw new NotFoundException("Follow relationship not found");
    }

    if (
      follow.follower.toString() !== userId &&
      follow.following.toString() !== userId
    ) {
      throw new BadRequestException(
        "You are not authorized to delete this follow relationship",
      );
    }

    await followRepository.deleteOne({ _id: relationId });

    return {
      message:
        follow.status === FOLLOW_STATUS.PENDING
          ? "Follow request deleted"
          : "Unfollowed successfully",
    };
  }

  async acceptFollowRequest(userId: string, reqId: string) {
    const follow = await followRepository.findOne({ _id: reqId }, undefined, {
      lean: true,
    });

    if (!follow) {
      throw new NotFoundException(
        "Follow relationship not found for this user",
      );
    }

    if (follow.follower.toString() === userId) {
      throw new BadRequestException(
        "You cannot accept a follow request for yourself",
      );
    }

    if (follow.status === FOLLOW_STATUS.ACCEPTED) {
      throw new BadRequestException("Follow request has already been accepted");
    }

    await followRepository.updateOne(
      { _id: reqId },
      { status: FOLLOW_STATUS.ACCEPTED },
    );

    return { message: "Follow request accepted" };
  }

  async getFollowRequests(
    userId: string,
    { page, limit }: TGetFollowRequestsDTO["query"],
  ): Promise<IGetFollowRequestsRes> {
    const { data, pagination } = await followRepository.findAndPaginate(
      { following: userId, status: FOLLOW_STATUS.PENDING },
      { follower: 1 },
      {
        page,
        limit,
        populate: { path: "follower", select: LIMITED_FIELDS },
      },
    );

    const requests = data.map(({ follower, id: reqId }) => {
      const { id, name, image, privacy } =
        follower as unknown as IFollowRequest["follower"];

      return {
        id: reqId,
        follower: { id, name, image, privacy },
      };
    });

    return {
      message: "Follow requests retrieved successfully",
      data: requests,
      pagination,
    };
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
}

const userService = new UserService();

export { userService };
