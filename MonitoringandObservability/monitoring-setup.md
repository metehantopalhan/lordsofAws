# AWS Infrastructure Monitoring and Observability Setup

## Overview
This document outlines the implementation of a comprehensive monitoring solution using Amazon CloudWatch and Prometheus/Grafana for our AWS infrastructure, focusing on ECS, RDS, and Application Load Balancer (ALB) metrics.

## Monitoring Stack Components

### 1. Amazon CloudWatch

#### ECS Metrics Configuration
- **CPU Usage**
  - Metric: `CPUUtilization`
  - Namespace: `AWS/ECS`
  - Dimensions: `ClusterName`, `ServiceName`
  - Alert Threshold: > 80% for 5 minutes

- **Memory Usage**
  - Metric: `MemoryUtilization`
  - Namespace: `AWS/ECS`
  - Dimensions: `ClusterName`, `ServiceName`
  - Alert Threshold: > 85% for 5 minutes

#### RDS Metrics Configuration
- **Database Connections**
  - Metric: `DatabaseConnections`
  - Namespace: `AWS/RDS`
  - Dimensions: `DBInstanceIdentifier`
  - Alert Threshold: < 5 or > 95% of max_connections

- **Query Performance**
  - Metrics:
    - `ReadLatency`
    - `WriteLatency`
  - Alert Thresholds:
    - Read Latency > 1 second
    - Write Latency > 1 second

#### ALB Metrics Configuration
- **Request Count**
  - Metric: `RequestCount`
  - Namespace: `AWS/ApplicationELB`
  - Dimensions: `LoadBalancer`, `TargetGroup`
  - Alert: Sudden drop > 50%

- **Latency**
  - Metric: `TargetResponseTime`
  - Alert Threshold: > 2 seconds p95

### 2. Prometheus/Grafana Setup

#### Prometheus Configuration
```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'ecs-tasks'
    ec2_sd_configs:
      - region: us-east-1
        port: 9090
    relabel_configs:
      - source_labels: [__meta_ecs_cluster]
        target_label: cluster
      - source_labels: [__meta_ecs_task_definition_family]
        target_label: task_family

  - job_name: 'rds-exporter'
    static_configs:
      - targets: ['localhost:9187']

  - job_name: 'alb-metrics'
    static_configs:
      - targets: ['localhost:9090']
```

#### Grafana Dashboards
1. **ECS Dashboard**
   - Container CPU Usage
   - Container Memory Usage
   - Task Count
   - Service Health

2. **RDS Dashboard**
   - Active Connections
   - Query Latency
   - IOPS
   - Connection Pool Status

3. **ALB Dashboard**
   - Request Rate
   - Latency Distribution
   - 5xx Errors
   - Target Response Time

## Alert Configuration

### CloudWatch Alarms

1. **High CPU Usage Alert**
```json
{
  "AlarmName": "ECS-High-CPU-Usage",
  "MetricName": "CPUUtilization",
  "Threshold": 80,
  "Period": 300,
  "EvaluationPeriods": 2,
  "ComparisonOperator": "GreaterThanThreshold"
}
```

2. **Database Connection Alert**
```json
{
  "AlarmName": "RDS-Connection-Count",
  "MetricName": "DatabaseConnections",
  "Threshold": 5,
  "Period": 300,
  "EvaluationPeriods": 2,
  "ComparisonOperator": "LessThanThreshold"
}
```

3. **High Latency Alert**
```json
{
  "AlarmName": "ALB-High-Latency",
  "MetricName": "TargetResponseTime",
  "Threshold": 2,
  "Period": 300,
  "EvaluationPeriods": 2,
  "ComparisonOperator": "GreaterThanThreshold"
}
```

## Implementation Steps

1. **CloudWatch Setup**
   - Enable detailed monitoring for ECS clusters
   - Configure RDS performance insights
   - Enable ALB access logs

2. **Prometheus Installation**
   - Deploy Prometheus using ECS task definition
   - Configure service discovery for ECS tasks
   - Set up RDS exporter

3. **Grafana Deployment**
   - Deploy Grafana container
   - Import pre-configured dashboards
   - Configure data sources

4. **Alert Configuration**
   - Set up SNS topics for alerts
   - Configure notification endpoints
   - Test alert flow

## Best Practices

1. **Metric Collection**
   - Use appropriate sampling intervals
   - Implement metric aggregation
   - Enable detailed monitoring where necessary

2. **Alert Management**
   - Define clear severity levels
   - Implement alert routing
   - Document response procedures

3. **Dashboard Organization**
   - Group related metrics
   - Use consistent naming conventions
   - Include documentation links

## Maintenance

1. **Regular Tasks**
   - Review alert thresholds monthly
   - Update dashboard configurations
   - Clean up unused metrics

2. **Backup and Recovery**
   - Backup Grafana configurations
   - Document restoration procedures
   - Test recovery process

## Contact

- DevOps Team: metedevops@getmobil.com
