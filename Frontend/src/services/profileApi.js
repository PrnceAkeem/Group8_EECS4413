function notImplemented(name) {
  throw new Error(`Phase 3 TODO: ${name} is not implemented yet.`);
}

export async function fetchProfile() {
  return notImplemented('fetchProfile');
}

export async function updateProfile(payload) {
  return notImplemented(`updateProfile(${JSON.stringify(payload)})`);
}

export async function saveAddress(payload) {
  return notImplemented(`saveAddress(${JSON.stringify(payload)})`);
}

export async function savePaymentMethod(payload) {
  return notImplemented(`savePaymentMethod(${JSON.stringify(payload)})`);
}
