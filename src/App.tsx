import { useMemo, useState } from "react";
import {
  Activity,
  ArrowDown,
  ArrowDownRight,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  Command,
  Download,
  LayoutDashboard,
  LifeBuoy,
  LockKeyhole,
  Menu,
  MessageSquareText,
  Moon,
  MoreHorizontal,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sun,
  Ticket,
  Users,
  X,
  Zap,
} from "lucide-react";

type Status = "Aberto" | "Em andamento" | "Aguardando" | "Resolvido";
type Priority = "Crítica" | "Alta" | "Média" | "Baixa";
type Section = "Visão geral" | "Chamados" | "Equipe";
type TicketRecord = {
  id: string;
  title: string;
  category: string;
  requester: string;
  initials: string;
  color: string;
  department: string;
  priority: Priority;
  status: Status;
  description?: string;
  assignee: string;
  assigneeInitials: string;
  updated: string;
  sla: string;
  dueSoon?: boolean;
};

const initialTickets: TicketRecord[] = [
  { id: "NX-2849", title: "Acesso ao ambiente de produção", category: "Acesso e permissões", requester: "Mariana Costa", initials: "MC", color: "lavender", department: "Engenharia", priority: "Crítica", status: "Em andamento", assignee: "Rafael Mendes", assigneeInitials: "RM", updated: "há 8 min", sla: "00:42:18", dueSoon: true },
  { id: "NX-2848", title: "Notebook reiniciando durante chamadas", category: "Hardware", requester: "Pedro Nascimento", initials: "PN", color: "peach", department: "Comercial", priority: "Alta", status: "Aberto", assignee: "Ana Luiza", assigneeInitials: "AL", updated: "há 24 min", sla: "02:18:42" },
  { id: "NX-2847", title: "VPN desconecta ao trocar de rede", category: "Conectividade", requester: "Camila Rocha", initials: "CR", color: "mint", department: "Produto", priority: "Alta", status: "Em andamento", assignee: "Bruno Alves", assigneeInitials: "BA", updated: "há 51 min", sla: "01:06:30", dueSoon: true },
  { id: "NX-2846", title: "Solicitação de acesso ao Figma", category: "Acesso e permissões", requester: "Lucas Ferreira", initials: "LF", color: "blue", department: "Design", priority: "Média", status: "Aguardando", assignee: "Ana Luiza", assigneeInitials: "AL", updated: "há 1 h", sla: "05:32:10" },
  { id: "NX-2845", title: "Monitor externo sem sinal", category: "Hardware", requester: "Isabela Martins", initials: "IM", color: "pink", department: "Marketing", priority: "Média", status: "Aberto", assignee: "Rafael Mendes", assigneeInitials: "RM", updated: "há 2 h", sla: "06:14:55" },
  { id: "NX-2844", title: "Erro ao sincronizar arquivos", category: "Software", requester: "Thiago Oliveira", initials: "TO", color: "yellow", department: "Financeiro", priority: "Baixa", status: "Resolvido", assignee: "Bruno Alves", assigneeInitials: "BA", updated: "há 3 h", sla: "Concluído" },
  { id: "NX-2843", title: "Instalação do pacote Adobe", category: "Software", requester: "Beatriz Souza", initials: "BS", color: "mint", department: "Design", priority: "Baixa", status: "Resolvido", assignee: "Ana Luiza", assigneeInitials: "AL", updated: "há 4 h", sla: "Concluído" },
  { id: "NX-2842", title: "Acesso bloqueado após atualização", category: "Acesso e permissões", requester: "André Lima", initials: "AL", color: "peach", department: "Operações", priority: "Alta", status: "Em andamento", assignee: "Rafael Mendes", assigneeInitials: "RM", updated: "ontem", sla: "00:18:24", dueSoon: true },
];

const team = [
  { name: "Rafael Mendes", initials: "RM", role: "Especialista de infraestrutura", open: 8, resolved: 42, color: "lavender", presence: "online" },
  { name: "Ana Luiza", initials: "AL", role: "Analista de suporte", open: 6, resolved: 37, color: "peach", presence: "online" },
  { name: "Bruno Alves", initials: "BA", role: "Técnico de redes", open: 5, resolved: 29, color: "mint", presence: "away" },
  { name: "Fernanda Lima", initials: "FL", role: "Administradora de TI", open: 3, resolved: 51, color: "pink", presence: "online" },
];

