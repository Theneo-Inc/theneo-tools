export interface Company {
  id: string;
  name: string;
  slug: string;
  corporateID: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface Project {
  id: string;
  name: string;
  key: string;
  companyID: string;
  createdAt: Date;
  company: Company;
}
