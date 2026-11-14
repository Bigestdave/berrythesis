export type Section = "overview" | "onchain" | "market" | "thesis" | "methodology" | "notebook" | "changelog";

export type MarketSnapshot = {
  capturedAt: string;
  market: {
    id: string;
    current_price: number;
    market_cap: number;
    market_cap_rank: number;
    total_volume: number;
    high_24h: number;
    low_24h: number;
    price_change_percentage_24h: number;
    market_cap_change_percentage_24h: number;
    circulating_supply: number;
    total_supply: number;
    last_updated: string;
  };
  history: {
    prices: number[][];
    market_caps: number[][];
    total_volumes: number[][];
  };
  tvl: { date: number; tvl: number }[];
  sources: { name: string; url: string; fetchedAt: string }[];
};

export type Thesis = {
  id: string;
  hypothesis: string;
  supporting: string;
  contradicting: string;
  invalidation: string;
  stance: string;
  updatedAt: string;
};

export type ResearchNote = {
  id: string;
  title: string;
  body: string;
  category: string;
  createdAt: string;
};

export type ResearchRun = {
  id: string;
  status: string;
  sourceCount: number;
  detail: string;
  createdAt: string;
};

export type Workspace = {
  snapshot: MarketSnapshot;
  thesis: Thesis;
  notes: ResearchNote[];
  runs: ResearchRun[];
};

export type OnchainRow = {
  date: string;
  active_accounts: number;
  transactions: number;
  active_contracts?: number;
};

export type OnchainDataset = {
  rows: OnchainRow[];
  importedAt: string;
  source: string;
};
