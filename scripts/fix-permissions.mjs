const pat = "YOUR_SUPABASE_PAT_HERE";
const ref = "cnzthrnkyumhgsomszwu";

const sql = `
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO postgres, anon, authenticated, service_role;
`;

async function run() {
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${pat}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  });

  const body = await res.json();
  console.log("Status:", res.status);
  console.log("Result:", JSON.stringify(body, null, 2));
}

run().catch(console.error);
