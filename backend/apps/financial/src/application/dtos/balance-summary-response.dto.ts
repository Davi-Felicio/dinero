export class BalanceSummaryPeriodDto {
  startDate!: string | null;
  endDate!: string | null;
}

export class BalanceSummaryResponseDto {
  totalIncome!: number;
  totalExpenses!: number;
  balance!: number;
  currency!: string;
  period!: BalanceSummaryPeriodDto;
}
