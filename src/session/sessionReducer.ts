import { validateProject } from '../domain/validation/validateProject';
import { createSessionReducer } from './createSessionReducer';

/** Default reducer for bundled fixtures — uses validateProject when imported evaluate is never reached. */
export const sessionReducer = createSessionReducer({
  importedProjectValidator: validateProject,
});

export { createSessionReducer } from './createSessionReducer';
