import { FOLLOW_STATUS, PROFILE_PRIVACY } from "../../common/enums";
import { ForbiddenException, NotFoundException } from "../../common/exceptions";
import { toObjectId } from "../../common/helpers";
import type { IBasicResponse } from "../../common/types";
import type { TPostHydratedDoc } from "../../database/types/post.type";
import { followRepository } from "../follow";
import { userService } from "../users";
import type {
  IPostDTO,
  ICreatePostRes,
  IPostsRes,
  IUpdatePostDTO,
  IGetPostsDTO,
  IPostRes,
  IAuthor,
} from "./post.dto";
import { postRepository } from "./post.repo";
import { AUTHOR_FIELDS } from "./post.const";

class PostService {
  async getPostWithAuthor(
    postId: string,
  ): Promise<{ post: TPostHydratedDoc; author: IAuthor }> {
    const post = await postRepository.findById(postId, undefined, {
      populate: {
        path: "author",
        select: AUTHOR_FIELDS,
      },
    });

    if (!post) {
      throw new NotFoundException("Post not found");
    }

    const { id, name, privacy } = post.author as unknown as IAuthor;

    return { post, author: { id, name, privacy } };
  }

  async checkRelation(userId: string, author: IAuthor) {
    if (author.id !== userId && author.privacy === PROFILE_PRIVACY.PRIVATE) {
      const relation = await followRepository.findOne({
        $or: [
          { follower: userId, following: author.id },
          { follower: author.id, following: userId },
        ],
      });

      if (!relation || relation.status !== FOLLOW_STATUS.ACCEPTED) {
        throw new ForbiddenException("You are not allowed to view this post");
      }
    }
  }

  async createPost(
    userId: string,
    postData: IPostDTO["body"],
  ): Promise<ICreatePostRes> {
    const post = await postRepository.create({
      title: postData.title,
      content: postData.content,
      author: toObjectId(userId),
    });

    return {
      message: "Post created successfully",
      data: { id: post.id },
    };
  }

  async getAllPosts(
    userId: string,
    { page, limit }: IGetPostsDTO["query"],
    targetId?: string,
  ): Promise<IPostsRes> {
    let id = userId;

    let postAuthor: IAuthor | undefined;
    if (targetId && targetId !== userId) {
      const target = await userService.getActiveUser(targetId);

      if (target.privacy === PROFILE_PRIVACY.PRIVATE) {
        throw new ForbiddenException("Target user's profile is private");
      }

      id = targetId;
      postAuthor = {
        id: target.id,
        name: target.name,
        privacy: target.privacy ?? PROFILE_PRIVACY.PUBLIC,
      };
    }

    const { data, pagination } = await postRepository.findAndPaginate(
      { author: id },
      undefined,
      { page, limit },
    );

    return {
      message: "Posts retrieved successfully",
      author: postAuthor,
      data: data.map(({ id, title, content }) => ({ id, title, content })),
      pagination,
    };
  }

  async getPost(userId: string, postId: string): Promise<IPostRes> {
    const { post, author } = await this.getPostWithAuthor(postId);

    await this.checkRelation(userId, author);

    return {
      message: "Post retrieved successfully",
      data: {
        id: post.id,
        title: post.title,
        content: post.content,
        author,
      },
    };
  }

  async updatePost(
    userId: string,
    postId: string,
    postData: IUpdatePostDTO["body"],
  ): Promise<IBasicResponse> {
    const post = await postRepository.findById(postId);

    if (!post) {
      throw new NotFoundException("Post not found");
    }

    if (post.author.toString() !== userId) {
      throw new ForbiddenException("You are not allowed to update this post");
    }

    post.title = postData.title ?? post.title;
    post.content = postData.content ?? post.content;

    await post.save();

    return { message: "Post updated successfully" };
  }

  async deletePost(userId: string, postId: string): Promise<IBasicResponse> {
    const { author } = await this.getPostWithAuthor(postId);

    if (author.id !== userId) {
      throw new ForbiddenException("You are not allowed to delete this post");
    }

    await postRepository.deleteOne({ _id: postId });

    return { message: "Post deleted successfully" };
  }
}

const postService = new PostService();

export { postService };
