import { Types } from "mongoose";
import { ForbiddenException, NotFoundException } from "../../common/exceptions";
import { toObjectId } from "../../common/helpers";
import type { IBasicResponse } from "../../common/types";
import { AUTHOR_FIELDS, postService } from "../posts";
import { IAuthor } from "../posts/post.dto";
import type {
  ICommentDTO,
  ICommentRes,
  ICommentsRes,
  ICreateCommentRes,
  IDeleteCommentRes,
  IGetCommentsDTO,
  IPostWithAuthor,
  IUpdateCommentDTO,
} from "./comment.dto";
import { commentRepository } from "./comment.repo";

class CommentService {
  async createComment(
    userId: string,
    commentData: ICommentDTO["body"],
  ): Promise<ICreateCommentRes> {
    const { author } = await postService.getPostWithAuthor(commentData.postId);

    await postService.checkRelation(userId, author);

    const comment = await commentRepository.create({
      content: commentData.content,
      post: toObjectId(commentData.postId),
      author: toObjectId(userId),
    });

    return {
      message: "Comment created successfully",
      data: { id: comment.id },
    };
  }

  async getAllComments(
    userId: string,
    postId: string,
    { page, limit }: IGetCommentsDTO["query"],
  ): Promise<ICommentsRes> {
    const { post, author } = await postService.getPostWithAuthor(postId);

    await postService.checkRelation(userId, author);

    const { data, pagination } = await commentRepository.findAndPaginate(
      { post: postId },
      undefined,
      { page, limit, populate: { path: "author", select: AUTHOR_FIELDS } },
    );

    const comments = data.map(({ id: commentId, content, author }) => {
      const { id, name, privacy } = author as unknown as IAuthor;

      return { id: commentId, content, author: { id, name, privacy } };
    });

    return {
      message: "Comments retrieved successfully",
      data: comments,
      post: {
        id: post.id,
        title: post.title,
        content: post.content,
        author,
      },
      pagination,
    };
  }

  async getComment(userId: string, commentId: string): Promise<ICommentRes> {
    const comment = await commentRepository.findById(commentId, undefined, {
      populate: [
        { path: "author", select: AUTHOR_FIELDS },
        {
          path: "post",
          select: "id title content author",
          populate: { path: "author", select: AUTHOR_FIELDS },
        },
      ],
    });

    if (!comment) {
      throw new NotFoundException("Comment not found");
    }

    const {
      id: commentAuthorId,
      name,
      privacy,
    } = comment.author as unknown as IAuthor;
    const {
      id: postId,
      title,
      content,
      author: postAuthor,
    } = comment.post as unknown as IPostWithAuthor;

    await postService.checkRelation(userId, postAuthor);

    return {
      message: "Comment retrieved successfully",
      data: {
        id: comment.id,
        content: comment.content,
        author: { id: commentAuthorId, name, privacy },
        post: {
          id: postId,
          title,
          content,
          author: {
            id: postAuthor.id,
            name: postAuthor.name,
            privacy: postAuthor.privacy,
          },
        },
      },
    };
  }

  async updateComment(
    userId: string,
    commentId: string,
    commentData: IUpdateCommentDTO["body"],
  ): Promise<IBasicResponse> {
    const comment = await commentRepository.findById(commentId);

    if (!comment) {
      throw new NotFoundException("Comment not found");
    }

    if (comment.author.toString() !== userId) {
      throw new ForbiddenException(
        "You are not allowed to update this comment",
      );
    }

    comment.content = commentData.content;

    await comment.save();

    return { message: "Comment updated successfully" };
  }

  async deleteComment(
    userId: string,
    commentId: string,
  ): Promise<IDeleteCommentRes> {
    const comment = await commentRepository.findById(commentId, undefined, {
      populate: { path: "post", select: "author" },
    });

    if (!comment) {
      throw new NotFoundException("Comment not found");
    }

    const { author: postAuthor } = comment.post as unknown as {
      author: Types.ObjectId;
    };

    const isAuthor = comment.author.toString() === userId;
    const isPostAuthor = postAuthor.toString() === userId;
    if (!isAuthor && !isPostAuthor) {
      throw new ForbiddenException(
        "You are not allowed to delete this comment",
      );
    }

    await commentRepository.deleteOne({ _id: commentId });

    return { message: "Comment deleted successfully", isAuthor, isPostAuthor };
  }
}

const commentService = new CommentService();

export { commentService };
