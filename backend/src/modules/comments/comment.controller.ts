import { Router } from "express";
import {
  authentication,
  sendResponse,
  validation,
} from "../../common/middlewares";
import { getAuthUser, getReqData } from "../../common/helpers";
import { IBasicResponse } from "../../common/types";
import type {
  ICommentDTO,
  ICommentIdDTO,
  ICommentRes,
  ICommentsRes,
  ICreateCommentRes,
  IDeleteCommentRes,
  IGetCommentsDTO,
  IUpdateCommentDTO,
} from "./comment.dto";
import {
  commentIdSchema,
  commentSchema,
  getCommentsSchema,
  updateCommentSchema,
} from "./comment.schema";
import { commentService } from "./comment.service";

const router = Router();

router.use(authentication());

router.post(
  "/",
  validation(commentSchema),
  sendResponse<ICreateCommentRes>(async (req) => {
    const user = getAuthUser(req);
    const { body } = getReqData<ICommentDTO>(req);

    const result = await commentService.createComment(user.id, body);

    return { status: 201, ...result };
  }),
);

router.get(
  "/post/:postId",
  validation(getCommentsSchema),
  sendResponse<ICommentsRes>(async (req) => {
    const user = getAuthUser(req);
    const { params, query } = getReqData<IGetCommentsDTO>(req);

    const result = await commentService.getAllComments(
      user.id,
      params.postId,
      query,
    );

    return result;
  }),
);

router.get(
  "/:commentId",
  validation(commentIdSchema),
  sendResponse<ICommentRes>(async (req) => {
    const user = getAuthUser(req);
    const { params } = getReqData<ICommentIdDTO>(req);

    const result = await commentService.getComment(user.id, params.commentId);

    return result;
  }),
);

router.patch(
  "/:commentId",
  validation(updateCommentSchema),
  sendResponse<IBasicResponse>(async (req) => {
    const user = getAuthUser(req);
    const { body, params } = getReqData<IUpdateCommentDTO>(req);

    const result = await commentService.updateComment(
      user.id,
      params.commentId,
      body,
    );

    return result;
  }),
);

router.delete(
  "/:commentId",
  validation(commentIdSchema),
  sendResponse<IDeleteCommentRes>(async (req) => {
    const user = getAuthUser(req);
    const { params } = getReqData<ICommentIdDTO>(req);

    const result = await commentService.deleteComment(
      user.id,
      params.commentId,
    );

    return result;
  }),
);

export default router;
