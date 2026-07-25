import { createServer } from "./server.js";
import { config } from "./config.js";

const app = createServer(config.capacity, config.leakRate);

app.listen(config.port, () => {
  console.log(
    `Rate limiter listening on port ${config.port} (capacity=${config.capacity}, leakRate=${config.leakRate})`
  );
});
