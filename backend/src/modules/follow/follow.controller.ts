import { Router } from "express";
import {
  authentication,
  sendResponse,
  validation,
} from "../../common/middlewares";
import {
  followSchema,
  getFollowRequestsSchema,
  followRelationSchema,
} from "./follow.schema";
import { getAuthUser, getReqData } from "../../common/helpers";
import type {
  TFollowDTO,
  TGetFollowRequestsDTO,
  TFollowRelationDTO,
} from "./follow.dto";
import type { IBasicResponse } from "../../common/types";
import { followService } from "./follow.service";

const router = Router();

router.use(authentication());

router.post(
  "/:userId",
  validation(followSchema),
  sendResponse<IBasicResponse>(async (req) => {
    const user = getAuthUser(req);
    const { params } = getReqData<TFollowDTO>(req);

    const result = await followService.follow(user.id, params.userId);

    return { status: 201, ...result };
  }),
);

router.patch(
  "/:relationId",
  validation(followRelationSchema),
  sendResponse<IBasicResponse>(async (req) => {
    const user = getAuthUser(req);
    const { params } = getReqData<TFollowRelationDTO>(req);

    const result = await followService.acceptFollowRequest(
      user.id,
      params.relationId,
    );

    return result;
  }),
);

// Unfollow or delete follow request (canceled or rejected)
router.delete(
  "/:relationId",
  validation(followRelationSchema),
  sendResponse<IBasicResponse>(async (req) => {
    const user = getAuthUser(req);
    const { params } = getReqData<TFollowRelationDTO>(req);

    const result = await followService.deleteRelation(
      user.id,
      params.relationId,
    );

    return result;
  }),
);

router.get(
  "/",
  validation(getFollowRequestsSchema),
  sendResponse(async (req) => {
    const user = getAuthUser(req);
    const { query } = getReqData<TGetFollowRequestsDTO>(req);

    const result = await followService.getFollowRequests(user.id, query);

    return result;
  }),
);

export default router;
