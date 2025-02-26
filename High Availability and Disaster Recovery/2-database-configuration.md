# Database High Availability Configuration

## Primary Database (eu-west-1)
- Engine: PostgreSQL 14
- Instance: db.t3.medium
- Storage: gp3 (Autoscaling enabled)
- Multi-AZ: Enabled
- Backup Window: 03:00-04:00 UTC
- Maintenance: Monday 04:00-05:00 UTC

## Read Replica (eu-central-1)
- Same instance specifications
- Asynchronous replication
- Automated promotion ready
- Independent backup configuration
- Separate security group

## Monitoring Setup
- Enhanced Monitoring: 60s intervals
- Performance Insights: Enabled
- CloudWatch Metrics
  - ReplicaLag
  - CPUUtilization
  - FreeableMemory
  - DatabaseConnections