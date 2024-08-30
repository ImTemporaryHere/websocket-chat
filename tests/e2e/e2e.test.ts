import request from "supertest";
import { io, Socket } from "socket.io-client";
import { User } from "../../src/users/user.model";
import { TransportTopics } from "../../src/transports/transport-topics";
import { GroupMessageInterface } from "../../src/groups/interfaces/group-message.interface";
import { CreateGroupDto } from "../../src/groups/dto/create-group.dto";
import { UserJoinGroupPayload } from "../../src/groups/interfaces/user-join-group-payload.interface";

const baseUrl = `http://localhost:3000`;

const firstUserAuthData: User = {
  email: "user1@example.com",
  password: "password123",
};
const secondUserAuthData: User = {
  email: "user2@example.com",
  password: "password123456789",
};

const firstUserGroupMessage = "its a firstUserGroupMessage";
const secondUserGroupMessage = "its a secondUserGroupMessage";

describe("E2E Tests", () => {
  let firstUserId: string;
  let firstUserAccessToken: string;
  let secondUserId: string;
  let secondUserAccessToken: string;
  let firstUserSocket: Socket;
  let secondUserSocket: Socket;
  let firstGroupId: string;
  let secondGroupId: string;

  afterAll(() => {
    firstUserSocket.disconnect();
    secondUserSocket.disconnect();
  });

  test("Create first user", async () => {
    const response = await request(baseUrl)
      .post("/api/users")
      .send(firstUserAuthData)
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
      .post("/api/users")
      .send(secondUserAuthData)
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
      .post("/api/users")
      .send(secondUserAuthData)
      .expect(400);

    expect(response.body.message).toBe("duplicate email");
  });

  test("user can log in", async () => {
    const response = await request(baseUrl)
      .post("/api/login")
      .send(secondUserAuthData)
      .expect(200);

    const { userId, accessToken } = response.body;
    expect(userId).toBe(secondUserId);
    expect(typeof accessToken).toBe("string");
  });

  test("not authenticated user cant access protected route", async () => {
    await request(baseUrl).get("/api/users").expect(401);
  });

  test("authenticated user can access protected route", async () => {
    await request(baseUrl)
      .get("/api/users")
      .set("Authorization", `Bearer ${secondUserAccessToken}`)
      .expect(200);
  });

  test("not authenticated user cant connect io server", async () => {
    const socket = io(baseUrl, {
      reconnectionDelayMax: 10000,
    });

    await new Promise((res, rej) => {
      socket.on("connect_error", (err) => {
        expect(err.message).toBe("not authorized");
        return res(0);
      });
    });
  });

  test("first user can connect to io server", async () => {
    const socket = io(baseUrl, {
      reconnectionDelayMax: 10000,
      extraHeaders: {
        access_token: firstUserAccessToken,
      },
    });

    firstUserSocket = socket;

    await new Promise((res, rej) => {
      socket.on("connect", () => {
        const interval = setInterval(() => {
          if (socket.connected) {
            clearInterval(interval);
            return res(0);
          }
        }, 10);
      });
    });
  });

  test("second user can connect to io server", async () => {
    const socket = io(baseUrl, {
      reconnectionDelayMax: 10000,
      extraHeaders: {
        access_token: secondUserAccessToken,
      },
    });

    secondUserSocket = socket;

    await new Promise((res, rej) => {
      socket.on("connect", () => {
        const interval = setInterval(() => {
          if (socket.connected) {
            clearInterval(interval);
            return res(0);
          }
        }, 10);
      });
    });
  });

  test("user can create group", async () => {
    const [userAddedToGroupPromise, resolveUserAddedToGroupCb] =
      getPromiseWithResolveCb("userAddedToGroup", 2000);

    secondUserSocket.once(
      TransportTopics.userAddedToGroup,
      (createdGroupId) => {
        if (firstGroupId) {
          expect(firstGroupId).toBe(createdGroupId);
        } else {
          firstGroupId = createdGroupId;
        }
        resolveUserAddedToGroupCb(0);
      },
    );

    const createdGroupId = await userSocketCreateGroup(
      firstUserSocket,
      [secondUserId],
      1000,
    );
    expect(typeof createdGroupId).toBe("string");
    if (firstGroupId) {
      expect(firstGroupId).toBe(createdGroupId);
    } else {
      firstGroupId = createdGroupId;
    }

    await userAddedToGroupPromise;
  });

  test("users in same group can send and receive group messages", async () => {
    const [groupMessageSentPromise, resolveGroupMessageSentCb] =
      getPromiseWithResolveCb("groupMessageSent", 2000);

    firstUserSocket.once(
      TransportTopics.groupMessageSent,
      (data: GroupMessageInterface) => {
        expect(data.groupId).toBe(firstGroupId);
        expect(data.senderId).toBe(secondUserId);
        expect(data.message).toBe(secondUserGroupMessage);
        resolveGroupMessageSentCb();
      },
    );
    const groupMessageToBeSent: GroupMessageInterface = {
      message: secondUserGroupMessage,
      groupId: firstGroupId,
      senderId: secondUserId,
    };
    secondUserSocket.emit(
      TransportTopics.sendGroupMessage,
      groupMessageToBeSent,
    );

    await groupMessageSentPromise;
  });

  test("user can remove group", async () => {
    const [groupRemovedPromise, resolveGroupRemovedCb] =
      getPromiseWithResolveCb("groupRemoved", 2000);

    firstUserSocket.once(TransportTopics.groupRemoved, (removedGroupId) => {
      expect(removedGroupId).toBe(firstGroupId);
      resolveGroupRemovedCb();
    });

    firstUserSocket.emit(TransportTopics.removeGroup, firstGroupId);

    await groupRemovedPromise;
  });

  test("messages can't be delivered in removed group", async () => {
    const [groupMessageSentPromise, resolveGroupMessageSentCb] =
      getPromiseWithResolveCb("groupMessageSent", 2000);

    firstUserSocket.once(
      TransportTopics.groupMessageSent,
      (data: GroupMessageInterface) => {
        if (firstGroupId === data.groupId) {
          throw new Error("message was delivered in removed group");
        }
      },
    );
    const groupMessageToBeSent: GroupMessageInterface = {
      message: secondUserGroupMessage,
      groupId: firstGroupId,
      senderId: secondUserId,
    };
    secondUserSocket.emit(
      TransportTopics.sendGroupMessage,
      groupMessageToBeSent,
    );
    setTimeout(() => {
      resolveGroupMessageSentCb();
    }, 1000);
    await groupMessageSentPromise;
  });

  test("user can join already created group", async () => {
    secondGroupId = await userSocketCreateGroup(firstUserSocket, [], 1000);

    const userAddedToGroupPromise = new Promise((resolve, reject) => {
      secondUserSocket.once(
        TransportTopics.userJoinedGroup,
        ({ groupId: joinedGroupId }: UserJoinGroupPayload) => {
          expect(joinedGroupId).toBe(secondGroupId);
          resolve(0);
        },
      );
    });

    secondUserSocket.emit(TransportTopics.joinGroup, secondGroupId);

    await userAddedToGroupPromise;
  });

  test("user can leave group", (cb) => {
    const expectedMessage = `user ${secondUserId} left the group`;

    firstUserSocket.once(
      TransportTopics.groupMessageSent,
      ({ message, groupId }: GroupMessageInterface) => {
        expect(message).toBe(expectedMessage);
        expect(groupId).toBe(secondGroupId);
        cb();
      },
    );

    secondUserSocket.emit(TransportTopics.leaveGroup, secondGroupId);
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
    .delete(`/api/users/${userId}`)
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(204);
}

function getPromiseWithResolveCb(promiseName: string, timeout: number) {
  let resolveCb;
  const promise = new Promise((res, rej) => {
    const _timeout = setTimeout(() => {
      rej(`${promiseName} timeout`);
    }, timeout);
    resolveCb = () => {
      clearTimeout(_timeout);
      res(0);
    };
  });
  return [promise, resolveCb];
}

function userSocketCreateGroup(
  socket: Socket,
  participantsId: string[],
  timeout: number,
): Promise<string> {
  return new Promise((res, rej) => {
    const timer = setTimeout(() => {
      rej("group was not created in time");
    }, timeout);
    socket.once(TransportTopics.groupCreated, (createdGroupId) => {
      clearTimeout(timer);
      res(createdGroupId);
    });

    const createGroupData: CreateGroupDto = {
      name: "just a new group",
      participantsId,
    };
    socket.emit(TransportTopics.createGroup, createGroupData);
  });
}
