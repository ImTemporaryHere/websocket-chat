import { io, Socket } from "socket.io-client";
import { testCreateUser } from "./auth-e2e.test";
import { getRandomUserData } from "../test-utils/generators";
import { testConnectToSocket } from "./sockeio-server-auth.test";
import { getPromiseWithResolveCb } from "../test-utils/utils";
import { TransportTopics } from "../../src/transports/transport-topics";
import { GroupMessageInterface } from "../../src/groups/interfaces/group-message.interface";
import { CreateGroupDto } from "../../src/groups/dto/create-group.dto";

const baseUrl = `http://localhost:3000`;

const secondUserGroupMessage = "its a secondUserGroupMessage";

describe("group-create e2e", () => {
  let secondUserId: string;

  let firstUserAccessToken: string;
  let secondUserAccessToken: string;

  let firstUserSocket: Socket;
  let secondUserSocket: Socket;

  let groupId: string;

  beforeAll(async () => {
    const firstUserData = await testCreateUser(getRandomUserData(), baseUrl);
    firstUserAccessToken = firstUserData.accessToken;

    const secondUserData = await testCreateUser(getRandomUserData(), baseUrl);
    secondUserId = secondUserData.userId;
    secondUserAccessToken = secondUserData.accessToken;

    firstUserSocket = await testConnectToSocket({
      baseUrl,
      access_token: firstUserAccessToken,
    });
    secondUserSocket = await testConnectToSocket({
      baseUrl,
      access_token: secondUserAccessToken,
    });
  });

  afterAll(() => {
    firstUserSocket.disconnect();
    secondUserSocket.disconnect();
  });

  test("user can create group with participants", async () => {
    const [userAddedToGroupPromise, resolveUserAddedToGroupCb] =
      getPromiseWithResolveCb("userAddedToGroup", 2000);

    secondUserSocket.once(
      TransportTopics.userAddedToGroup,
      (createdGroupId) => {
        if (groupId) {
          expect(groupId).toBe(createdGroupId);
        } else {
          groupId = createdGroupId;
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
    if (groupId) {
      expect(groupId).toBe(createdGroupId);
    } else {
      groupId = createdGroupId;
    }

    await userAddedToGroupPromise;
  });

  test("users in same group can send and receive group messages", async () => {
    const [groupMessageSentPromise, resolveGroupMessageSentCb] =
      getPromiseWithResolveCb("groupMessageSent", 2000);

    firstUserSocket.once(
      TransportTopics.groupMessageSent,
      (data: GroupMessageInterface) => {
        expect(data.groupId).toBe(groupId);
        expect(data.senderId).toBe(secondUserId);
        expect(data.message).toBe(secondUserGroupMessage);
        resolveGroupMessageSentCb();
      },
    );
    const groupMessageToBeSent: GroupMessageInterface = {
      message: secondUserGroupMessage,
      groupId: groupId,
      senderId: secondUserId,
    };
    secondUserSocket.emit(
      TransportTopics.sendGroupMessage,
      groupMessageToBeSent,
    );

    await groupMessageSentPromise;
  });
});

export function userSocketCreateGroup(
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
