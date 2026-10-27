async function check() {
  const res = await fetch("https://km-portal-gamma.vercel.app/");
  const html = await res.text();
  const htmlTag = html.slice(0, 300);
  console.log("HTML Tag:\n", htmlTag);
}
check();
