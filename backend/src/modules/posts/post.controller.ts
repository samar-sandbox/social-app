import { Router } from "express";
import {
  authentication,
  sendResponse,
  validation,
} from "../../common/middlewares";
import {
  postSchema,
  getPostsSchema,
  postIdSchema,
  updatePostSchema,
} from "./post.schema";
import { getAuthUser, getReqData } from "../../common/helpers";
import type {
  IGetPostsDTO,
  IPostDTO,
  IPostIdDTO,
  ICreatePostRes,
  IPostsRes,
  IUpdatePostDTO,
  IPostRes,
} from "./post.dto";
import { postService } from "./post.service";
import { IBasicResponse } from "../../common/types";

const router = Router();

router.use(authentication());

router.post(
  "/",
  validation(postSchema),
  sendResponse<ICreatePostRes>(async (req) => {
    const user = getAuthUser(req);
    const { body } = getReqData<IPostDTO>(req);

    const result = await postService.createPost(user.id, body);

    return { status: 201, ...result };
  }),
);

router.get(
  "/all{/:userId}",
  validation(getPostsSchema),
  sendResponse<IPostsRes>(async (req) => {
    const user = getAuthUser(req);
    const { params, query } = getReqData<IGetPostsDTO>(req);

    const result = await postService.getAllPosts(user.id, query, params.userId);

    return result;
  }),
);

router.get(
  "/:postId",
  validation(postIdSchema),
  sendResponse<IPostRes>(async (req) => {
    const user = getAuthUser(req);
    const { params } = getReqData<IPostIdDTO>(req);

    const result = await postService.getPost(user.id, params.postId);

    return result;
  }),
);

router.patch(
  "/:postId",
  validation(updatePostSchema),
  sendResponse<IBasicResponse>(async (req) => {
    const user = getAuthUser(req);
    const { body, params } = getReqData<IUpdatePostDTO>(req);

    const result = await postService.updatePost(user.id, params.postId, body);

    return result;
  }),
);

router.delete(
  "/:postId",
  validation(postIdSchema),
  sendResponse<IBasicResponse>(async (req) => {
    const user = getAuthUser(req);
    const { params } = getReqData<IPostIdDTO>(req);

    const result = await postService.deletePost(user.id, params.postId);

    return result;
  }),
);

export default router;
