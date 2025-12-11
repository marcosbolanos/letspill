import { z } from '@hono/zod-openapi';

import { userProfilesSelectSchema } from '../user-profiles/user.profiles.types';
import { userPreferencesSelectSchema } from '../user-preferences/user-preferences.types';
import { pillStatesSchema } from '../pill-events/pill-events.types';

export const loadDataSchema = z.object({
  profile: userProfilesSelectSchema,
  viewedPreferences: userPreferencesSelectSchema,
  viewedPillStates: pillStatesSchema,
})

