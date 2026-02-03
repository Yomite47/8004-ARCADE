import { packToFs } from 'ipfs-car/pack/fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const input = path.join(__dirname, '../public/ready_for_upload/metadata');
const output = path.join(__dirname, '../metadata.car');

console.log(`📦 Packing directory: ${input}`);
console.log(`➡️  Output CAR file: ${output}`);

try {
  const { root } = await packToFs({ input, output });
  console.log(`✅ Packed successfully!`);
  console.log(`🔑 Root CID: ${root.toString()}`);
} catch (err) {
  console.error("❌ Packing failed:", err);
  process.exit(1);
}
