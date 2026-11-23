import { Router } from "express";
import {
  authentication,
  getMulterInstance,
  requiredRoles,
  sendResponse,
  upload,
  validation,
} from "../../common/middlewares";
import { userService } from "./user.service";
import { USER_ROLE, FILE_TYPE, MULTER_STORAGE } from "../../common/enums";
import {
  getProfileSchema,
  updatePrivacySchema,
  uploadImagesSchema,
  searchSchema,
  suggestionsSchema,
  deleteUserSchema,
  uploadPresignedUrlSchema,
} from "./user.schema";
import { getAuthUser, getReqData } from "../../common/helpers";
import type {
  IUsersRes,
  IUserRes,
  IUploadImagesRes,
  TGetProfileDTO,
  TUpdatePrivacyDTO,
  TSearchDTO,
  TSuggestionsDTO,
  TDeleteUserDTO,
  IPresignedUploadImagesRes,
  ISearchRes,
  ISuggestionsRes,
  IPresignedUploadImagesDTO,
  TUploadImagesDTO,
} from "./user.dto";
import type { IBasicResponse } from "../../common/types";
import { UPLOAD_FIELDS } from "./user.const";

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
    getMulterInstance(MULTER_STORAGE.DISK).fields([
      { name: UPLOAD_FIELDS.IMAGE, maxCount: 1 },
      { name: UPLOAD_FIELDS.COVER_IMAGES, maxCount: 2 },
    ]),
    FILE_TYPE.IMAGE,
  ),
  validation(uploadImagesSchema),
  sendResponse<IUploadImagesRes>(async (req) => {
    const user = getAuthUser(req);
    const {
      query: { multipart },
      files,
    } = getReqData<TUploadImagesDTO>(req);

    const result = await userService.uploadImages(user.id, files, multipart);

    return result;
  }),
);

router.get(
  "/upload",
  validation(uploadPresignedUrlSchema),
  sendResponse<IPresignedUploadImagesRes>(async (req) => {
    const user = getAuthUser(req);
    const { body } = getReqData<IPresignedUploadImagesDTO>(req);

    const result = await userService.presignedUpload(user.id, body);

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

router.get(
  "/search",
  validation(searchSchema),
  sendResponse<ISearchRes>(async (req) => {
    const user = getAuthUser(req);
    const { query } = getReqData<TSearchDTO>(req);

    const result = await userService.search(user.id, query);

    return result;
  }),
);

router.get(
  "/suggestions",
  validation(suggestionsSchema),
  sendResponse<ISuggestionsRes>(async (req) => {
    const user = getAuthUser(req);
    const { query } = getReqData<TSuggestionsDTO>(req);

    const result = await userService.getSuggestions(user.id, query.limit);

    return result;
  }),
);

router.delete(
  "/",
  sendResponse<IBasicResponse>(async (req) => {
    const user = getAuthUser(req);

    const result = await userService.deleteUser(user.id);

    return result;
  }),
);

router.delete(
  "/:userId",
  requiredRoles([USER_ROLE.ADMIN]),
  validation(deleteUserSchema),
  sendResponse<IBasicResponse>(async (req) => {
    const { params } = getReqData<TDeleteUserDTO>(req);

    const result = await userService.forceDeleteUser(params.userId);

    return result;
  }),
);

export default router;
