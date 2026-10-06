type Listener<T> = (state: T) => void;

export class Store<T> {
  private state: T;
  private listeners = new Set<Listener<T>>();

  constructor(initialState: T) {
    this.state = initialState;
  }

  public get current(): T {
    return this.state;
  }

  public set(partialState: Partial<T>): void {
    this.state = { ...this.state, ...partialState };
    this.listeners.forEach((listener) => listener(this.state));
  }

  public subscribe(listener: Listener<T>): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
