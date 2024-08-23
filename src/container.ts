type Constructor<T = {}> = new (...args: any) => any;

class Container {
  services: Record<
    string,
    {
      constructor: Constructor;
      dependencies: Constructor[];
      instance: null | InstanceType<Constructor>;
    }
  > = {};

  register(constructor: Constructor, dependencies: Constructor[]) {
    this.services[constructor.name] = {
      constructor,
      dependencies,
      instance: null,
    };
  }

  get<T extends Constructor>(service: T): InstanceType<T> {
    const serviceName = service.name;
    const existingService = this.services[serviceName];
    if (!existingService) {
      throw new Error(`Service ${serviceName} not found in Container`);
    }

    if (existingService.instance) {
      return existingService.instance;
    }
    const { constructor, dependencies } = this.services[serviceName];
    const instance = new constructor(...dependencies.map((dp) => this.get(dp)));
    return instance;
  }
}

export const container = new Container();
