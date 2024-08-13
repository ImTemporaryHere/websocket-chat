import { User, UserModel } from "./user.model";

export class UsersRepository {
  private static readonly userModel = UserModel;

  static create(userData: User) {
    const newUser = new UserModel(userData);
    return newUser.save();
  }

  static find() {
    return this.userModel.find().exec();
  }
}
