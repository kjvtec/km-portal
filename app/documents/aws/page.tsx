import React from "react";
import fs from "fs";
import path from "path";
import { AwsDocumentViewer } from "@/components/portal/AwsDocumentViewer";

export const dynamic = "force-static";

export const metadata = {
  title: "AWS DEV Resource Summary | PTTRM VTEC JIFFY POS KM Portal",
  description:
    "รายงานสรุปทรัพยากรระบบ AWS (ฉบับภาษาไทยโดยละเอียด) โครงการ PTTRM VTEC JIFFY POS สภาพแวดล้อมเพื่อการพัฒนา (DEV Environment v1.5) โดย DailiTech",
};

export default function AwsDocumentPage() {
  const mdPath = path.join(process.cwd(), "data", "aws-dev-resource-summary.md");
  let content = "";
  if (fs.existsSync(mdPath)) {
    content = fs.readFileSync(mdPath, "utf-8");
  } else {
    content = "# ไม่พบไฟล์เนื้อหา aws-dev-resource-summary.md";
  }

  return <AwsDocumentViewer content={content} />;
}
