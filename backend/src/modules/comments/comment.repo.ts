import { DatabaseRepository, IComment, Comment } from "../../database";

class CommentRepository extends DatabaseRepository<IComment> {
  constructor() {
    super(Comment);
  }
}

const commentRepository = new CommentRepository();

export { commentRepository };
