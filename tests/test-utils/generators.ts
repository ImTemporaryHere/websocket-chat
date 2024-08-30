import { User } from "../../src/users/user.model";

export function getRandomUserData(): User {
  return {
    email: `asdf${Math.random()}@gmail.com`,
    password: "aaaaaaaaaaaaaa",
  };
}
