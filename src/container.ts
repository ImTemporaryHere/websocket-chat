type Constructor<T = {}> = new (...args: any[]) => T;

class Container {
  services: Record<
    string,
    { constructor: Constructor; dependencies: string[]; instance: null | {} }
  > = {};

  register(constructor: Constructor, dependencies: Constructor[]) {
    this.services[constructor.name] = {
      constructor,
      dependencies: dependencies.map((d) => d.name),
      instance: null,
    };
  }

  get<T = Constructor>(serviceName: string): T {
    const service = this.services[serviceName];
    if (!service) {
      throw new Error(`Service ${serviceName} not found in Container`);
    }

    if (service.instance) {
      return service.instance as T;
    }
    const { constructor, dependencies } = this.services[serviceName];
    const instance = new constructor(...dependencies.map((dp) => this.get(dp)));
    return instance as T;
  }
}

export const container = new Container();
