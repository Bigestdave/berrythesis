-- GoogleSQL · NEAR mainnet · UTC
-- Set DATE parameters start_date and end_date. End date is exclusive.
-- BigQuery execution may incur charges in your Google Cloud project.
SELECT
  block_date AS date,
  COUNT(DISTINCT signer_account_id) AS active_accounts,
  COUNT(*) AS transactions
FROM `bigquery-public-data.crypto_near_mainnet_us.transactions`
WHERE block_date >= @start_date
  AND block_date < @end_date
GROUP BY block_date
ORDER BY block_date;
