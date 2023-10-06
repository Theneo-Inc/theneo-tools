export interface ResponseSchema<T> {
  data: T;
  message: string;
}

export enum DescriptionGenerationType {
  FILl = 'fill',
  OVERWRITE = 'overwrite',
  NO_GENERATION = 'no_generation',
}
