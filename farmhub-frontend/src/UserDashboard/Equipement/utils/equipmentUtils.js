// Equipment utilities
// All equipment data is now fetched from the real backend API (/api/equipment).
// These helpers are kept as stubs for any legacy imports that may still reference them.

export const initializeEquipmentData = () => {
  // No-op: equipment is now loaded from the API, not seeded into localStorage.
};

export const getAvailableEquipment = () => {
  // No-op: use api.get('/equipment') filtered by availability in the component.
  return [];
};

export const getUserEquipment = (_userId) => {
  // No-op: use api.get('/equipment/my-equipment') in the component.
  return [];
};

export const getUserOrders = (_userId) => {
  // No-op: use api.get('/bookings/my-bookings') in the component.
  return [];
};
