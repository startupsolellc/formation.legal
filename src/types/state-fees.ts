export interface StateFeeData {
  name: string;
  formation_fee: number;
  annual_report_fee: number;
  annual_report_due_date: string;
  state_income_tax_rate: number;
  official_link: string;
}

export interface StateFeesDataset {
  schema_version: string;
  last_updated: string;
  maintained_by: string;
  license: string;
  states: Record<string, StateFeeData>;
}
