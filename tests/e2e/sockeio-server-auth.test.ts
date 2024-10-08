import { io, Socket } from "socket.io-client";
import { testCreateUser } from "./auth-e2e.test";
import { getRandomUserData } from "../test-utils/generators";

const baseUrl = `http://localhost:3000`;

describe("socket auth e2e", () => {
  let firstUserAccessToken: string;
  let secondUserAccessToken: string;

  let firstUserSocket: Socket;
  let secondUserSocket: Socket;

  beforeAll(async () => {
    const firstUserData = await testCreateUser(getRandomUserData(), baseUrl);
    firstUserAccessToken = firstUserData.accessToken;

    const secondUserData = await testCreateUser(getRandomUserData(), baseUrl);
    secondUserAccessToken = secondUserData.accessToken;
  });

  afterAll(() => {
    firstUserSocket.disconnect();
    secondUserSocket.disconnect();
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
    firstUserSocket = await testConnectToSocket({
      baseUrl,
      access_token: firstUserAccessToken,
    });
  });

  test("second user can connect to io server", async () => {
    secondUserSocket = await testConnectToSocket({
      baseUrl,
      access_token: secondUserAccessToken,
    });
  });
});

export async function testConnectToSocket({
  baseUrl,
  access_token,
}: {
  baseUrl: string;
  access_token: string;
}): Promise<Socket> {
  const socket = io(baseUrl, {
    reconnectionDelayMax: 10000,
    extraHeaders: {
      Authorization: access_token,
    },
  });

  return new Promise((res, rej) => {
    socket.on("connect", () => {
      const interval = setInterval(() => {
        if (socket.connected) {
          clearInterval(interval);
          return res(socket);
        }
      }, 10);
    });
  });
}
