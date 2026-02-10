export interface MarketDetails {
  dayLow?: number;
  dayHigh?: number;
  yearLow?: number;
  yearHigh?: number;
  priceAvg50?: number;
  priceAvg200?: number;
  volume?: number;
  open?: number;
  previousClose?: number;
}

export interface TrendValue {
  current: string;
  previous: string[]; // Last 3 historical values
  indicator: 'up' | 'down' | 'neutral';
  sentiment: 'bullish' | 'bearish' | 'neutral';
  details?: MarketDetails;
}

export interface EconomicTrends {
  fomc: {
    nextMeeting: string;
    previousMeetings: string[];
    sentiment: string;
  };
  interestRate: TrendValue;
  inflation: {
    cpi: TrendValue;
    coreCpi: TrendValue;
    pce: TrendValue;
    nextRelease: string;
  };
  jobsData: {
    unemployment: TrendValue;
    nonFarmPayrolls: TrendValue;
  };
  goldPrice: TrendValue;
  dxyIndex: TrendValue;
  btcDominance: TrendValue;
  etfFlows: {
    dailyNet: TrendValue;
    totalWeekly: string;
  };
  riskIndicators: {
    vix: TrendValue;
    fearGreed: TrendValue;
  };
  fedBalanceSheet: TrendValue & {
    mode: 'QE' | 'QT' | 'Neutral';
  };
  lastUpdated: string;
}
