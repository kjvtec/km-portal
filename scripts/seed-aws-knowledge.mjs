import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://cnzthrnkyumhgsomszwu.supabase.co";
const serviceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuenRocm5reXVtaGdzb21zend1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjExODAyNCwiZXhwIjoyMTA3Njk0MDI0fQ.nXRVNOCjmlQGQe_xYGPX2TB0ezyrT4nIwIT64iYlPDQ";

const supabase = createClient(supabaseUrl, serviceKey);

async function run() {
  console.log("=== 1. Preparing AWS DEV Resource Summary Data ===");

  const mdPath = path.resolve(import.meta.dirname, "../data/aws-dev-resource-summary.md");
  const fullMd = fs.readFileSync(mdPath, "utf-8");

  // Define clear, high-signal chunks
  const chunks = [
    {
      title: "บทนำ ข้อมูลบัญชี AWS และสถาปัตยกรรม Multi-Account",
      content: `[เอกสารสถาปัตยกรรมระบบคลาวด์ AWS DEV | PTTRM VTEC JIFFY POS | หมวด: 1. ข้อมูลบัญชีและขอบเขตระบบ]
โครงการ: PTTRM VTEC JIFFY POS — สภาพแวดล้อมเพื่อการพัฒนา (DEV Environment)
จัดทำโดย: DailiTech Co., Ltd. (AWS Advanced Consulting Partner)
เวอร์ชันเอกสาร: Version 1.5 (ส่งมอบ: 26 ตุลาคม 2026)
Region หลัก: ap-southeast-7 (Asia Pacific — Bangkok) ยกเว้น AWS WAF ขอบเขต Global (us-east-1)
การจัดการโครงสร้างพื้นฐาน: Terraform State + AWS Resources
โครงสร้างบัญชี Multi-Account Architecture:
1. Workload Non-Prod Account (Account ID: 312728688861, AWS Profile: pttrm-nonprod): รัน EKS Cluster (vtechq-eks-dev), Aurora PostgreSQL (vtecapp-aurora-dev), Redis (vtecapp-redis-dev), S3 Assets (vtecapp-assets-dev), ECR (vtecapp)
2. Network Account (Account ID: 607063196689, AWS Profile: pttrm-network): ดูแล Ingress Edge, CloudFront, AWS WAF, Public ALB (vtecapp-ext-alb-dev) และ OpenVPN Access Server (vtec-openvpn-nonprod IP 172.28.0.138)`
    },
    {
      title: "แผนผังสถาปัตยกรรมและการไหลของทราฟฟิก (Traffic Flow Architecture)",
      content: `[เอกสารสถาปัตยกรรมระบบคลาวด์ AWS DEV | PTTRM VTEC JIFFY POS | หมวด: 2.1 แผนผังสถาปัตยกรรมและ Traffic Flow]
ลำดับการส่งคำขอ (Request Flow) จากภายนอกเข้าสู่ระบบ Container:
1. ผู้ใช้งานภายนอก (Internet) เข้าใช้งานผ่าน URL: https://ras-dev.pttrm.com
2. คำขอส่งมายัง Amazon CloudFront (vtecapp-cdn-dev) พร้อมตรวจสอบความปลอดภัยผ่าน AWS WAF (vtecapp-cdn-dev-waf) ใน Region us-east-1
3. CloudFront ส่งต่อคำขอผ่าน HTTPS ไปยัง Public Internet-Facing ALB (vtecapp-ext-alb-dev) ฝั่ง Network Account (607063196689)
4. ALB-to-ALB Sync Lambda (vtecapp-ext-alb-dev-a2a): รันทุกๆ 1 นาที เพื่อค้นหา IP ของ Internal Ingress ALB ฝั่ง EKS แล้วลงทะเบียน (Register) เข้ากับ Target Group ของ Public ALB อัตโนมัติ (ปัจจุบัน Sync สำเร็จ 3 IPs: 172.28.10.145, 172.28.10.20, 172.28.10.91)
5. ทราฟฟิกวิ่งข้ามโครงข่ายผ่าน AWS Transit Gateway (TGW) ไปยัง Internal Ingress ALB (vtecapp-alb-dev) ภายใน Workload Account (312728688861)
6. Ingress ALB ส่งต่อคำขอเข้าสู่ Application Pods บน EKS ตาม Path Routing และ Pods เชื่อมต่อไปยัง Aurora DB, Redis และ S3`
    },
    {
      title: "การตั้งค่า DNS และ CNAME (DNS Configuration)",
      content: `[เอกสารสถาปัตยกรรมระบบคลาวด์ AWS DEV | PTTRM VTEC JIFFY POS | หมวด: 2.2 การตั้งค่า DNS]
การตั้งค่า DNS (DNS Records Configuration):
- สิ่งที่ลูกค้าต้องดำเนินการ (Customer Action Needed): เพิ่มเรคคอร์ด CNAME ในระบบ DNS ของลูกค้าเพียงรายการเดียว:
  * Host / Record: ras-dev.pttrm.com
  * Record Type: CNAME
  * Target Value: d2jtcqzr2d6dnv.cloudfront.net
  * ข้อบังคับ: ต้องใช้ตัวอักษรพิมพ์เล็กทั้งหมด (Lowercase) ตามข้อบังคับของ Amazon CloudFront
- เรคคอร์ดของ Ingress ALB และ Public ALB: AWS สร้างให้อัตโนมัติ ลูกค้าไม่ต้องชี้ DNS ใดๆ เข้าหา ALB โดยตรง`
    },
    {
      title: "สถาปัตยกรรมเครือข่าย VPC และ Subnets (Networking Architecture)",
      content: `[เอกสารสถาปัตยกรรมระบบคลาวด์ AWS DEV | PTTRM VTEC JIFFY POS | หมวด: 3. สถาปัตยกรรมโครงข่ายและ Subnet]
ระบบเครือข่ายเป็นแบบ Shared VPC ผ่าน AWS RAM (Resource Access Manager):
- VPC หลัก (Workload VPC): rm-nonprod-vpc (VPC ID: vpc-0f45a0034beb15958)
  * VPC Primary CIDR: 172.28.10.0/23
  * Pod Secondary CIDR: 100.64.32.0/19 (ใช้ร่วมกับ AWS VPC CNI Custom Networking เพื่อแยกวง IP สำหรับ Pods ป้องกันการแย่ง IP วงหลักขององค์กร)
- การกระจาย Subnet ครอบคลุม 3 Availability Zones (ap-southeast-7a, 7b, 7c):
  * App Subnets (สำหรับ EKS Worker Nodes): Zone A (subnet-02b7b285520931989), Zone B (subnet-026f8e36089bbd09e), Zone C (subnet-0057282cda9c09879)
  * Secure Subnets (สำหรับ Aurora PostgreSQL & Redis Cache): Zone A (subnet-059377336d693204c), Zone B (subnet-0ca627725499aa71b), Zone C (subnet-0a1b982b1f513ca22)
  * Non-expose Subnets (สำหรับ EKS Pod IPs โดยเฉพาะ): Zone A (subnet-024984c096fc3c168), Zone B (subnet-023499c582c988934), Zone C (subnet-0d1831db4ec285fb7)`
    },
    {
      title: "Amazon EKS Cluster รายละเอียดสเปกและ Add-ons (vtechq-eks-dev)",
      content: `[เอกสารสถาปัตยกรรมระบบคลาวด์ AWS DEV | PTTRM VTEC JIFFY POS | หมวด: 4.1 ระบบประมวลผลคอนเทนเนอร์ Amazon EKS]
รายละเอียด Amazon EKS (Elastic Kubernetes Service):
- ชื่อคลัสเตอร์: vtechq-eks-dev
- เวอร์ชัน Kubernetes: 1.35 (Node AMI v1.35.9 อัปเกรดต่อเนื่อง 1.31 -> 1.32 -> 1.33 -> 1.34 -> 1.35)
- Endpoint Access: Private Only (Public = false, Private = true) ยกระดับความปลอดภัยสูงสุด เข้าถึงเพื่อรัน kubectl ได้ผ่าน VPN เท่านั้น
- Node Group ("general"): สถานะ ACTIVE, ขนาด Instance: m6i.large (2 vCPU, 8 GiB RAM), OS: Amazon Linux 2023 (AL2023_x86_64_STANDARD), Storage: gp3, Auto Scaling: Min=1, Max=1, Desired=1
- EKS Managed Add-ons (รองรับ v1.35 ทั้งหมด):
  1. vpc-cni v1.22.4-eksbuild.8 (เปิด Custom Networking + Prefix Delegation)
  2. kube-proxy v1.35.3-eksbuild.59
  3. coredns v1.13.2-eksbuild.59
  4. aws-ebs-csi-driver v1.67.2-eksbuild.1 (Service Account ผูกกับ IRSA Role ARN vtechq-eks-dev-ebs-csi-role ป้องกัน CrashLoopBackOff)
  5. metrics-server v0.7.2-eksbuild.18
  6. amazon-cloudwatch-observability v6.7.0-eksbuild.1
  7. AWS Load Balancer Controller (ติดตั้งผ่าน Helm)
- EKS Access Entries: RMAdminRole และ RMDevOpsRole ได้รับ AmazonEKSClusterAdminPolicy, RMReadOnlyRole ได้รับ AmazonEKSViewPolicy
- Ingress ALB (vtecapp-alb-dev): โหลดบาลานเซอร์ภายใน (Internal Scheme) บริหารโดย AWS Load Balancer Controller`
    },
    {
      title: "ฐานข้อมูล Aurora PostgreSQL, Redis, ECR และ S3 (Data & Storage)",
      content: `[เอกสารสถาปัตยกรรมระบบคลาวด์ AWS DEV | PTTRM VTEC JIFFY POS | หมวด: 4.2 ระบบจัดเก็บข้อมูลและฐานข้อมูล]
รายละเอียด Data & Storage:
1. Amazon Aurora PostgreSQL (vtecapp-aurora-dev):
   - Engine: PostgreSQL เวอร์ชัน 17.5
   - Instance Class: db.t4g.medium (1 Writer, 0 Reader - Single AZ สำหรับ DEV)
   - Connection: Port 5432, Database: vtechq, Master User: vtecpos
   - ความปลอดภัย: Retention สำรองข้อมูล 7 วัน, เข้ารหัส At-Rest
   - Security Group: sg-01c76e32b7f1b0cdf อนุญาต Port 5432 จาก EKS Node SG และ OpenVPN Gateway IP (172.28.0.138/32)
2. Amazon ElastiCache for Redis (vtecapp-redis-dev):
   - Engine: Redis เวอร์ชัน 7.1 (Cluster Mode Disabled)
   - Instance Class: cache.t4g.small (1 โหนด)
   - Connection: Port 6379, In-Transit Encryption (TLS) เปิดใช้งาน, At-Rest Encryption เปิดใช้งาน, มี AUTH Token
   - Security Group: sg-0d09ebce810b2fe49 อนุญาต Port 6379 จาก EKS Node SG และ OpenVPN Gateway IP
3. Amazon ECR (vtecapp): Image Tag Immutability เปิดใช้งาน, Scan on push เปิดใช้งาน, เข้ารหัส AES256, Lifecycle Policy เก็บอิมเมจล่าสุด 20 รายการ
4. Amazon S3 (vtecapp-assets-dev): เข้ารหัส SSE-KMS (aws/s3), ปิด Public Access 100% (Block all public access)`
    },
    {
      title: "ระบบ Edge, Public ALB, CloudFront และ AWS WAF (Edge & Security)",
      content: `[เอกสารสถาปัตยกรรมระบบคลาวด์ AWS DEV | PTTRM VTEC JIFFY POS | หมวด: 4.3 ระบบเครือข่ายด่านหน้าและความปลอดภัย]
รายละเอียด Edge & Security:
1. Public ALB (vtecapp-ext-alb-dev): วางอยู่ใน Network VPC (Untrust Subnets), Port 80 Redirect ไป Port 443, Port 443 ตรวจสอบ Host Header ras-dev.pttrm.com ส่งต่อเข้า Target Group (IPs ของ Ingress ALB), SSL/TLS Certificate จาก ACM Region ap-southeast-7
2. Amazon CloudFront Distribution (vtecapp-cdn-dev):
   - Distribution Domain: d2jtcqzr2d6dnv.cloudfront.net
   - Alternate Domain (CNAME): ras-dev.pttrm.com
   - Custom SSL Certificate: ACM ใน Region us-east-1 (Global)
   - Caching: Managed-CachingOptimized / Managed-AllViewer
3. AWS WAF (vtecapp-cdn-dev-waf):
   - Scope: Global (us-east-1) ผูกกับ CloudFront
   - กฎป้องกันความปลอดภัย: IP Whitelist, IP Blacklist, Anonymous IP List, Amazon IP Reputation List, Core Rule Set (CRS) และ SQL Injection Rules`
    },
    {
      title: "การเชื่อมต่อระยะไกลผ่าน OpenVPN Access Server (How to Connect)",
      content: `[เอกสารสถาปัตยกรรมระบบคลาวด์ AWS DEV | PTTRM VTEC JIFFY POS | หมวด: 5. การเข้าถึงระยะไกลผ่าน OpenVPN]
OpenVPN Access Server (vtec-openvpn-nonprod - Instance ID: i-08c83864c0bcda437):
- ติดตั้งใน Network Account เพื่อให้ทีมพัฒนาและแอดมินเข้าถึง EKS Private Endpoint และ Database ภายใน
- Public IP (Elastic IP): 43.209.188.148
- Private IP: 172.28.0.138
- หลักการ Source NAT (SNAT): OpenVPN จะ NAT ทราฟฟิกของผู้ใช้งานทั้งหมดให้เสมือนออกมาจาก IP 172.28.0.138 ทำให้ Security Group ภายใน Whitelist เฉพาะ 172.28.0.138/32 เท่านั้น
ขั้นตอนการเชื่อมต่อสำหรับผู้ใช้งาน:
1. เปิดเบราว์เซอร์ไปที่: https://43.209.188.148/ (กดยอมรับ Certificate Warning)
2. เข้าสู่ระบบด้วย Username: openvpn (รหัสผ่านจัดส่งผ่านช่องทางความปลอดภัยแยกต่างหาก)
3. ดาวน์โหลด Client Profile (.ovpn) หรือใช้โปรแกรม OpenVPN Connect แล้ว Import Profile
4. กด Connect เพื่อเชื่อมต่อ VPN Tunnel
5. สำหรับผู้ดูแลระบบที่ต้องการสั่งงาน kubectl กับ EKS ให้รันคำสั่ง:
   aws eks update-kubeconfig --name vtechq-eks-dev --region ap-southeast-7 --profile pttrm-nonprod`
    },
    {
      title: "การจัดการความลับ AWS Secrets Manager (Aurora Password & Redis Token)",
      content: `[เอกสารสถาปัตยกรรมระบบคลาวด์ AWS DEV | PTTRM VTEC JIFFY POS | หมวด: 6. การจัดการรหัสผ่านและความลับ]
ความลับทั้งหมดจัดเก็บใน AWS Secrets Manager ภายใน Workload Account (312728688861):
1. Aurora Master Password: รหัสผ่านผู้ใช้ vtecpos สำหรับ Aurora PostgreSQL จัดการโดย AWS RDS Service (manage_master_user_password) หมุนเวียนรหัสผ่านอัตโนมัติ (Auto / AWS-managed) ค่ารหัสผ่านไม่ปรากฏใน Terraform State ใดๆ แอปพลิเคชันอ่านผ่าน ARN โดยตรง
2. Redis Auth Token: Auth Token สำหรับเชื่อมต่อ Redis Cluster จัดการโดย Terraform (random_password) รหัสผ่านถูกบันทึกลงใน Terraform State ที่ถูกเข้ารหัสบน S3 Backend`
    },
    {
      title: "ข้อควรระวังในการดูแลรักษาระบบ (Operational Notes & Best Practices)",
      content: `[เอกสารสถาปัตยกรรมระบบคลาวด์ AWS DEV | PTTRM VTEC JIFFY POS | หมวด: 7. ข้อควรระวังและแนวทางดูแลระบบ]
ข้อควรระวังสำคัญสำหรับทีมผู้ดูแลระบบ (DevOps & Cloud Engineers):
1. ความแตกต่างของ Security Group ระหว่าง Terraform และ AWS CLI:
   - พอร์ต EKS API 443: กฎเปิดให้ VPN Gateway (172.28.0.138/32) เข้าถึง เป็นการเพิ่มผ่าน AWS CLI เข้าที่ Managed SG ของ EKS โดยตรง (sg-007b64e9956a2855d) ไม่อยู่ใน State ของ Terraform ห้ามพยายามนำเข้าหรือแก้ผ่านโค้ดทั่วไป
   - พอร์ต Aurora (5432) และ Redis (6379): จัดการผ่าน Terraform ด้วยตัวแปร onprem_cidr_blocks = ["172.28.0.138/32"] ห้ามเพิ่มกฎผ่าน AWS CLI ด้วยตนเองเพราะจะถูก terraform apply เขียนทับ
2. การอัปเกรด EKS Add-ons: Terraform กำหนด ignore_changes = all ไว้เพื่อให้ทีมอัปเกรด Add-ons ผ่าน CLI/Console ได้โดยไม่ติด Configuration Drift
3. Bastion Host: ถูกปิดการใช้งานอยู่ (enable_bastion = false) เนื่องจากใช้ OpenVPN เป็นช่องทางหลัก`
    },
    {
      title: "ผลการทดสอบและตรวจรับระบบ (Verification Checklist TC-01 ถึง TC-11)",
      content: `[เอกสารสถาปัตยกรรมระบบคลาวด์ AWS DEV | PTTRM VTEC JIFFY POS | หมวด: 8. รายการตรวจรับระบบ]
ผลการทดสอบการติดตั้งทรัพยากรทุกรายการบนสภาพแวดล้อม DEV ผ่านการทดสอบทั้งหมด (PASS 100%):
- TC-01: EKS Cluster ออนไลน์ Node Group ACTIVE (vtechq-eks-dev) -> PASS
- TC-02: Ingress ALB พร้อมใช้งาน Active (vtecapp-alb-dev) -> PASS
- TC-03: ECR Repository ออนไลน์ พร้อมรับ Image (vtecapp) -> PASS
- TC-04: Aurora PostgreSQL Cluster ออนไลน์ (vtecapp-aurora-dev) -> PASS
- TC-05: ElastiCache Redis Cluster ออนไลน์ (vtecapp-redis-dev) -> PASS
- TC-06: S3 Assets Bucket เข้าถึงได้ถูกต้อง (vtecapp-assets-dev) -> PASS
- TC-07: Public ALB ออนไลน์พร้อมรับคำขอ (vtecapp-ext-alb-dev) -> PASS
- TC-08: Lambda Sync ALB-to-ALB ทำงานสมบูรณ์ Sync 3 IPs (vtecapp-ext-alb-dev-a2a) -> PASS
- TC-09: CloudFront Distribution สถานะ Deployed & Enabled (vtecapp-cdn-dev) -> PASS
- TC-10: AWS WAF ป้องกัน CloudFront ตามกฎครบถ้วน (vtecapp-cdn-dev-waf) -> PASS
- TC-11: OpenVPN เชื่อมต่อได้ พร้อมเปิด Security Group ไปยัง EKS API, Aurora และ Redis (vtec-openvpn-nonprod) -> PASS`
    },
    {
      title: "ประวัติการปรับปรุงเอกสาร AWS Resource Summary (Changelog Summary)",
      content: `[เอกสารสถาปัตยกรรมระบบคลาวด์ AWS DEV | PTTRM VTEC JIFFY POS | หมวด: 9. ประวัติการปรับปรุงเอกสาร]
ประวัติเวอร์ชันเอกสารสถาปัตยกรรม AWS DEV:
- v1.0 (22 ต.ค. 2026): สรุปทรัพยากร DEV ครั้งแรก ตรวจสอบ EKS, ALB, ECR, Aurora, Redis, S3, CloudFront, WAF
- v1.1 (22 ต.ค. 2026): เพิ่ม Supporting Resources: IAM Roles (EKS + 7 IRSA roles), IAM Policies, Security Groups, Target Group ข้าม Account
- v1.2 (22 ต.ค. 2026): เพิ่มตาราง Secrets Manager สำหรับ Aurora Password และ Redis Token
- v1.3 (22 ต.ค. 2026): เพิ่มไดอะแกรมสถาปัตยกรรม Traffic Flow และรายละเอียดการตั้งค่า DNS
- v1.4 (26 ต.ค. 2026): ปรับปรุง EKS เป็น Kubernetes 1.35 (Node 1.35.9), ปรับเวอร์ชัน Add-ons ทั้งหมด, ปรับ API Endpoint เป็น Private-only, เพิ่ม EBS CSI IRSA annotation
- v1.5 (26 ต.ค. 2026): เพิ่ม OpenVPN Access Server พร้อมขั้นตอน How to Connect, อัปเดต Security Group และยืนยันผลการตรวจรับ TC-11 (PASS 100%)`
    }
  ];

  console.log(`Prepared ${chunks.length} high-signal chunks.`);

  // Save chunks locally as JSON for future seed endpoint
  const jsonOutPath = path.resolve(import.meta.dirname, "../data/aws-dev-chunks.json");
  fs.writeFileSync(jsonOutPath, JSON.stringify(chunks, null, 2), "utf-8");
  console.log("Saved local chunks to data/aws-dev-chunks.json");

  console.log("\n=== 2. Creating Master Document Record in Supabase ===");
  const workspaceId = "4029f3e9-d7c7-4acb-9147-6a4fac6c840a";
  const docTitle = "PTTRM VTEC JIFFY POS — รายงานสรุปทรัพยากรระบบ AWS DEV v1.5 (DailiTech)";

  // Check if document already exists
  const { data: existingDoc } = await supabase
    .from("documents")
    .select("id")
    .eq("workspace_id", workspaceId)
    .ilike("title", "%AWS DEV%")
    .single();

  let documentId = existingDoc?.id;

  if (documentId) {
    console.log("Found existing document ID:", documentId);
    // Remove old chunks for this document
    await supabase.from("document_chunks").delete().eq("document_id", documentId);
    console.log("Cleared old chunks for existing document.");

    // Update document content
    await supabase.from("documents").update({
      title: docTitle,
      content: fullMd,
      file_type: "pdf",
      metadata: {
        source: "PTTRM_VTEC_JIFFY_POS_Resource_Summary_DEV_TH.pdf",
        pdfUrl: "/docs/PTTRM_VTEC_JIFFY_POS_Resource_Summary_DEV_TH.pdf",
        author: "DailiTech Co., Ltd. (AWS Advanced Consulting Partner)",
        version: "1.5",
        date: "2026-10-26",
        environment: "DEV",
        region: "ap-southeast-7 (Bangkok)",
        totalPages: 6,
        totalChunks: chunks.length,
      },
      updated_at: new Date().toISOString(),
    }).eq("id", documentId);
  } else {
    const { data: newDoc, error: docError } = await supabase
      .from("documents")
      .insert({
        workspace_id: workspaceId,
        title: docTitle,
        file_type: "pdf",
        content: fullMd,
        metadata: {
          source: "PTTRM_VTEC_JIFFY_POS_Resource_Summary_DEV_TH.pdf",
          pdfUrl: "/docs/PTTRM_VTEC_JIFFY_POS_Resource_Summary_DEV_TH.pdf",
          author: "DailiTech Co., Ltd. (AWS Advanced Consulting Partner)",
          version: "1.5",
          date: "2026-10-26",
          environment: "DEV",
          region: "ap-southeast-7 (Bangkok)",
          totalPages: 6,
          totalChunks: chunks.length,
        },
      })
      .select("id")
      .single();

    if (docError || !newDoc) {
      throw new Error(`Failed to create document: ${docError?.message}`);
    }
    documentId = newDoc.id;
    console.log("Created new Document ID:", documentId);
  }

  console.log("\n=== 3. Inserting Document Chunks into Supabase ===");
  const dbRecords = chunks.map((c, index) => ({
    document_id: documentId,
    workspace_id: workspaceId,
    chunk_index: index,
    content: c.content,
    token_count: Math.ceil(c.content.length / 4),
  }));

  const { error: insertErr } = await supabase.from("document_chunks").insert(dbRecords);
  if (insertErr) {
    throw insertErr;
  }

  console.log(`SUCCESS! Inserted all ${dbRecords.length} AWS chunks into Supabase!`);
}

run().catch(console.error);
