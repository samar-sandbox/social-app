import { FOLLOW_STATUS, PROFILE_PRIVACY } from "../../common/enums";
import {
  BadRequestException,
  NotFoundException,
} from "../../common/exceptions";
import { followRepository } from "./follow.repo";
import type {
  IFollowRequest,
  IGetFollowRequestsRes,
  TGetFollowRequestsDTO,
} from "./follow.dto";
import { userService } from "../users/user.service";
import { LIMITED_FIELDS } from "../users/user.const";
import { IBasicResponse } from "../../common/types";
import { toObjectId } from "../../common/helpers";

class FollowService {
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

    const user = await userService.getActiveUser(targetId, LIMITED_FIELDS);

    const status =
      user.privacy === PROFILE_PRIVACY.PRIVATE
        ? FOLLOW_STATUS.PENDING
        : FOLLOW_STATUS.ACCEPTED;

    await followRepository.create({
      follower: toObjectId(userId),
      following: toObjectId(targetId),
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
      { lean: true },
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
}

const followService = new FollowService();

export { followService };
