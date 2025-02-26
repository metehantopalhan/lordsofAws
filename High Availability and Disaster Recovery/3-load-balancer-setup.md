# Load Balancer Configuration

## Primary ALB (eu-west-1)
- Scheme: internet-facing
- IP Type: ipv4
- Security Groups: Inbound 80/443
- SSL Certificate: ACM
- Health Check Configuration:
  - Path: /health
  - Interval: 30 seconds
  - Timeout: 5 seconds
  - Healthy threshold: 2
  - Unhealthy threshold: 3

## Secondary ALB (eu-central-1)
- Identical configuration
- Separate target groups
- Independent SSL certificate
- Region-specific security groups