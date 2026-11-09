import type os from 'node:os';

// The PC's address on the home Wi-Fi, for the QR code. Docker and VM bridges
// also have private addresses, but the phone can't reach them.
const VIRTUAL = /^(docker|br-|virbr|veth)/;

function rank(address: string): number {
  if (address.startsWith('192.168.')) return 0;
  if (address.startsWith('10.')) return 1;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(address)) return 2;
  return 3;
}

export function pickLanAddress(ifaces: NodeJS.Dict<os.NetworkInterfaceInfo[]>): string | null {
  const candidates = Object.entries(ifaces)
    .filter(([name]) => !VIRTUAL.test(name))
    .flatMap(([, infos]) => infos ?? [])
    .filter((i) => i.family === 'IPv4' && !i.internal)
    .map((i) => i.address)
    .sort((a, b) => rank(a) - rank(b));
  return candidates[0] ?? null;
}

export function pairLink(host: string, port: number, key: string): string {
  return `hevier://pair?host=${host}&port=${port}&key=${key}`;
}
