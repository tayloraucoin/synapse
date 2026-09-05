import { getLocalDevOrigins } from "./local-dev-origins.mjs";

const port = process.argv[2] ?? process.env.PORT ?? "3000";
const addresses = getLocalDevOrigins();

if (addresses.length === 0) {
  console.warn("\nNo local network addresses found.\n");
  process.exit(0);
}

console.log("\nLocal network URLs (open on your phone):\n");
for (const address of addresses) {
  console.log(`  http://${address}:${port}/`);
}
console.log("");
