function positiveNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === "") {
    return fallback;
  }
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be a positive number (received "${raw}")`);
  }
  return value;
}

function port(name: string, fallback: number): number {
  const value = positiveNumber(name, fallback);
  if (!Number.isInteger(value) || value > 65535) {
    throw new RangeError(`${name} must be an integer between 1 and 65535 (received "${value}")`);
  }
  return value;
}

export const config = {
  capacity: positiveNumber("CAPACITY", 5),
  leakRate: positiveNumber("LEAK_RATE", 1),
  port: port("PORT", 3000)
};
