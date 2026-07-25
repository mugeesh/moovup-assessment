export const config = {
  capacity: Number(process.env.CAPACITY ?? 5),
  leakRate: Number(process.env.LEAK_RATE ?? 1),
  port: Number(process.env.PORT ?? 3000)
};
