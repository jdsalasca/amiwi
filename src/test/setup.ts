class MemoryStorage implements Storage {
  private data = new Map<string, string>();

  get length(): number {
    return this.data.size;
  }

  clear(): void {
    this.data.clear();
  }

  getItem(key: string): string | null {
    return this.data.has(key) ? this.data.get(key) ?? null : null;
  }

  key(index: number): string | null {
    return Array.from(this.data.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }

  setItem(key: string, value: string): void {
    this.data.set(key, String(value));
  }
}

const currentStorage = (globalThis as { localStorage?: Storage }).localStorage;
if (
  !currentStorage ||
  typeof currentStorage.getItem !== "function" ||
  typeof currentStorage.setItem !== "function" ||
  typeof currentStorage.removeItem !== "function" ||
  typeof currentStorage.clear !== "function"
) {
  Object.defineProperty(globalThis, "localStorage", {
    value: new MemoryStorage(),
    writable: true,
    configurable: true,
  });
}
