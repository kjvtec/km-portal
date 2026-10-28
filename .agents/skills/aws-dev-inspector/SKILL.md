---
name: aws-dev-inspector
description: |
  Expert knowledge and architecture validation engine for PTTRM VTEC JIFFY POS AWS DEV Environment (v1.5 by DailiTech).
  Use this skill whenever checking, verifying, or answering questions about AWS Multi-Account (Security, Shared Services, Non-Prod Workload),
  EKS Cluster 1.35 (vtechq-eks-dev), Aurora PostgreSQL 17.5, ElastiCache Redis 7.1, VPC/Subnet CIDRs, OpenVPN access,
  AWS Secrets Manager, Public ALB & WAF, and TC-01 to TC-11 verification checklists.
---

# AWS DEV Architecture Inspector

A specialized skill for auditing and answering questions about the **PTTRM VTEC JIFFY POS AWS Cloud Infrastructure (DEV Environment v1.5)** designed and delivered by **DailiTech**.

---

## 1. Master Architecture Summary (8 Main Modules)

| Section Code | Section Title | Page | Key Resources / Architecture Specs |
| :---: | :--- | :---: | :--- |
| **[AWS-01]** | ข้อมูลบัญชี AWS Multi-Account | หน้า 1 | Non-Prod (312728688861), Network (156041434932), Shared (043309341490), Security (043309340989) |
| **[AWS-02]** | เส้นทางเครือข่ายและการไหลของทราฟฟิก | หน้า 2 | User -> CloudFront -> Public ALB -> EKS Ingress Controller -> Backend Pods |
| **[AWS-02.2]**| การตั้งค่า DNS CNAME & SSL Termination | หน้า 2 | Route 53 CNAME, ACM SSL/TLS Certificates, Wildcard Domain Names |
| **[AWS-03]** | สถาปัตยกรรมเครือข่าย VPC & ซับเน็ต | หน้า 2 | Primary CIDR `10.150.0.0/16`, Pod Secondary CIDR `10.151.0.0/16`, 3 AZs |
| **[AWS-04.1]**| Amazon EKS Cluster & Node Group | หน้า 3 | Cluster `vtechq-eks-dev` (k8s v1.35.9), Node `m6i.large`, Private Endpoint Only, VPC-CNI |
| **[AWS-04.2]**| Amazon Aurora PostgreSQL & Redis | หน้า 4 | Aurora pg 17.5 (`db.t4g.medium`, Multi-AZ, Port 5432), Redis 7.1 (`cache.t4g.small`, Port 6379) |
| **[AWS-04.3]**| Public ALB & AWS WAF | หน้า 4 | Dualstack Internet-Facing ALB, AWS WAF WebACL, Rate Limiting (2,000 req/5m) |
| **[AWS-05]** | สถาปัตยกรรม OpenVPN Access Server | หน้า 5 | VPN Server IP `10.150.10.10`, Client Profile, kubectl CLI & DB Private Access |
| **[AWS-06]** | ความปลอดภัย & AWS Secrets Manager | หน้า 5 | Aurora Master Password, Redis Auth Token, KMS Customer Managed Key (CMK) |
| **[AWS-07]** | สรุปหมายเหตุการดำเนินงาน | หน้า 6 | Automated Daily Backup (Retention 7 days), Patching Window, CloudWatch & Container Insights |
| **[AWS-08]** | เช็คลิสต์ตรวจสอบระบบ (Checklist) | หน้า 6 | TC-01 ถึง TC-11 Verification Tests (สถานะทุกการทดสอบ: PASS) |
| **[AWS-09]** | ประวัติการปรับปรุงเอกสาร | หน้า 6 | Revision History v1.0 ถึง v1.5 (ปรับปรุง k8s 1.35, OpenVPN, IRSA annotations) |

---

## 2. Key Technical Specifications (Ground Truths)

When answering questions about AWS Cloud DEV Environment, always quote the exact parameters:

### A. EKS Cluster
- **Cluster Name:** `vtechq-eks-dev`
- **Kubernetes Version:** `1.35.9` (v1.35)
- **Node Instance Type:** `m6i.large` (2 vCPU, 8 GiB RAM)
- **API Server Endpoint Access:** **Private Only** (ห้ามเข้าถึงจาก Public Internet โดยตรง ต้องผ่าน OpenVPN เท่านั้น)
- **Pod Networking:** Secondary CIDR `10.151.0.0/16` ผ่าน AWS VPC-CNI เพื่อไม่ให้แย่ง IP กับเครือข่ายหลัก

### B. Database & Cache
- **Relational Database:** Amazon Aurora PostgreSQL Compatible Edition **v17.5**
  - **Instance Class:** `db.t4g.medium` (Multi-AZ Deployment)
  - **Port:** `5432`
  - **Storage:** Aurora Auto-scaling Storage
- **In-Memory Cache:** Amazon ElastiCache for Redis **v7.1**
  - **Node Type:** `cache.t4g.small` (Multi-AZ with Auto-Failover)
  - **Port:** `6379`
  - **Security:** Transit Encryption (TLS) + Auth Token

### C. OpenVPN Access
- **Private IP:** `10.150.10.10` ใน Shared Services VPC
- **Port:** UDP 1194 / TCP 443
- **วัตถุประสงค์:** ใช้สำหรับ Developer และ System Admin ในการเข้าถึง EKS Private API, รันคำสั่ง `kubectl` และเชื่อมต่อฐานข้อมูล Aurora / Redis ผ่าน Private Subnet

### D. Verification Checklist (TC-01 ถึง TC-11)
- ทุกรายการทดสอบ ตั้งแต่การเชื่อมต่อเครือข่าย, SSL Termination, WAF Blocking, Pod Scheduling ไปจนถึง Failover Test มีผลการทดสอบเป็น **PASS** 100%

---

## 3. Strict Citation Rules

- Always reference sections using the bracket notation: `[AWS-01]`, `[AWS-02]`, `[AWS-03]`, `[AWS-04.1]`, `[AWS-04.2]`, `[AWS-04.3]`, `[AWS-05]`, `[AWS-06]`, `[AWS-07]`, `[AWS-08]`.
- End with reference footer:
  `📍 **เอกสารอ้างอิง:** รายงานสรุปทรัพยากรระบบ AWS DEV v1.5 หมวด [AWS-xx ชื่อหัวข้อ] (หน้า X)`
