# 🔐 Secrets Manager Rotation for Database Credentials

## Project Code
**24CC3014-P024**

## Category
**SECURITY**

---

## 📌 Project Overview

This project demonstrates how **AWS Secrets Manager** can be used to securely manage and automatically rotate database credentials for an **Amazon Aurora PostgreSQL / RDS PostgreSQL database**.

The main objective is to eliminate hardcoded database passwords and automatically change database credentials on a scheduled basis.

Instead of storing database passwords directly inside application code or configuration files, the credentials are securely stored in **AWS Secrets Manager**.

AWS Lambda is used as the rotation mechanism to change the database password automatically, while **Amazon CloudWatch** is used to monitor the rotation process and errors.

---

## 🎯 Objectives

The main objectives of this project are:

1. Automatically rotate RDS database credentials every **30 days**.
2. Remove hardcoded database passwords from application configuration.
3. Securely store database credentials using **AWS Secrets Manager**.
4. Use **AWS Lambda** to perform automatic credential rotation.
5. Monitor rotation activities using **Amazon CloudWatch**.
6. Handle database connectivity and connection-pool issues during credential rotation.
7. Configure secure networking between AWS services.

---

# 🏗️ Architecture

```text
                         AWS Cloud
                              |
                              |
                    ┌─────────▼─────────┐
                    │ AWS Secrets       │
                    │ Manager           │
                    │                   │
                    │ Username          │
                    │ Password          │
                    │ DB Endpoint       │
                    └─────────┬─────────┘
                              |
                       30-Day Rotation
                              |
                    ┌─────────▼─────────┐
                    │ AWS Lambda        │
                    │ Rotation Function │
                    │                   │
                    │ Generate New      │
                    │ Password          │
                    │ Update Database   │
                    │ Test Credentials  │
                    └─────────┬─────────┘
                              |
                              |
                    ┌─────────▼─────────┐
                    │ Amazon RDS /      │
                    │ Aurora PostgreSQL │
                    │                   │
                    │ Database          │
                    └───────────────────┘
                              |
                              |
                    ┌─────────▼─────────┐
                    │ CloudWatch Logs   │
                    │                   │
                    │ Monitoring &      │
                    │ Troubleshooting   │
                    └───────────────────┘
