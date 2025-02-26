# Failover Procedures

## Automated Failover
1. Route 53 health check detects primary region failure
2. DNS automatically routes to secondary region
3. Read replica promotion begins
4. Application switches to new database endpoint

## Manual Failover Steps
1. Verify secondary region readiness:
```bash
aws rds describe-db-instances \
    --db-instance-identifier marketplace-replica \
    --region eu-central-1