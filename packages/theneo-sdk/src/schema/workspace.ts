export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
}

export interface Workspace {
  /**
   * Workspace ID
   */
  workspaceId: string;
  /**
   * Workspace name
   */
  name: string;
  /**
   * Workspace slug / key - used to identify the workspace in URL
   */
  slug: string;
  /**
   * Workspace role
   */
  role: UserRole;
  /**
   * Is the workspace the default workspace, for the user
   */
  isDefault: boolean;
  isCorporate: boolean;
  isSubscribed: boolean;
}
