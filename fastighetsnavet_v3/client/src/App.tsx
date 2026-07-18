import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Building2,
  Edit3,
  Eye,
  Home,
  ImagePlus,
  LogOut,
  Plus,
  Trash2,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { api, BASE, upload } from "./api";

type Row = Record<string, any>;

type Res =
  | "fastigheter"
  | "hyresgaster"
  | "felanmalningar"
  | "arbetsorder";

const base: any = {
  fastigheter: {
    title: "Fastigheter",
    cols: [
      ["namn", "Namn"],
      ["adress", "Adress"],
      ["antal_lagenheter", "Lägenheter"],
      ["status", "Status"],
    ],
    fields: [
      ["namn", "Namn"],
      ["adress", "Adress"],
      ["antal_lagenheter", "Antal lägenheter", "number"],
      ["status", "Status"],
      ["anteckning", "Anteckning"],
    ],
  },

  hyresgaster: {
    title: "Hyresgäster",
    cols: [
      ["namn", "Namn"],
      ["lagenhet", "Lägenhet"],
      ["telefon", "Telefon"],
      ["epost", "E-post"],
    ],
    fields: [
      ["namn", "Namn"],
      ["lagenhet", "Lägenhet"],
      ["telefon", "Telefon"],
      ["epost", "E-post"],
      ["fastighet_id", "Fastighet", "select"],
    ],
  },

  felanmalningar: {
    title: "Felanmälningar",
    cols: [
      ["rubrik", "Ärende"],
      ["prioritet", "Prioritet"],
      ["status", "Status"],
      ["skapad", "Skapad"],
    ],
    fields: [
      ["rubrik", "Rubrik"],
      ["beskrivning", "Beskrivning"],
      ["fastighet_id", "Fastighet", "select"],
      ["hyresgast_id", "Hyresgäst", "select"],
      ["prioritet", "Prioritet"],
      ["status", "Status"],
      ["skapad", "Skapad", "date"],
    ],
  },

  arbetsorder: {
    title: "Arbetsorder",
    cols: [
      ["titel", "Titel"],
      ["ansvarig", "Ansvarig"],
      ["status", "Status"],
      ["datum", "Datum"],
    ],
    fields: [
      ["titel", "Titel"],
      ["beskrivning", "Beskrivning"],
      ["ansvarig", "Ansvarig"],
      ["status", "Status"],
      ["datum", "Datum", "date"],
      ["felanmalan_id", "Felanmälan", "select"],
    ],
  },
};

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [view, setView] = useState<"dashboard" | Res>("dashboard");
  const [rows, setRows] = useState<Row[]>([]);
  const [dash, setDash] = useState<any>();
  const [modal, setModal] = useState<any>();
  const [detail, setDetail] = useState<any>();

  const [refs, setRefs] = useState<any>({
    fastigheter: [],
    hyresgaster: [],
    felanmalningar: [],
  });

  useEffect(() => {
    const token = localStorage.getItem("fn_token");

    if (token) {
      void api("/me")
        .then(setUser)
        .catch(() => {
          localStorage.clear();
        });
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    void Promise.all([
      api("/fastigheter"),
      api("/hyresgaster"),
      api("/felanmalningar"),
    ]).then(([fastigheter, hyresgaster, felanmalningar]) => {
      setRefs({
        fastigheter,
        hyresgaster,
        felanmalningar,
      });
    });

    void refresh();
  }, [user, view]);

  async function refresh() {
    if (!user) return;

    if (view === "dashboard") {
      setDash(await api("/dashboard"));
    } else {
      setRows(await api("/" + view));
    }
  }

  const cfg = useMemo(() => {
    const c = structuredClone(base);

    const opts = (
      items: any[],
      label = (item: any) => item.namn
    ) =>
      items.map((item) => ({
        value: item.id,
        label: label(item),
      }));

    c.hyresgaster.opts = {
      fastighet_id: opts(refs.fastigheter),
    };

    c.felanmalningar.opts = {
      fastighet_id: opts(refs.fastigheter),
      hyresgast_id: opts(
        refs.hyresgaster,
        (item) => `${item.namn} (${item.lagenhet})`
      ),
    };

    c.arbetsorder.opts = {
      felanmalan_id: opts(
        refs.felanmalningar,
        (item) => item.rubrik
      ),
    };

    return c;
  }, [refs]);

  if (!user) {
    return (
      <Login
        ok={(newUser: any, token: string) => {
          localStorage.setItem("fn_token", token);
          setUser(newUser);
        }}
      />
    );
  }

  const menu: any[] = [
    ["dashboard", "Översikt", Home],
    ["fastigheter", "Fastigheter", Building2],
    ["hyresgaster", "Hyresgäster", Users],
    ["felanmalningar", "Felanmälningar", AlertTriangle],
    ["arbetsorder", "Arbetsorder", Wrench],
  ];

  async function save(data: Row) {
    const resource = view as Res;

    if (modal?.row) {
      await api(`/${resource}/${modal.row.id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    } else {
      await api(`/${resource}`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    }

    setModal(null);
    await refresh();
  }

  async function del(id: string) {
    if (!confirm("Ta bort posten?")) return;

    await api(`/${view}/${id}`, {
      method: "DELETE",
    });

    await refresh();
  }

  return (
    <div className="app">
      <aside>
        <div className="brand">
          <Building2 />
          Fastighetsnavet
        </div>

        <nav>
          {menu.map(([id, label, Icon]) => (
            <button
              key={id}
              className={view === id ? "active" : ""}
              onClick={() => {
                setView(id);
                setDetail(null);
              }}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>

        <div className="userbox">
          <b>{user.namn}</b>
          <small>{user.roll}</small>

          <button
            onClick={() => {
              localStorage.clear();
              setUser(null);
            }}
          >
            <LogOut size={16} />
            Logga ut
          </button>
        </div>
      </aside>

      <main>
        <header>
          <div>
            <p className="eyebrow">FASTIGHETSFÖRVALTNING</p>

            <h1>
              {view === "dashboard"
                ? "Översikt"
                : cfg[view].title}
            </h1>
          </div>

          {view !== "dashboard" && (
            <button
              className="primary"
              onClick={() => setModal({})}
            >
              <Plus size={18} />
              Skapa nytt
            </button>
          )}
        </header>

        {view === "dashboard" ? (
          <Dashboard d={dash} />
        ) : (
          <TableView
            rows={rows}
            cfg={cfg[view]}
            detail={
              view === "fastigheter" ||
              view === "felanmalningar"
            }
            edit={setModal}
            open={(id: string) =>
              setDetail({
                type: view,
                id,
              })
            }
            del={user.roll === "admin" ? del : null}
          />
        )}
      </main>

      {modal && view !== "dashboard" && (
        <Form
          title={modal.row ? "Redigera" : "Skapa ny"}
          cfg={cfg[view]}
          initial={modal.row}
          close={() => setModal(null)}
          save={save}
        />
      )}

      {detail?.type === "fastigheter" && (
        <Fastighet
          id={detail.id}
          close={() => setDetail(null)}
        />
      )}

      {detail?.type === "felanmalningar" && (
        <Fel
          id={detail.id}
          admin={user.roll === "admin"}
          close={() => setDetail(null)}
        />
      )}
    </div>
  );
}

function Login({ ok }: any) {
  const [email, setEmail] = useState(
    "admin@fastighetsnavet.se"
  );
  const [password, setPassword] =
    useState("Admin123!");
  const [error, setError] = useState("");

  return (
    <div className="login">
      <form
        onSubmit={async (event) => {
          event.preventDefault();

          try {
            const data = await api("/login", {
              method: "POST",
              body: JSON.stringify({
                epost: email,
                password,
              }),
            });

            ok(data.user, data.token);
          } catch (err: any) {
            setError(err.message);
          }
        }}
      >
        <div className="loginLogo">
          <Building2 />
          <b>Fastighetsnavet</b>
        </div>

        <h1>Logga in</h1>

        <label>
          E-post
          <input
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
          />
        </label>

        <label>
          Lösenord
          <input
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
          />
        </label>

        {error && <p className="error">{error}</p>}

        <button className="primary">
          Logga in
        </button>
      </form>
    </div>
  );
}

function Dashboard({ d }: any) {
  if (!d) {
    return <p>Laddar…</p>;
  }

  const stats = [
    ["Fastigheter", d.fastigheter, Building2],
    ["Lägenheter", d.lagenheter, Home],
    ["Hyresgäster", d.hyresgaster, Users],
    ["Öppna ärenden", d.oppnaArenden, AlertTriangle],
    ["Arbetsorder", d.arbetsorder, Wrench],
  ];

  return (
    <div className="stats">
      {stats.map(([label, value, Icon]: any) => (
        <div className="stat" key={label}>
          <div className="statIcon">
            <Icon />
          </div>

          <div>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        </div>
      ))}
    </div>
  );
}

function TableView({
  rows,
  cfg,
  detail,
  edit,
  open,
  del,
}: any) {
  return (
    <div className="tableWrap">
      <table>
        <thead>
          <tr>
            {cfg.cols.map((column: any) => (
              <th key={column[0]}>
                {column[1]}
              </th>
            ))}

            <th>Åtgärder</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row: any) => (
            <tr key={row.id}>
              {cfg.cols.map((column: any) => (
                <td key={column[0]}>
                  {row[column[0]] ?? "—"}
                </td>
              ))}

              <td className="rowActions">
                {detail && (
                  <button
                    type="button"
                    aria-label="Visa detaljer"
                    onClick={() => open(row.id)}
                  >
                    <Eye size={16} />
                  </button>
                )}

                <button
                  type="button"
                  aria-label="Redigera"
                  onClick={() =>
                    edit({ row })
                  }
                >
                  <Edit3 size={16} />
                </button>

                {del && (
                  <button
                    type="button"
                    className="dangerIcon"
                    aria-label="Ta bort"
                    onClick={() => del(row.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Form({
  title,
  cfg,
  initial,
  close,
  save,
}: any) {
  const [data, setData] = useState(
    initial || {}
  );

  return (
    <div className="overlay">
      <form
        className="modal"
        onSubmit={(event) => {
          event.preventDefault();
          void save(data);
        }}
      >
        <div className="modalHead">
          <h2>{title}</h2>

          <button
            type="button"
            onClick={close}
            aria-label="Stäng"
          >
            <X />
          </button>
        </div>

        {cfg.fields.map(
          ([key, label, type]: any) => (
            <label key={key}>
              {label}

              {type === "select" ? (
                <select
                  value={data[key] || ""}
                  onChange={(event) =>
                    setData({
                      ...data,
                      [key]:
                        event.target.value,
                    })
                  }
                >
                  <option value="">
                    Välj…
                  </option>

                  {(cfg.opts?.[key] || []).map(
                    (option: any) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    )
                  )}
                </select>
              ) : (
                <input
                  type={type || "text"}
                  value={data[key] || ""}
                  onChange={(event) =>
                    setData({
                      ...data,
                      [key]:
                        type === "number"
                          ? Number(
                              event.target.value
                            )
                          : event.target.value,
                    })
                  }
                />
              )}
            </label>
          )
        )}

        <div className="actions">
          <button
            type="button"
            onClick={close}
          >
            Avbryt
          </button>

          <button className="primary">
            Spara
          </button>
        </div>
      </form>
    </div>
  );
}

function Drawer({
  close,
  children,
}: any) {
  return (
    <div
      className="drawerOverlay"
      onMouseDown={close}
    >
      <section
        className="drawer"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <button
          className="closeDrawer"
          onClick={close}
          aria-label="Stäng"
        >
          <X />
        </button>

        {children}
      </section>
    </div>
  );
}

function Fastighet({
  id,
  close,
}: any) {
  const [data, setData] =
    useState<any>();

  useEffect(() => {
    void api(
      `/fastigheter/${id}/detaljer`
    ).then(setData);
  }, [id]);

  if (!data) {
    return (
      <Drawer close={close}>
        Laddar…
      </Drawer>
    );
  }

  return (
    <Drawer close={close}>
      <h2>{data.fastighet.namn}</h2>

      <p>{data.fastighet.adress}</p>

      <h3>Anteckning</h3>

      <p>
        {data.fastighet.anteckning || "—"}
      </p>

      <h3>Hyresgäster</h3>

      <Mini
        rows={data.hyresgaster}
        cols={[
          "namn",
          "lagenhet",
          "telefon",
        ]}
      />

      <h3>Felanmälningar</h3>

      <Mini
        rows={data.felanmalningar}
        cols={[
          "rubrik",
          "prioritet",
          "status",
        ]}
      />
    </Drawer>
  );
}

function Fel({
  id,
  admin,
  close,
}: any) {
  const [data, setData] =
    useState<any>();

  const [file, setFile] =
    useState<File>();

  const load = async () => {
    const result = await api(
      `/felanmalningar/${id}/detaljer`
    );

    setData(result);
  };

  useEffect(() => {
    void load();
  }, [id]);

  if (!data) {
    return (
      <Drawer close={close}>
        Laddar…
      </Drawer>
    );
  }

  return (
    <Drawer close={close}>
      <h2>
        {data.felanmalan.rubrik}
      </h2>

      <p>
        {data.felanmalan.fastighet_namn}
        {" · "}
        {data.felanmalan.hyresgast_namn}
      </p>

      <p>
        {data.felanmalan.beskrivning}
      </p>

      <h3>Arbetsorder</h3>

      <Mini
        rows={data.arbetsorder}
        cols={[
          "titel",
          "ansvarig",
          "status",
          "datum",
        ]}
      />

      <h3>Bilder</h3>

      <div className="uploadRow">
        <input
          type="file"
          accept="image/*"
          onChange={(event) =>
            setFile(
              event.target.files?.[0]
            )
          }
        />

        <button
          type="button"
          className="primary"
          disabled={!file}
          onClick={async () => {
            if (!file) return;

            await upload(id, file);
            setFile(undefined);
            await load();
          }}
        >
          <ImagePlus size={16} />
          Ladda upp
        </button>
      </div>

      <div className="gallery">
        {data.bilder.map(
          (bild: any) => (
            <figure key={bild.id}>
              <img
                src={`${BASE}/uploads/${bild.filnamn}`}
                alt={
                  bild.originalnamn ||
                  "Bild till felanmälan"
                }
              />

              <figcaption>
                {bild.originalnamn}
              </figcaption>

              {admin && (
                <button
                  type="button"
                  aria-label="Ta bort bild"
                  onClick={async () => {
                    await api(
                      `/bilder/${bild.id}`,
                      {
                        method: "DELETE",
                      }
                    );

                    await load();
                  }}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </figure>
          )
        )}
      </div>
    </Drawer>
  );
}

function Mini({
  rows,
  cols,
}: any) {
  if (!rows?.length) {
    return <p>Inga poster.</p>;
  }

  return (
    <div className="miniTable">
      <table>
        <tbody>
          {rows.map(
            (row: any, index: number) => (
              <tr key={row.id ?? index}>
                {cols.map(
                  (column: string) => (
                    <td key={column}>
                      {row[column] ?? "—"}
                    </td>
                  )
                )}
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}
