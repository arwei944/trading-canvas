export function success<T>(data: T, msg = 'success') {
  return { code: '0', msg, data, success: true };
}

export function fail(msg: string, code = '-1') {
  return { code, msg, data: null, success: false };
}
