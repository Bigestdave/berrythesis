-- GoogleSQL · Windowed repeat activity, not lifetime user retention.
WITH daily_signers AS (
  SELECT DISTINCT block_date, signer_account_id
  FROM `bigquery-public-data.crypto_near_mainnet_us.transactions`
  WHERE block_date >= @start_date
    AND block_date < @end_date
), first_seen AS (
  SELECT signer_account_id, MIN(block_date) AS first_day
  FROM daily_signers
  GROUP BY signer_account_id
)
SELECT
  d.block_date AS date,
  COUNT(*) AS active_signers,
  COUNTIF(d.block_date > f.first_day) AS returning_signers
FROM daily_signers d
JOIN first_seen f USING (signer_account_id)
GROUP BY d.block_date
ORDER BY d.block_date;
