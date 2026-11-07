import { DatabaseRepository, Post, type IPost } from "../../database";

class PostRepository extends DatabaseRepository<IPost> {
  constructor() {
    super(Post);
  }
}

const postRepository = new PostRepository();

export { postRepository };
