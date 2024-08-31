import { io, Socket } from "socket.io-client";
import { testCreateUser } from "./auth-e2e.test";
import { getRandomUserData } from "../test-utils/generators";
import { testConnectToSocket } from "./sockeio-server-auth.test";
import { userSocketCreateGroup } from "./group-create.test";
import { TransportTopics } from "../../src/transports/transport-topics";
import { UserJoinGroupPayload } from "../../src/groups/interfaces/user-join-group-payload.interface";
import { GroupMessageInterface } from "../../src/groups/interfaces/group-message.interface";

const baseUrl = `http://localhost:3000`;

describe("group-join-leave e2e", () => {
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

    groupId = await userSocketCreateGroup(firstUserSocket, [], 1000);
  });

  afterAll(() => {
    firstUserSocket.disconnect();
    secondUserSocket.disconnect();
  });

  test("user can join already created group", async () => {
    const userAddedToGroupPromise = new Promise((resolve, reject) => {
      secondUserSocket.once(
        TransportTopics.userJoinedGroup,
        ({ groupId: joinedGroupId }: UserJoinGroupPayload) => {
          expect(joinedGroupId).toBe(groupId);
          resolve(0);
        },
      );
    });

    secondUserSocket.emit(TransportTopics.joinGroup, groupId);

    await userAddedToGroupPromise;
  });

  test("user can leave group", (cb) => {
    const expectedMessage = `user ${secondUserId} left the group`;

    firstUserSocket.once(
      TransportTopics.groupMessageSent,
      ({ message, groupId }: GroupMessageInterface) => {
        expect(message).toBe(expectedMessage);
        expect(groupId).toBe(groupId);
        cb();
      },
    );

    secondUserSocket.emit(TransportTopics.leaveGroup, groupId);
  });
});
