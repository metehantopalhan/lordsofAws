# ECS Memory Exhaustion Incident Simulation and Resolution Guide

This guide demonstrates how to simulate, identify, and resolve an ECS task memory exhaustion incident, along with implementing preventive measures for future occurrences.

## 1. Incident Simulation

### Simulating Memory Exhaustion

1. **Create a Memory-Intensive Container**
   ```dockerfile
   FROM python:3.9-slim
   WORKDIR /app
   COPY memory_leak.py .
   CMD ["python", "memory_leak.py"]
   ```

2. **Memory Leak Script (memory_leak.py)**
   ```python
   import time
   import array

   def simulate_memory_leak():
       data = []
       while True:
           # Append 1MB of data every second
           data.append(array.array('i', range(0, 250000)))
           time.sleep(1)

   if __name__ == "__main__":
       simulate_memory_leak()
   ```

3. **Deploy to ECS with Limited Memory**
   ```hcl
   # Update ECS Task Definition with restricted memory
   resource "aws_ecs_task_definition" "app" {
     memory = "512"
     # Other configuration...
   }
   ```

## 2. Issue Identification

### Monitoring Indicators

1. **CloudWatch Metrics to Monitor**
   - `MemoryUtilization`
   - `memory_reservation`
   - `oom_killed`

2. **CloudWatch Alarms Setup**
   ```hcl
   resource "aws_cloudwatch_metric_alarm" "memory_high" {
     alarm_name          = "ecs-memory-utilization-high"
     comparison_operator = "GreaterThanThreshold"
     evaluation_periods  = "2"
     metric_name        = "MemoryUtilization"
     namespace          = "AWS/ECS"
     period             = "60"
     statistic          = "Average"
     threshold          = "85"
     alarm_description  = "Memory utilization has exceeded 85%"
     
     dimensions = {
       ClusterName = "your-cluster-name"
       ServiceName = "your-service-name"
     }
   }
   ```

### Diagnostic Steps

1. **Check CloudWatch Logs**
   ```bash
   aws logs get-log-events \
     --log-group-name "/ecs/your-service" \
     --log-stream-name "your-stream" \
     --limit 100
   ```

2. **Monitor ECS Service Events**
   ```bash
   aws ecs describe-services \
     --cluster your-cluster \
     --services your-service
   ```

3. **Review Container Insights**
   - Navigate to CloudWatch Container Insights
   - Check Memory Utilization patterns
   - Review Container restart counts

## 3. Immediate Resolution

### Short-term Fixes

1. **Scale Up Memory**
   ```bash
   # Update task definition with increased memory
   aws ecs update-service \
     --cluster your-cluster \
     --service your-service \
     --task-definition your-task:NEW
   ```

2. **Horizontal Scaling**
   ```bash
   # Increase desired count
   aws ecs update-service \
     --cluster your-cluster \
     --service your-service \
     --desired-count 4
   ```

3. **Force New Deployment**
   ```bash
   aws ecs update-service \
     --cluster your-cluster \
     --service your-service \
     --force-new-deployment
   ```

## 4. Preventive Measures

### Long-term Solutions

1. **Implement Auto Scaling**
   ```hcl
   resource "aws_appautoscaling_target" "ecs_target" {
     max_capacity       = 4
     min_capacity       = 1
     resource_id        = "service/your-cluster/your-service"
     scalable_dimension = "ecs:service:DesiredCount"
     service_namespace  = "ecs"
   }

   resource "aws_appautoscaling_policy" "memory_policy" {
     name               = "memory-scaling-policy"
     policy_type        = "TargetTrackingScaling"
     resource_id        = aws_appautoscaling_target.ecs_target.resource_id
     scalable_dimension = aws_appautoscaling_target.ecs_target.scalable_dimension
     service_namespace  = aws_appautoscaling_target.ecs_target.service_namespace

     target_tracking_scaling_policy_configuration {
       predefined_metric_specification {
         predefined_metric_type = "ECSServiceAverageMemoryUtilization"
       }
       target_value = 75.0
     }
   }
   ```

2. **Memory Optimization Best Practices**
   - Set appropriate JVM heap sizes for Java applications
   - Implement memory leak detection in application code
   - Use memory-efficient data structures
   - Implement proper garbage collection strategies

3. **Enhanced Monitoring Setup**
   ```hcl
   # Memory utilization alarm
   resource "aws_cloudwatch_metric_alarm" "memory_utilization" {
     alarm_name          = "memory-utilization"
     comparison_operator = "GreaterThanThreshold"
     evaluation_periods  = "2"
     metric_name        = "MemoryUtilization"
     namespace          = "AWS/ECS"
     period             = "60"
     statistic          = "Average"
     threshold          = "75"
     alarm_description  = "Memory utilization is too high"
     alarm_actions      = [aws_sns_topic.alerts.arn]

     dimensions = {
       ClusterName = aws_ecs_cluster.main.name
       ServiceName = aws_ecs_service.main.name
     }
   }

   # OOM kill count alarm
   resource "aws_cloudwatch_metric_alarm" "oom_kills" {
     alarm_name          = "oom-kills"
     comparison_operator = "GreaterThanThreshold"
     evaluation_periods  = "1"
     metric_name        = "oom_killed"
     namespace          = "ECS/ContainerInsights"
     period             = "60"
     statistic          = "Sum"
     threshold          = "0"
     alarm_description  = "Container was killed due to OOM"
     alarm_actions      = [aws_sns_topic.alerts.arn]

     dimensions = {
       ClusterName = aws_ecs_cluster.main.name
       ServiceName = aws_ecs_service.main.name
     }
   }
   ```

### Regular Maintenance Tasks

1. **Weekly Reviews**
   - Analyze CloudWatch metrics trends
   - Review container restart patterns
   - Check memory utilization patterns

2. **Monthly Optimization**
   - Update memory reservations based on usage patterns
   - Review and adjust auto-scaling thresholds
   - Update monitoring thresholds based on application behavior

## 5. Documentation and Runbooks

1. **Incident Response Runbook**
   - Document exact steps for first responders
   - Include escalation paths and contact information
   - Maintain troubleshooting decision tree

2. **Post-Incident Review**
   - Conduct thorough analysis of root cause
   - Document lessons learned
   - Update preventive measures based on findings

3. **Knowledge Base**
   - Maintain FAQ for common memory issues
   - Document known memory leak patterns
   - Keep resolution steps updated

## 6. Testing and Validation

1. **Regular Testing**
   - Conduct periodic incident simulation drills
   - Test auto-scaling responses
   - Validate monitoring and alerting systems

2. **Performance Testing**
   - Regular load testing with memory monitoring
   - Stress testing for memory limits
   - Validation of auto-scaling policies

By following this guide, teams can effectively simulate, identify, resolve, and prevent ECS task memory exhaustion incidents. Regular testing and updates to this documentation ensure continued effectiveness of the incident response process.