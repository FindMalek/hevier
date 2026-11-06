import type os from 'node:os';
import { describe, expect, it } from 'vitest';
import { pairLink, pickLanAddress } from './address';

const v4 = (address: string, internal = false): os.NetworkInterfaceInfo =>
  ({ address, family: 'IPv4', internal, netmask: '255.255.255.0', mac: '00:00:00:00:00:00', cidr: null }) as os.NetworkInterfaceInfo;

describe('pickLanAddress', () => {
  it('picks the home network over docker and loopback', () => {
    expect(
      pickLanAddress({
        lo: [v4('127.0.0.1', true)],
        docker0: [v4('172.17.0.1')],
        wlp2s0: [v4('192.168.1.23')],
      })
    ).toBe('192.168.1.23');
  });

  it('prefers 192.168 over 10. and 172.16-31', () => {
    expect(pickLanAddress({ a: [v4('172.20.0.5')], b: [v4('10.0.0.8')] })).toBe('10.0.0.8');
    expect(pickLanAddress({ a: [v4('10.0.0.8')], b: [v4('192.168.0.4')] })).toBe('192.168.0.4');
  });

  it('skips virtual bridges', () => {
    expect(pickLanAddress({ 'br-1a2b': [v4('192.168.49.1')], virbr0: [v4('192.168.122.1')], veth9: [v4('10.1.1.1')] })).toBeNull();
  });

  it('null when only loopback', () => {
    expect(pickLanAddress({ lo: [v4('127.0.0.1', true)] })).toBeNull();
  });
});

describe('pairLink', () => {
  it('builds the hevier://pair link the phone scans', () => {
    expect(pairLink('192.168.1.23', 4873, 'ab')).toBe('hevier://pair?host=192.168.1.23&port=4873&key=ab');
  });
});
