# Route 53 Failover Configuration

## DNS Records
- Type: A Record
- Name: marketplace.example.com
- Routing Policy: Failover
- Evaluate Target Health: Yes

## Health Checks
- Protocol: HTTPS
- Port: 443
- Path: /health
- Request Interval: 30 seconds
- Failure Threshold: 3
- String Matching: "OK"

## Failover Rules
- Primary: eu-west-1 ALB
- Secondary: eu-central-1 ALB
- Automatic failover when health check fails