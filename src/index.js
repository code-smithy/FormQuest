import { ActivityService } from './services/activityService.js';
import { InMemoryRepo } from './repositories/inMemoryRepo.js';
import { createServer } from './http/server.js';

const repo = new InMemoryRepo();
const service = new ActivityService(repo);
const server = createServer(service);

const port = Number(process.env.PORT || 3000);
server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`FormQuest Phase 1 server listening on :${port}`);
});
