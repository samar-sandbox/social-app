import { FOLLOW_STATUS } from "../../common/enums";
import { type IFollow, Follow, DatabaseRepository } from "../../database";

class FollowRepository extends DatabaseRepository<IFollow> {
  constructor() {
    super(Follow);
  }

  async mutualCandidates(
    followingIds: string[],
    excludeIds: string[],
    limit: number,
  ): Promise<{ _id: string; mutuals: number }[]> {
    if (!followingIds.length) {
      return [];
    }

    return this.model.aggregate([
      {
        $match: {
          follower: { $in: followingIds },
          following: { $nin: excludeIds },
          status: FOLLOW_STATUS.ACCEPTED,
        },
      },
      { $group: { _id: "$following", mutuals: { $sum: 1 } } },
      { $sort: { mutuals: -1 } },
      { $limit: limit },
    ]);
  }
}

const followRepository = new FollowRepository();

export { followRepository };
