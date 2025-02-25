# Infrastructure Deployment Guide

Bu rehber, AWS altyapısını Terraform kullanarak nasıl deploy edeceğinizi adım adım açıklar.

## Ön Gereksinimler

1. **AWS Hesabı ve Kimlik Bilgileri**
   - AWS hesabınız olmalı
   - AWS Access Key ve Secret Key'e sahip olmalısınız
   - AWS CLI yüklü olmalı ve yapılandırılmış olmalı (`aws configure`)

2. **Terraform Kurulumu**
   - [Terraform'u indirin ve yükleyin](https://developer.hashicorp.com/terraform/downloads)
   - Minimum versiyon: 1.0.0

## Altyapı Bileşenleri

Bu proje aşağıdaki AWS kaynaklarını içerir:

- **VPC ve Ağ Altyapısı**
  - Public ve Private Subnet'ler
  - Internet Gateway
  - NAT Gateway
  - Route Table'lar

- **Application Load Balancer (ALB)**
  - HTTP Listener (Port 80)
  - Target Group
  - Security Group

- **ECS Fargate**
  - ECS Cluster
  - ECS Service
  - Task Definition
  - Auto Scaling
  - Security Group

- **RDS PostgreSQL**
  - DB Instance
  - Security Group
  - Subnet Group

## Deployment Adımları

1. **AWS Kimlik Bilgilerini Ayarlama**
   ```bash
   export AWS_ACCESS_KEY_ID="your_access_key"
   export AWS_SECRET_ACCESS_KEY="your_secret_key"
   export AWS_DEFAULT_REGION="your_region"
   ```

2. **Terraform Çalışma Dizinine Gitme**
   ```bash
   cd terraform
   ```

3. **Terraform Başlatma**
   ```bash
   terraform init
   ```

4. **Terraform Plan**
   ```bash
   terraform plan -var-file="env/dev.tfvars"
   ```

5. **Terraform Apply**
   ```bash
   terraform apply -var-file="env/dev.tfvars"
   ```

## Değişkenler

Deployment için gerekli değişkenler `env/dev.tfvars` dosyasında tanımlanmalıdır:

```hcl
project     = "your-project-name"
environment = "dev"

# VPC
vpc_cidr = "10.0.0.0/16"

# RDS
database_name   = "appdb"
master_username = "admin"
master_password = "your-secure-password"

# ECS
container_image = "your-docker-image:tag"
container_port  = 8080
desired_count   = 2
cpu            = 256
memory         = 512
```

## Doğrulama

1. **ALB DNS Adresini Kontrol Etme**
   - AWS Console > EC2 > Load Balancers
   - DNS name'i kopyalayın ve tarayıcıda açın

2. **ECS Service'ini Kontrol Etme**
   - AWS Console > ECS > Clusters
   - Service'in çalışır durumda olduğunu ve task'ların healthy olduğunu doğrulayın

3. **RDS Bağlantısını Kontrol Etme**
   - AWS Console > RDS
   - Instance'ın available durumunda olduğunu doğrulayın

## Altyapıyı Silme

Altyapıyı tamamen kaldırmak için:

```bash
terraform destroy -var-file="env/dev.tfvars"
```

## Sorun Giderme

1. **ECS Task'ları Başlamıyorsa**
   - CloudWatch Logs'u kontrol edin
   - Security Group'ları kontrol edin
   - Task Definition'daki environment variables'ı kontrol edin

2. **RDS Bağlantı Sorunu**
   - Security Group'ları kontrol edin
   - Subnet yapılandırmasını kontrol edin
   - Credentials'ları kontrol edin

3. **ALB Health Check Hatası**
   - Target Group health check ayarlarını kontrol edin
   - Container'ın doğru port'ta çalıştığını kontrol edin
   - Security Group'ları kontrol edin

## Monitoring

1. **CloudWatch Metrics**
   - ECS Service CPU ve Memory kullanımı
   - ALB Request Count ve Latency
   - RDS CPU kullanımı ve bağlantı sayısı

2. **CloudWatch Logs**
   - ECS Task logları
   - ALB Access logları

3. **AWS Health Dashboard**
   - Servis sağlığı
   - Planlı bakımlar

## Best Practices

1. **Güvenlik**
   - Hassas bilgileri AWS Secrets Manager'da saklayın
   - Security Group'ları minimum gerekli erişime göre yapılandırın
   - RDS'i düzenli olarak yedekleyin

2. **Performans**
   - Auto Scaling politikalarını iş yüküne göre ayarlayın
   - RDS instance type'ını iş yüküne göre seçin
   - ALB target group ayarlarını optimize edin

3. **Maliyet Optimizasyonu**
   - Kullanılmayan kaynakları temizleyin
   - Reserved Instance kullanmayı değerlendirin
   - CloudWatch alarmları ile anormal kullanımları izleyin