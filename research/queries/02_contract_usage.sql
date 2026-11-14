-- GoogleSQL · Partition-filtered function-call receipt actions.
-- These are not unique end users or necessarily successful function calls.
SELECT
  block_date AS date,
  receipt_receiver_account_id AS contract,
  COUNT(*) AS function_calls,
  COUNT(DISTINCT receipt_predecessor_account_id) AS callers
FROM `bigquery-public-data.crypto_near_mainnet_us.receipt_actions`
WHERE block_date >= @start_date
  AND block_date < @end_date
  AND action_kind = 'FUNCTION_CALL'
GROUP BY block_date, receipt_receiver_account_id
ORDER BY block_date, function_calls DESC;
