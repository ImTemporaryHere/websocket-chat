export function getPromiseWithResolveCb(promiseName: string, timeout: number) {
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