const navItems = [
  { label: "Visão geral" as const, icon: LayoutDashboard },
  { label: "Chamados" as const, icon: Ticket },
  { label: "Equipe" as const, icon: Users },
];

function App() {
  const [tickets, setTickets] = useState(initialTickets);
  const [section, setSection] = useState<Section>("Visão geral");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos os status");
  const [priorityFilter, setPriorityFilter] = useState("Todas as prioridades");
  const [selected, setSelected] = useState<TicketRecord | null>(null);
  const [creating, setCreating] = useState(false);
  const [dark, setDark] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [page, setPage] = useState(1);
  const [sortNewest, setSortNewest] = useState(true);
  const [toast, setToast] = useState("");
  const todayLabel = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })
    .format(new Date())
    .toLocaleUpperCase("pt-BR");

  const filteredTickets = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("pt-BR");
    const filtered = tickets.filter((ticket) => {
      const matchesQuery = !term || [ticket.id, ticket.title, ticket.requester, ticket.department].some((value) => value.toLocaleLowerCase("pt-BR").includes(term));
      const matchesStatus = statusFilter === "Todos os status" || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === "Todas as prioridades" || ticket.priority === priorityFilter;
      return matchesQuery && matchesStatus && matchesPriority;
    });
    return sortNewest ? filtered : [...filtered].reverse();
  }, [tickets, query, statusFilter, priorityFilter, sortNewest]);

  const pageSize = 6;
  const pageCount = Math.max(1, Math.ceil(filteredTickets.length / pageSize));
  const visibleTickets = filteredTickets.slice((page - 1) * pageSize, page * pageSize);
  const openCount = tickets.filter((ticket) => ticket.status !== "Resolvido").length;

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  function addTicket(form: { title: string; category: string; requester: string; department: string; priority: Priority; description: string }) {
    const initials = form.requester.split(" ").slice(0, 2).map((part) => part[0]).join("").toUpperCase();
    const ticket: TicketRecord = {
      id: `NX-${2850 + tickets.length - initialTickets.length}`,
      title: form.title,
      category: form.category,
      requester: form.requester,
      initials,
      color: "blue",
      department: form.department,
      priority: form.priority,
      status: "Aberto",
      description: form.description,
      assignee: "Não atribuído",
      assigneeInitials: "—",
      updated: "agora",
      sla: form.priority === "Crítica" || form.priority === "Alta" ? "01:00:00" : "08:00:00",
    };
    setTickets((current) => [ticket, ...current]);
    setCreating(false);
    setSection("Chamados");
    setPage(1);
    notify(`Chamado ${ticket.id} criado com sucesso`);
  }

  function changeStatus(id: string, status: Status) {
    setTickets((current) => current.map((ticket) => ticket.id === id ? { ...ticket, status, updated: "agora", sla: status === "Resolvido" ? "Concluído" : ticket.sla } : ticket));
    setSelected((current) => current?.id === id ? { ...current, status, updated: "agora", sla: status === "Resolvido" ? "Concluído" : current.sla } : current);
    notify(`Chamado ${id} atualizado`);
  }

  function exportTickets() {
    const header = ["Chamado", "Título", "Solicitante", "Departamento", "Prioridade", "Status"];
    const rows = filteredTickets.map((ticket) => [ticket.id, ticket.title, ticket.requester, ticket.department, ticket.priority, ticket.status]);
    const csv = [header, ...rows].map((row) => row.map((field) => `"${field.replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "sclouddesk-chamados.csv";
    link.click();
    URL.revokeObjectURL(url);
    notify("Relatório exportado em CSV");
  }

  return (
    <div className={`app-shell${dark ? " dark" : ""}`}>
      <aside className={`sidebar${mobileNav ? " sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><Command size={19} strokeWidth={2.8} /></div>
          <div className="brand-copy">
            <span>Scloud<span className="brand-light">Desk</span></span>
            <small>Powered for <strong>J64D</strong></small>
          </div>
          <button className="icon-button mobile-close" onClick={() => setMobileNav(false)} aria-label="Fechar menu"><X size={18} /></button>
        </div>
        <div className="workspace-switch">
          <div className="workspace-avatar"><BriefcaseBusiness size={15} /></div>
          <div className="workspace-copy"><strong>Acme Corporation</strong><span>Workspace Enterprise</span></div>
          <ChevronDown size={15} className="muted-icon" />
        </div>
        <div className="nav-section-label">MENU PRINCIPAL</div>
        <nav className="main-nav" aria-label="Menu principal">
          {navItems.map(({ label, icon: Icon }) => (
            <button key={label} className={`nav-link${section === label ? " active" : ""}`} onClick={() => { setSection(label); setMobileNav(false); }}>
              <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
              {label === "Chamados" && <span className="nav-count">{openCount}</span>}
            </button>
          ))}
        </nav>
        <div className="nav-section-label tools-label">GERENCIAMENTO</div>
        <nav className="main-nav" aria-label="Gerenciamento">
          <button className="nav-link" onClick={() => notify("Relatórios exportados pelo painel de chamados")}><Activity size={18} strokeWidth={1.8} /><span>Relatórios</span></button>
          <button className="nav-link" onClick={() => notify("Central de conhecimento em breve")}><LifeBuoy size={18} strokeWidth={1.8} /><span>Base de conhecimento</span><span className="nav-new">NOVO</span></button>
          <button className="nav-link" onClick={() => notify("Configurações do workspace")}><Settings2 size={18} strokeWidth={1.8} /><span>Configurações</span></button>
        </nav>
        <div className="sidebar-bottom">
          <div className="plan-card">
            <div className="plan-icon"><Zap size={15} fill="currentColor" /></div>
            <div className="plan-copy"><strong>Plano Enterprise</strong><span>Seu time está voando!</span></div>
            <ArrowUpRight size={15} className="plan-arrow" />
            <div className="plan-progress"><span /></div>
            <small>78% dos chamados resolvidos no prazo</small>
          </div>
          <button className="profile-button" onClick={() => notify("Perfil de Júlia disponível")}>
            <div className="avatar avatar-purple">JS</div>
            <div className="profile-copy"><strong>Júlia Santos</strong><span>Administradora</span></div>
            <MoreHorizontal size={19} className="muted-icon" />
          </button>
        </div>
      </aside>

      {mobileNav && <button className="mobile-backdrop" onClick={() => setMobileNav(false)} aria-label="Fechar menu" />}
      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            <button className="icon-button mobile-menu" onClick={() => setMobileNav(true)} aria-label="Abrir menu"><Menu size={20} /></button>
            <span>Workspace</span><ChevronRight size={14} /><strong>{section}</strong>
          </div>
          <div className="top-actions">
            <label className="global-search">
              <Search size={16} />
              <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Buscar chamados..." />
              <kbd>⌘ K</kbd>
            </label>
            <div className="top-divider" />
            <button className="icon-button theme-toggle" onClick={() => setDark(!dark)} aria-label={dark ? "Ativar tema claro" : "Ativar tema escuro"}>{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
            <div className="notification-wrap">
              <button className={`icon-button notification-button${showNotifications ? " selected" : ""}`} onClick={() => setShowNotifications(!showNotifications)} aria-label="Notificações">
                <Bell size={18} /><i />
              </button>
              {showNotifications && <div className="notification-popover"><div className="popover-head"><strong>Notificações</strong><button onClick={() => setShowNotifications(false)} aria-label="Fechar notificações"><X size={15} /></button></div><div className="notification-item"><span className="notification-dot violet" /><p><strong>Prazo próximo</strong><br />NX-2849 vence em menos de 1 hora.</p><small>há 8 min</small></div><div className="notification-item"><span className="notification-dot green" /><p><strong>Chamado resolvido</strong><br />NX-2844 foi finalizado por Bruno.</p><small>há 1 h</small></div><button className="all-notifications" onClick={() => { setSection("Chamados"); setShowNotifications(false); }}>Ver todos os chamados <ArrowRight size={14} /></button></div>}
            </div>
            <div className="avatar avatar-purple top-avatar">JS</div>
          </div>
        </header>

        <div className="page-content">
          {section === "Equipe" ? (
            <TeamPage onAdd={() => notify("Convite de equipe iniciado")} />
          ) : (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow"><span className="live-dot" /> {todayLabel}</div>
                  <h1>{section === "Visão geral" ? <>Bom dia, Júlia <span className="wave">✦</span></> : "Central de chamados"}</h1>
                  <p>{section === "Visão geral" ? "Aqui está o resumo das operações de suporte hoje." : "Acompanhe e gerencie todas as solicitações do seu time."}</p>
                </div>
                <div className="heading-actions">
                  <button className="button button-secondary" onClick={exportTickets}><Download size={16} /> <span>Exportar</span></button>
                  <button className="button button-primary" onClick={() => setCreating(true)}><Plus size={17} strokeWidth={2.5} /> Novo chamado</button>
                </div>
              </div>

              {section === "Visão geral" && (
                <>
                  <section className="metrics-grid" aria-label="Indicadores">
                    <MetricCard title="Chamados abertos" value={String(openCount).padStart(2, "0")} note="vs. período anterior" change="+12,5%" icon={<Ticket size={17} />} trend="up" tint="purple" />
                    <MetricCard title="Em andamento" value="18" note="3 aguardando resposta" change="+4,2%" icon={<Activity size={17} />} trend="up" tint="blue" />
                    <MetricCard title="Tempo médio de resposta" value={<>24<span>min</span></>} note="meta: até 30 min" change="-8,1%" icon={<Clock3 size={17} />} trend="down" tint="orange" />
                    <MetricCard title="SLA cumprido" value={<>96<span>,8%</span></>} note="meta: acima de 95%" change="+2,4%" icon={<ShieldCheck size={17} />} trend="up" tint="green" />
                  </section>
                  <section className="insights-grid">
                    <div className="panel trend-panel">
                      <div className="panel-header">
                        <div><h2>Volume de chamados</h2><p>Acompanhe as solicitações ao longo do tempo</p></div>
                        <button className="select-button" onClick={() => notify("Visualização dos últimos 7 dias")}><CalendarDays size={14} /> Últimos 7 dias <ChevronDown size={14} /></button>
                      </div>
                      <div className="chart-legend"><span><i className="legend-dot legend-violet" /> Recebidos <strong>284</strong></span><span><i className="legend-dot legend-cyan" /> Resolvidos <strong>251</strong></span></div>
                      <div className="chart-wrap">
                        <div className="chart-y-labels"><span>80</span><span>60</span><span>40</span><span>20</span><span>0</span></div>
                        <svg className="line-chart" viewBox="0 0 720 190" preserveAspectRatio="none" role="img" aria-label="Gráfico de chamados recebidos e resolvidos durante a semana">
                          <defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#dc2626" stopOpacity=".16" /><stop offset="100%" stopColor="#dc2626" stopOpacity="0" /></linearGradient></defs>
                          {[18, 55, 92, 129, 166].map((y) => <line key={y} x1="0" x2="720" y1={y} y2={y} className="chart-gridline" />)}
                          <path d="M0 112 C42 103 58 128 103 109 S163 62 206 81 S264 106 309 87 S370 51 412 70 S472 111 515 82 S572 35 617 56 S676 78 720 31 L720 180 L0 180Z" fill="url(#chartFill)" />
                          <path d="M0 112 C42 103 58 128 103 109 S163 62 206 81 S264 106 309 87 S370 51 412 70 S472 111 515 82 S572 35 617 56 S676 78 720 31" className="chart-line chart-line-primary" />
                          <path d="M0 139 C45 132 58 149 103 131 S162 91 206 111 S264 131 309 119 S370 77 412 94 S472 134 515 116 S572 64 617 82 S676 105 720 72" className="chart-line chart-line-secondary" />
                          <circle cx="617" cy="56" r="4" className="chart-point chart-point-primary" /><circle cx="617" cy="82" r="4" className="chart-point chart-point-secondary" />
                        </svg>
                      </div>
                      <div className="chart-x-labels"><span>Seg, 11</span><span>Ter, 12</span><span>Qua, 13</span><span>Qui, 14</span><span>Sex, 15</span><span>Sáb, 16</span><span>Dom, 17</span></div>
                    </div>
                    <div className="panel sla-panel">
                      <div className="panel-header"><div><h2>Saúde do SLA</h2><p>Desempenho desta semana</p></div><button className="more-button" onClick={() => notify("Detalhes de SLA")} aria-label="Mais opções"><MoreHorizontal size={19} /></button></div>
                      <div className="sla-ring-wrap"><div className="sla-ring"><div className="sla-ring-center"><strong>96,8<span>%</span></strong><small>dentro do SLA</small></div></div></div>
                      <div className="sla-stats"><div><span className="sla-key"><i className="sla-dot on-time" /> No prazo</span><strong>248</strong></div><div><span className="sla-key"><i className="sla-dot breached" /> Fora do prazo</span><strong>8</strong></div></div>
                      <div className="sla-footer"><span className="positive-mini"><ArrowUpRight size={13} /> 2,4%</span> em relação à semana passada</div>
                    </div>
                  </section>
                </>
              )}
              <section className={`panel tickets-panel${section === "Chamados" ? " tickets-full" : ""}`}>
                <div className="panel-header tickets-header">
                  <div><h2>{section === "Visão geral" ? "Chamados recentes" : "Todos os chamados"} <span className="count-pill">{filteredTickets.length}</span></h2><p>{section === "Visão geral" ? "Priorize o que precisa da sua atenção" : "Filtre, ordene e acompanhe as solicitações"}</p></div>
                  <div className="table-actions">
                    <label className="table-search"><Search size={15} /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Buscar..." /></label>
                    <select className="filter-select" value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }} aria-label="Filtrar por status"><option>Todos os status</option><option>Aberto</option><option>Em andamento</option><option>Aguardando</option><option>Resolvido</option></select>
                    <select className="filter-select priority-select" value={priorityFilter} onChange={(event) => { setPriorityFilter(event.target.value); setPage(1); }} aria-label="Filtrar por prioridade"><option>Todas as prioridades</option><option>Crítica</option><option>Alta</option><option>Média</option><option>Baixa</option></select>
                    <button className="filter-icon-button" onClick={() => { setStatusFilter("Todos os status"); setPriorityFilter("Todas as prioridades"); setQuery(""); setPage(1); }} aria-label="Limpar filtros"><SlidersHorizontal size={16} /></button>
                  </div>
                </div>
                <div className="table-scroll"><table className="tickets-table">
                  <thead><tr><th>CHAMADO</th><th>SOLICITANTE</th><th>PRIORIDADE</th><th>STATUS</th><th>RESPONSÁVEL</th><th><button className="sortable-heading" onClick={() => setSortNewest(!sortNewest)}>ATUALIZADO <ArrowDown size={12} /></button></th><th>SLA</th><th /></tr></thead>
                  <tbody>{visibleTickets.map((ticket) => (
                    <tr key={ticket.id} onClick={() => setSelected(ticket)} tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter") setSelected(ticket); }}>
                      <td><div className="ticket-title-cell"><strong>{ticket.title}</strong><span>{ticket.id} <i /> {ticket.category}</span></div></td>
                      <td><div className="person-cell"><div className={`avatar avatar-${ticket.color}`}>{ticket.initials}</div><div><strong>{ticket.requester}</strong><span>{ticket.department}</span></div></div></td>
                      <td><PriorityBadge priority={ticket.priority} /></td>
                      <td><StatusBadge status={ticket.status} /></td>
                      <td><div className="assignee-cell"><div className="avatar avatar-small avatar-slate">{ticket.assigneeInitials}</div><span>{ticket.assignee}</span></div></td>
                      <td className="updated-cell">{ticket.updated}</td>
                      <td><span className={`sla-time${ticket.dueSoon && ticket.status !== "Resolvido" ? " sla-warning" : ""}`}>{ticket.dueSoon && ticket.status !== "Resolvido" && <Clock3 size={12} />}{ticket.sla}</span></td>
                      <td><button className="row-more" aria-label={`Opções para ${ticket.id}`} onClick={(event) => { event.stopPropagation(); setSelected(ticket); }}><MoreHorizontal size={17} /></button></td>
                    </tr>
                  ))}</tbody>
                </table>
                {visibleTickets.length === 0 && <div className="empty-state"><div><Search size={20} /></div><strong>Nenhum chamado encontrado</strong><span>Tente ajustar os filtros ou a busca.</span><button onClick={() => { setQuery(""); setStatusFilter("Todos os status"); setPriorityFilter("Todas as prioridades"); }}>Limpar filtros</button></div>}
                </div>
                <div className="table-footer"><span>Mostrando <strong>{filteredTickets.length === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, filteredTickets.length)}</strong> de <strong>{filteredTickets.length}</strong> chamados</span><div className="pagination"><button aria-label="Página anterior" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft size={15} /></button>{Array.from({ length: pageCount }, (_, index) => <button key={index + 1} className={page === index + 1 ? "page-active" : ""} onClick={() => setPage(index + 1)}>{index + 1}</button>)}<button aria-label="Próxima página" disabled={page >= pageCount} onClick={() => setPage(page + 1)}><ChevronRight size={15} /></button></div></div>
              </section>
              {section === "Visão geral" && <div className="bottom-note"><div className="note-icon"><ShieldCheck size={15} /></div><span><strong>Operação saudável.</strong> Seu time está mantendo os indicadores acima da meta.</span><button onClick={() => setSection("Chamados")}>Ver relatório <ArrowRight size={14} /></button></div>}
            </>
          )}
        </div>
      </main>
      {selected && <TicketDrawer ticket={tickets.find((ticket) => ticket.id === selected.id) ?? selected} onClose={() => setSelected(null)} onStatusChange={changeStatus} />}
      {creating && <CreateTicketModal onClose={() => setCreating(false)} onSubmit={addTicket} />}
      {toast && <div className="toast"><span><Check size={15} /></span>{toast}</div>}
    </div>
  );
}

