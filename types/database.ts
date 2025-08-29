export type FilterOperator =
  | 'contains'
  | 'is'
  | 'is_not'
  | 'starts_with'
  | 'ends_with'
  | 'greater_than'
  | 'less_than'
  | 'greater_equal'
  | 'less_equal'
  | 'before'
  | 'after';

export interface FilterCondition {
  id: string;
  field: string;
  operator: FilterOperator;
  value?: string | number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
}
