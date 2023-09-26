export interface Company {
  id: string;
  name: string;
  slug: string;
  corporateId: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface Project {
  id: string;
  name: string;
  key: string;
  companyId: string;
  createdAt: Date;
  company: Company;
  isPublic: boolean;
}
