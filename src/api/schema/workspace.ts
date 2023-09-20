enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
}

export interface Workspace {
  workspaceId: string;
  name: string;
  slug: string;
  role: UserRole;
  isDefault: boolean;
  isCorporate: boolean;
  isSubscribed: boolean;
}
