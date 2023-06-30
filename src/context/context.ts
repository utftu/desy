type Test = (value: any, {path}: {path: string}) => string;
type TestEntity = {
  name: string;
  test: Test;
};

export class Context {
  static new() {
    return new Context()
  }
  rules: TestEntity[] = [];
}
