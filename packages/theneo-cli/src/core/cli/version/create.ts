import { ProjectVersion, Theneo } from '@theneo/sdk';

export async function createNewProjectVersion(
  theneo: Theneo,
  projectId: string,
  version: ProjectVersion | null,
  projectVersion: string | undefined
): Promise<string | undefined> {
  let projectVersionId = version?.id;
  if (!version && projectVersion) {
    console.log('Creating new version with name:', projectVersion);
    const createVersionResult = await theneo.createProjectVersion({
      projectId,
      name: projectVersion,
      isEmpty: true,
      isNewVersion: true,
    });

    if (createVersionResult.err) {
      console.error(createVersionResult.error.message);
      process.exit(1);
    }
    projectVersionId = createVersionResult.value.id;
  }
  return projectVersionId;
}
