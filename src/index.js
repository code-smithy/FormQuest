import { ActivityService } from './services/activityService.js';
import { BattleService } from './services/battleService.js';
import { InMemoryRepo } from './repositories/inMemoryRepo.js';
import { createServer } from './http/server.js';

const repo = new InMemoryRepo();
const activityService = new ActivityService(repo);
const battleService = new BattleService(repo);
const server = createServer({ activityService, battleService });

const port = Number(process.env.PORT || 3000);
server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`FormQuest Phase 2 server listening on :${port}`);
});
