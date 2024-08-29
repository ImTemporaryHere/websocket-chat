import request from "supertest";
import { io as ClientIo, Socket } from "socket.io-client";
import { User } from "../../src/users/user.model";

const baseUrl = `http://localhost:3000/api`;

const firstUserData: User = {
  email: "user1@example.com",
  password: "password123",
};
const secondUserData: User = {
  email: "user2@example.com",
  password: "password123456789",
};

describe("E2E Tests", () => {
  let firstUserId: string;
  let firstUserAccessToken: string;
  let secondUserId: string;
  let secondUserAccessToken: string;

  test("Create first user", async () => {
    const response = await request(baseUrl)
      .post("/users")
      .send(firstUserData)
      .expect(201);

    const { userId, accessToken } = response.body;
    expect(typeof userId).toBe("string");
    expect(typeof accessToken).toBe("string");

    firstUserId = userId;
    firstUserAccessToken = accessToken;
  });

  test("Create second user", async () => {
    // Create users
    const response = await request(baseUrl)
      .post("/users")
      .send(secondUserData)
      .expect(201);

    const { userId, accessToken } = response.body;
    expect(typeof userId).toBe("string");
    expect(typeof accessToken).toBe("string");

    secondUserId = userId;
    secondUserAccessToken = accessToken;
  });

  test("user with existing email cant be created", async () => {
    // Create users
    const response = await request(baseUrl)
      .post("/users")
      .send(secondUserData)
      .expect(400);

    expect(response.body.message).toBe("duplicate email");
  });

  test("user can log in", async () => {
    const response = await request(baseUrl)
      .post("/login")
      .send(secondUserData)
      .expect(200);

    const { userId, accessToken } = response.body;
    expect(userId).toBe(secondUserId);
    expect(typeof accessToken).toBe("string");
  });

  test("not authenticated user cant access protected route", async () => {
    await request(baseUrl).get("/users").expect(401);
  });

  test("authenticated user can access protected route", async () => {
    await request(baseUrl)
      .get("/users")
      .set("Authorization", `Bearer ${secondUserAccessToken}`)
      .expect(200);
  });

  test("users can be deleted", async () => {
    await Promise.allSettled([
      deleteUser(firstUserId, firstUserAccessToken),
      deleteUser(secondUserId, secondUserAccessToken),
    ]);
  });
});

async function deleteUser(userId: string, accessToken: string) {
  await request(baseUrl)
    .delete(`/users/${userId}`)
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(204);
}