function MetricCard({ title, value, note, change, icon, trend, tint }: { title: string; value: React.ReactNode; note: string; change: string; icon: React.ReactNode; trend: "up" | "down"; tint: string }) {
  return <article className="metric-card"><div className="metric-top"><span>{title}</span><div className={`metric-icon metric-${tint}`}>{icon}</div></div><div className="metric-value">{value}</div><div className="metric-bottom"><span className="metric-note">{note}</span><span className={`metric-change ${trend === "up" ? "change-up" : "change-down"}`}>{trend === "up" ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{change}</span></div></article>;
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const icon = priority === "Crítica" ? <Zap size={12} fill="currentColor" /> : priority === "Alta" ? <ArrowUp size={12} /> : priority === "Média" ? <ArrowDown size={12} /> : <ArrowDown size={12} />;
  return <span className={`priority-badge priority-${priority.toLocaleLowerCase("pt-BR")}`}>{icon}{priority}</span>;
}

function StatusBadge({ status }: { status: Status }) {
  return <span className={`status-badge status-${status.toLocaleLowerCase("pt-BR").replace(" ", "-")}`}><i />{status}</span>;
}

function TeamPage({ onAdd }: { onAdd: () => void }) {
  return <><div className="page-heading"><div><div className="eyebrow"><span className="live-dot" /> OPERAÇÕES DE TI</div><h1>Seu time de suporte</h1><p>Acompanhe a disponibilidade e o desempenho da equipe.</p></div><div className="heading-actions"><button className="button button-primary" onClick={onAdd}><Plus size={17} /> Convidar membro</button></div></div><div className="team-summary-grid"><MetricCard title="Membros ativos" value="08" note="em 3 departamentos" change="2 online agora" icon={<Users size={17} />} trend="up" tint="purple" /><MetricCard title="Chamados atribuídos" value="22" note="distribuídos no time" change="esta semana" icon={<Ticket size={17} />} trend="up" tint="blue" /><MetricCard title="Resolvidos esta semana" value="159" note="média de 20 por pessoa" change="+16,3%" icon={<ShieldCheck size={17} />} trend="up" tint="green" /></div><section className="panel team-panel"><div className="panel-header"><div><h2>Equipe de suporte <span className="count-pill">8</span></h2><p>Pessoas e carga de trabalho do time</p></div><button className="select-button" onClick={onAdd}><Plus size={14} /> Adicionar membro</button></div><div className="team-list">{team.map((member) => <div className="team-member" key={member.name}><div className={`avatar avatar-${member.color} team-avatar`}>{member.initials}<i className={`presence-dot ${member.presence}`} /></div><div className="team-member-info"><strong>{member.name}</strong><span>{member.role}</span></div><div className="team-status"><span className={`presence-label ${member.presence}`}>{member.presence === "online" ? "Disponível" : "Ausente"}</span><span>{member.open} chamados ativos</span></div><div className="team-performance"><div><span>Resolvidos no mês</span><strong>{member.resolved}</strong></div><div className="performance-bar"><span style={{ width: `${Math.min(100, member.resolved * 1.7)}%` }} /></div></div><button className="row-more" aria-label={`Opções de ${member.name}`}><MoreHorizontal size={17} /></button></div>)}</div></section><div className="bottom-note"><div className="note-icon"><Users size={15} /></div><span><strong>Boa colaboração.</strong> 3 dos 4 especialistas estão disponíveis neste momento.</span><button onClick={onAdd}>Gerenciar equipe <ArrowRight size={14} /></button></div></>;
}

function TicketDrawer({ ticket, onClose, onStatusChange }: { ticket: TicketRecord; onClose: () => void; onStatusChange: (id: string, status: Status) => void }) {
  const [message, setMessage] = useState("");
  const [comment, setComment] = useState("");
  const statusOptions: Status[] = ["Aberto", "Em andamento", "Aguardando", "Resolvido"];
  return (
    <div className="overlay drawer-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <aside className="ticket-drawer" aria-label={`Detalhes do chamado ${ticket.id}`}>
        <div className="drawer-header">
          <div><span className="drawer-eyebrow">CHAMADO</span><strong>{ticket.id}</strong></div>
          <button className="icon-button" onClick={onClose} aria-label="Fechar detalhe"><X size={19} /></button>
        </div>
        <div className="drawer-content">
          <div className="drawer-badges"><StatusBadge status={ticket.status} /><PriorityBadge priority={ticket.priority} /></div>
          <h2>{ticket.title}</h2>
          <p className="drawer-category">{ticket.category} <i /> {ticket.department}</p>
          <div className="drawer-divider" />
          <div className="detail-grid">
            <div><span>Solicitante</span><div className="person-cell"><div className={`avatar avatar-${ticket.color}`}>{ticket.initials}</div><strong>{ticket.requester}</strong></div></div>
            <div><span>Responsável</span><div className="person-cell"><div className="avatar avatar-small avatar-slate">{ticket.assigneeInitials}</div><strong>{ticket.assignee}</strong></div></div>
            <div><span>SLA restante</span><strong className={ticket.dueSoon && ticket.status !== "Resolvido" ? "sla-warning" : ""}><Clock3 size={14} /> {ticket.sla}</strong></div>
            <div><span>Última atualização</span><strong>{ticket.updated}</strong></div>
          </div>
          <div className="status-control">
            <label htmlFor="ticket-status">Atualizar status</label>
            <select id="ticket-status" value={ticket.status} onChange={(event) => onStatusChange(ticket.id, event.target.value as Status)}>
              {statusOptions.map((status) => <option key={status}>{status}</option>)}
            </select>
          </div>
          <div className="drawer-divider" />
          <div className="activity-title"><h3>Atividade</h3><span>Hoje</span></div>
          <div className="timeline">
            <div className="timeline-entry"><div className="timeline-dot timeline-purple"><MessageSquareText size={13} /></div><div><p><strong>{ticket.requester}</strong> abriu este chamado</p><span>Hoje, 09:42 · Via portal de suporte</span></div></div>
            <div className="timeline-entry"><div className="timeline-dot timeline-blue"><Users size={13} /></div><div><p>Chamado atribuído para <strong>{ticket.assignee}</strong></p><span>Hoje, 09:51 · Atribuição automática</span></div></div>
            <div className="timeline-entry"><div className="timeline-dot timeline-green"><Check size={13} /></div><div><p>Status atualizado para <strong>{ticket.status}</strong></p><span>{ticket.updated === "agora" ? "Agora" : "Hoje, 10:03"} · Júlia Santos</span></div></div>
            {comment && <div className="timeline-entry"><div className="timeline-dot timeline-purple"><MessageSquareText size={13} /></div><div><p><strong>Júlia Santos</strong> comentou: {comment}</p><span>Agora · Nota interna</span></div></div>}
          </div>
          <div className="description-card">
            <div><CircleHelp size={15} /><strong>Descrição</strong></div>
            <p>{ticket.description || `${ticket.title}. O solicitante precisa de suporte para seguir com as atividades do departamento. Verifique os acessos e equipamentos relacionados e atualize o status após a análise.`}</p>
          </div>
        </div>
        <form className="comment-box" onSubmit={(event) => { event.preventDefault(); if (message.trim()) { setComment(message.trim()); setMessage(""); } }}>
          <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Escreva uma resposta ou nota..." aria-label="Escreva uma resposta" />
          <button aria-label="Enviar comentário" disabled={!message.trim()}><ArrowRight size={16} /></button>
        </form>
      </aside>
    </div>
  );
}

function CreateTicketModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (form: { title: string; category: string; requester: string; department: string; priority: Priority; description: string }) => void }) {
  const [title, setTitle] = useState("");
  const [requester, setRequester] = useState("");
  const [department, setDepartment] = useState("Engenharia");
  const [category, setCategory] = useState("Acesso e permissões");
  const [priority, setPriority] = useState<Priority>("Média");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim() || !requester.trim() || !description.trim()) { setError("Preencha os campos obrigatórios para continuar."); return; }
    onSubmit({ title: title.trim(), category, requester: requester.trim(), department, priority, description: description.trim() });
  }
  return <div className="overlay modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><form className="create-modal" onSubmit={submit}><div className="modal-header"><div><span className="drawer-eyebrow">CENTRAL DE SUPORTE</span><h2>Novo chamado</h2><p>Descreva a solicitação para encaminhar ao time certo.</p></div><button type="button" className="icon-button" onClick={onClose} aria-label="Fechar formulário"><X size={19} /></button></div><label className="form-field"><span>Título do chamado <i>*</i></span><input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ex.: Não consigo acessar minha conta" maxLength={100} /></label><div className="form-row"><label className="form-field"><span>Solicitante <i>*</i></span><input value={requester} onChange={(event) => setRequester(event.target.value)} placeholder="Nome completo" /></label><label className="form-field"><span>Departamento</span><select value={department} onChange={(event) => setDepartment(event.target.value)}>{["Engenharia", "Produto", "Design", "Comercial", "Financeiro", "Marketing", "Operações"].map((item) => <option key={item}>{item}</option>)}</select></label></div><div className="form-row"><label className="form-field"><span>Categoria</span><select value={category} onChange={(event) => setCategory(event.target.value)}>{["Acesso e permissões", "Hardware", "Conectividade", "Software", "Outro"].map((item) => <option key={item}>{item}</option>)}</select></label><label className="form-field"><span>Prioridade</span><select value={priority} onChange={(event) => setPriority(event.target.value as Priority)}>{["Baixa", "Média", "Alta", "Crítica"].map((item) => <option key={item}>{item}</option>)}</select></label></div><label className="form-field"><span>Descreva o problema <i>*</i></span><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Inclua os detalhes que podem ajudar nosso time a resolver..." rows={4} maxLength={500} /><small>{description.length}/500 caracteres</small></label>{error && <div className="form-error"><CircleHelp size={15} />{error}</div>}<div className="modal-footer"><span><LockKeyhole size={13} /> Visível apenas para sua organização</span><div><button type="button" className="button button-secondary" onClick={onClose}>Cancelar</button><button type="submit" className="button button-primary"><Plus size={16} /> Criar chamado</button></div></div></form></div>;
}

export default App;
