export interface EconomicTrends {
  fedFundsRate: string;
  nextFomcMeeting: string;
  rateDecisionProbability: {
    hike: string;
    hold: string;
    cut: string;
  };
  fedBalanceSheet: string;
  inflation: {
    cpi: { yoy: string; mom: string };
    coreCpi: string;
    pce: string;
    nextRelease: string;
  };
  dxyIndex: string;
  laborMarket: {
    unemploymentRate: string;
    nonFarmPayrolls: string;
  };
  lastUpdated: string;
}
