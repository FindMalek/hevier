// The phone's id for the PC copy was kept in the database, so a copy of the
// database put on another device (an emulator) passed for the phone and
// replaced its backup. It now lives outside the database (lib/sync/deviceId.ts).
export const sql = `
DELETE FROM app_state WHERE key = 'sync.deviceId';
`;
