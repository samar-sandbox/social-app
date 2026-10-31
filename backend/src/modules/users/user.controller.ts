import { Router } from "express";
import {
  authentication,
  multerInstance,
  requiredRoles,
  sendResponse,
  upload,
  validation,
} from "../../common/middlewares";
import { userService } from "./user.service";
import { USER_ROLE, FILE_TYPE } from "../../common/enums";
import {
  followSchema,
  getProfileSchema,
  updatePrivacySchema,
  uploadImagesSchema,
  getFollowRequestsSchema,
  followRelationSchema,
  searchSchema,
  suggestionsSchema,
} from "./user.schema";
import { getAuthUser, getReqData } from "../../common/helpers";
import type {
  IUsersRes,
  IUserRes,
  IUploadImagesRes,
  TGetProfileDTO,
  TUpdatePrivacyDTO,
  TFollowDTO,
  TGetFollowRequestsDTO,
  TFollowRelationDTO,
  TSearchDTO,
  TSuggestionsDTO,
} from "./user.dto";
import type { IBasicResponse } from "../../common/types";

const router = Router();

router.use(authentication());

router.get(
  "/all",
  requiredRoles([USER_ROLE.ADMIN]),
  sendResponse<IUsersRes>(async (req) => {
    const user = getAuthUser(req);

    const result = await userService.getUsers(user.id);

    return result;
  }),
);

router.get(
  "/profile{/:userId}",
  validation(getProfileSchema),
  sendResponse<IUserRes>(async (req) => {
    const user = getAuthUser(req);
    const { params } = getReqData<TGetProfileDTO>(req);

    const result = await userService.getProfile(user.id, params.userId);

    return result;
  }),
);

router.post(
  "/upload",
  upload(
    multerInstance.fields([
      { name: "image", maxCount: 1 },
      { name: "coverImages", maxCount: 2 },
    ]),
    FILE_TYPE.IMAGE,
  ),
  validation(uploadImagesSchema),
  sendResponse<IUploadImagesRes>(async (req) => {
    const user = getAuthUser(req);

    const result = await userService.uploadImages(user.id, req.paths);

    return result;
  }),
);

router.patch(
  "/privacy",
  validation(updatePrivacySchema),
  sendResponse<IBasicResponse>(async (req) => {
    const { body } = getReqData<TUpdatePrivacyDTO>(req);
    const user = getAuthUser(req);

    const result = await userService.updatePrivacy(user.id, body);

    return result;
  }),
);

router.post(
  "/follow/:userId",
  validation(followSchema),
  sendResponse<IBasicResponse>(async (req) => {
    const user = getAuthUser(req);
    const { params } = getReqData<TFollowDTO>(req);

    const result = await userService.follow(user.id, params.userId);

    return { status: 201, ...result };
  }),
);

router.patch(
  "/follow/:relationId",
  validation(followRelationSchema),
  sendResponse<IBasicResponse>(async (req) => {
    const user = getAuthUser(req);
    const { params } = getReqData<TFollowRelationDTO>(req);

    const result = await userService.acceptFollowRequest(
      user.id,
      params.relationId,
    );

    return result;
  }),
);

// Unfollow or delete follow request (canceled or rejected)
router.delete(
  "/follow/:relationId",
  validation(followRelationSchema),
  sendResponse<IBasicResponse>(async (req) => {
    const user = getAuthUser(req);
    const { params } = getReqData<TFollowRelationDTO>(req);

    const result = await userService.deleteRelation(user.id, params.relationId);

    return result;
  }),
);

router.get(
  "/follow",
  validation(getFollowRequestsSchema),
  sendResponse(async (req) => {
    const user = getAuthUser(req);
    const { query } = getReqData<TGetFollowRequestsDTO>(req);

    const result = await userService.getFollowRequests(user.id, query);

    return result;
  }),
);

router.get(
  "/search",
  validation(searchSchema),
  sendResponse(async (req) => {
    const user = getAuthUser(req);
    const { query } = getReqData<TSearchDTO>(req);

    const result = await userService.search(user.id, query);

    return result;
  }),
);

router.get(
  "/suggestions",
  validation(suggestionsSchema),
  sendResponse(async (req) => {
    const user = getAuthUser(req);
    const { query } = getReqData<TSuggestionsDTO>(req);

    const result = await userService.getSuggestions(user.id, query.limit);

    return result;
  }),
);

export default router;
