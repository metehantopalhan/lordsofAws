# Multi-Region Architecture Overview

## Infrastructure Components

### Primary Region (eu-west-1)
- Virtual Private Cloud (VPC)
- Multiple Availability Zones
- Application Load Balancer (ALB)
- ECS Cluster with Fargate
- RDS PostgreSQL (Multi-AZ)
- CloudWatch Monitoring
- AWS Backup Service

### Secondary Region (eu-central-1)
- Mirrored VPC Setup
- RDS Read Replica
- Standby ALB
- ECS Cluster (Warm Standby)
- CloudWatch Monitoring

## Network Flow
1. Route 53 → Primary ALB
2. ALB → ECS Services
3. ECS → RDS Primary
4. Primary RDS → Secondary RDS (Replication)