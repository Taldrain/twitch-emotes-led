export async function fetchBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url);
  return Buffer.from(await response.arrayBuffer());
}

export async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  return response.json();
}
