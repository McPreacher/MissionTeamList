import { useEffect, useMemo, useState } from "react";

function App() {
  const [members, setMembers] = useState([
    { id: "s1", name: "Jane Student", role: "student", email: "jane.s@school.org", guardianEmail: "parent.jane@example.com", passport: false },
    { id: "s2", name: "John Student", role: "student", email: "john.s@school.org", guardianEmail: "parent.john@example.com", passport: true },
    { id: "c1", name: "Mr. Smith", role: "chaperone", email: "smith@example.com", passport: false },
  ]);

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState({ role: "all", passport: "all" });
  const [selected, setSelected] = useState(new Set());

  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState("student");
  const [formEmail, setFormEmail] = useState("");
  const [formGuardian, setFormGuardian] = useState("");
  const [formPassport, setFormPassport] = useState("no");
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("sm_members");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const normalized = parsed.map((m) => ({ ...m, passport: Boolean(m?.passport) }));
          setMembers(normalized);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem("sm_members", JSON.stringify(members)); } catch {}
  }, [members]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members
      .filter((m) => {
        if (filter.role === "students") return m.role === "student";
        if (filter.role === "chaperone") return m.role === "chaperone";
        return true;
      })
      .filter((m) => {
        if (filter.passport === "yes") return m.passport;
        if (filter.passport === "no") return !m.passport;
        return true;
      })
      .filter((m) => !q || `${m.name} ${m.email ?? ""} ${m.guardianEmail ?? ""}`.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [members, query, filter]);

  const allVisibleIds = useMemo(() => new Set(filtered.map((m) => m.id)), [filtered]);

  const toggleOne = (id) => {
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };
  const selectAllVisible = () => setSelected(new Set(allVisibleIds));
  const clearSelection = () => setSelected(new Set());

  const copyText = async (txt) => {
    if (!txt) return;
    try {
      await navigator.clipboard.writeText(txt);
      alert("Copied to clipboard");
    } catch {
      prompt("Copy:", txt);
    }
  };

  const copyAll = (which) => {
    let src = members;
    if (which === "students") src = members.filter((m) => m.role === "student");
    if (which === "chaperone") src = members.filter((m) => m.role === "chaperone");
    const out = src.map((m) => m.email).filter(Boolean).join(",");
    copyText(out);
  };

  const copySelected = () => {
    const src = members.filter((m) => selected.has(m.id));
    const out = src.map((m) => m.email).filter(Boolean).join(",");
    if (!out) { alert("No people selected."); return; }
    copyText(out);
  };

  const copySelectedWithGuardians = () => {
    const src = members.filter((m) => selected.has(m.id));
    if (src.length === 0) { alert("No people selected."); return; }
    const emails = [];
    for (const m of src) {
      if (m.email) emails.push(m.email);
      if (m.role === "student" && m.guardianEmail) emails.push(m.guardianEmail);
    }
    const out = emails.join(",");
    if (!out) { alert("No emails available for the selected people."); return; }
    copyText(out);
  };

  const resetForm = () => {
    setFormName("");
    setFormRole("student");
    setFormEmail("");
    setFormGuardian("");
    setFormPassport("no");
    setEditId(null);
  };

  const generateId = () => `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

  const onSubmit = (e) => {
    e.preventDefault();
    const name = formName.trim();
    const email = formEmail.trim();
    const guardianEmail = formGuardian.trim();
    const passport = formPassport === "yes";

    if (!name) {
      alert("Please enter a name.");
      return;
    }

    if (editId) {
      setMembers((prev) => prev.map((m) => (m.id === editId ? { ...m, name, role: formRole, email: email || undefined, guardianEmail: formRole === "student" ? guardianEmail || undefined : undefined, passport } : m)));
    } else {
      const newMember = { id: generateId(), name, role: formRole, email: email || undefined, guardianEmail: formRole === "student" ? guardianEmail || undefined : undefined, passport };
      setMembers((prev) => [...prev, newMember]);
    }

    resetForm();
  };

  const onEdit = (m) => {
    setEditId(m.id);
    setFormName(m.name || "");
    setFormRole(m.role || "student");
    setFormEmail(m.email || "");
    setFormGuardian(m.guardianEmail || "");
    setFormPassport(m.passport ? "yes" : "no");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onDelete = (id) => {
    if (!confirm("Remove this person?")) return;
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setSelected((prev) => { const n = new Set(prev); n.delete(id); return n; });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-200 via-gray-100 to-gray-300 text-slate-900">
      <header className="text-center py-6 border-b-4 border-gray-800 mb-6 shadow-sm bg-white/80 backdrop-blur">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-wide uppercase">Senior Missions Team</h1>
        <p className="text-gray-600 text-sm md:text-base mt-1">Email Management App</p>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 grid gap-10 divide-y-[6px] divide-gray-700">
        {/* Add / Edit */}
        <section className="card soft-neutral">
          <h2 className="section-title">{editId ? "EDIT PERSON" : "ADD A PERSON"}</h2>
          <form className="grid md:grid-cols-6 gap-4 items-start" onSubmit={onSubmit}>
            <div className="md:col-span-3">
              <label className="lbl">Name</label>
              <input className="inp bg-white" placeholder="Full name" value={formName} onChange={(e) => setFormName(e.target.value)} />
            </div>
            <div className="md:col-span-1">
              <label className="lbl">Role</label>
              <select className="inp bg-white" value={formRole} onChange={(e) => setFormRole(e.target.value)}>
                <option value="student">Student</option>
                <option value="chaperone">Chaperone</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="lbl">Email</label>
              <input className="inp bg-white" placeholder="School or personal (optional)" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
            </div>
            <div className="md:col-span-3">
              <label className="lbl">Guardian Email (students only)</label>
              <input className="inp bg-white" placeholder="Parent/guardian (optional)" value={formGuardian} onChange={(e) => setFormGuardian(e.target.value)} />
            </div>
            <div className="md:col-span-1">
              <label className="lbl">Passport</label>
              <select className="inp bg-white" value={formPassport} onChange={(e) => setFormPassport(e.target.value)}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
            <div className="flex gap-2 md:col-span-6 mt-3 justify-center">
              <button className="btn-border" type="submit">{editId ? "Save" : "Add"}</button>
              <button type="button" className="btn-border" onClick={resetForm}>{editId ? "Cancel edit" : "Cancel"}</button>
            </div>
          </form>
        </section>

        {/* Find & Copy */}
        <section className="card">
          <h2 className="section-title">FIND & COPY</h2>
          <div className="grid md:grid-cols-4 gap-3 items-end">
            <div className="md:col-span-2">
              <label className="lbl">Search</label>
              <input className="inp bg-white w-full" placeholder="Type a name or email" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <div className="md:col-span-1">
              <label className="lbl">Filter (Role)</label>
              <select className="inp bg-white w-full" value={filter.role} onChange={(e) => setFilter({ ...filter, role: e.target.value })}>
                <option value="all">All roles</option>
                <option value="students">Students</option>
                <option value="chaperone">Chaperones</option>
              </select>
            </div>
            <div className="md:col-span-1">
              <label className="lbl">Filter (Passport)</label>
              <select className="inp bg-white w-full" value={filter.passport} onChange={(e) => setFilter({ ...filter, passport: e.target.value })}>
                <option value="all">All</option>
                <option value="yes">Passport: Yes</option>
                <option value="no">Passport: No</option>
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mt-4 justify-center">
            <button className="btn-border" onClick={() => copyAll("all")}>Copy all</button>
            <button className="btn-border" onClick={() => copyAll("students")}>Copy students</button>
            <button className="btn-border" onClick={() => copyAll("chaperone")}>Copy chaperones</button>
            <button className="btn-border" onClick={copySelected}>Copy selected</button>
            <button className="btn-border" onClick={copySelectedWithGuardians}>Copy selected + guardians</button>
          </div>
        </section>

        {/* Team List */}
        <div className="py-1 text-center">
          <h2 className="section-title mb-2">TEAM LIST</h2>
          <p className="text-gray-700 font-medium">{filtered.length} Member{filtered.length !== 1 ? "s" : ""}</p>
        </div>

        <section className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="th w-10"><input type="checkbox" onChange={(e) => e.target.checked ? selectAllVisible() : clearSelection()} /></th>
                  <th className="th">Name</th>
                  <th className="th">Role</th>
                  <th className="th">Email</th>
                  <th className="th">Guardian Email</th>
                  <th className="th">Passport</th>
                  <th className="th w-28">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="td"><input type="checkbox" checked={selected.has(m.id)} onChange={() => toggleOne(m.id)} /></td>
                    <td className="td font-medium">{m.name}</td>
                    <td className="td capitalize">{m.role}</td>
                    <td className="td break-all">{m.email || <span className="italic text-gray-400">—</span>}</td>
                    <td className="td break-all text-gray-700">{m.role === "student" ? (m.guardianEmail || <span className="italic text-gray-400">—</span>) : <span className="italic text-gray-400">—</span>}</td>
                    <td className="td">{m.passport ? <span className="inline-flex items-center gap-1 rounded-full border border-green-700 px-2 py-0.5 text-xs font-semibold text-green-800 bg-green-50">Yes</span> : <span className="inline-flex items-center gap-1 rounded-full border border-red-700 px-2 py-0.5 text-xs font-semibold text-red-800 bg-red-50">No</span>}</td>
                    <td className="td">
                      <div className="flex gap-2">
                        <button className="btn-sm" onClick={() => onEdit(m)}>Edit</button>
                        <button className="btn-sm danger" onClick={() => onDelete(m.id)}>Remove</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td className="td text-center italic text-gray-500" colSpan={7}>No people found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <style>{`
        .card { @apply rounded-2xl shadow p-4 md:p-6 bg-white/95 backdrop-blur; }
        .soft-neutral { @apply bg-gray-100/90; }
        .section-title { @apply text-center text-2xl font-bold uppercase tracking-wide text-slate-800 mb-6; }
        .lbl { @apply block text-sm font-medium mb-1 text-slate-700; }
        .inp { @apply w-full h-11 text-base border-2 border-slate-300 rounded-xl px-3 py-2 shadow-inner placeholder-slate-400 focus:outline-none focus:border-gray-700 focus:ring-2 focus:ring-gray-600/30; }
        .btn-border { @apply border-2 border-gray-800 text-gray-900 rounded-xl px-5 py-2 text-base font-semibold bg-white hover:bg-gray-100 shadow; }
        .btn-sm { @apply border border-gray-800 rounded-lg px-2 py-1 text-xs font-semibold bg-white hover:bg-gray-100 shadow-sm; }
        .btn-sm.danger { @apply border-red-700 text-red-800 hover:bg-red-50; }
        .th { @apply px-3 py-2 font-semibold text-slate-700; }
        .td { @apply px-3 py-2 align-top; }
      `}</style>
    </div>
  );
}

export default App;
