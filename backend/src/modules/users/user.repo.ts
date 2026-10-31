import {
  type IUser,
  type IUserVirtuals,
  User,
  DatabaseRepository,
} from "../../database";

class UserRepository extends DatabaseRepository<IUser, IUserVirtuals> {
  constructor() {
    super(User);
  }
}

const userRepository = new UserRepository();

export { userRepository };
