export const BASE =
  import.meta.env.VITE_API_URL || "http://localhost:4000";

const API = BASE + "/api";

export const token = () => localStorage.getItem("fn_token");

export async function api(
  path: string,
  opt: RequestInit = {}
) {
  const r = await fetch(API + path, {
    ...opt,
    headers: {
      "Content-Type": "application/json",
      ...(token()
        ? { Authorization: `Bearer ${token()}` }
        : {}),
      ...(opt.headers || {})
    }
  });

  if (!r.ok) {
    const d = await r.json().catch(() => ({
      message: "Fel"
    }));

    throw new Error(d.message);
  }

  return r.status === 204 ? null : r.json();
}

export async function upload(
  id: string,
  file: File
) {
  const f = new FormData();
  f.append("bild", file);

  const r = await fetch(
    `${API}/felanmalningar/${id}/bilder`,
    {
      method: "POST",
      headers: token()
        ? { Authorization: `Bearer ${token()}` }
        : {},
      body: f
    }
  );

  if (!r.ok) {
    const d = await r.json().catch(() => ({
      message: "Uppladdningen misslyckades"
    }));

    throw new Error(d.message);
  }

  return r.json();
}
