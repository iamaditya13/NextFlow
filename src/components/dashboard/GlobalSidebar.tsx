"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart2,
  Bot,
  ChevronDown,
  ChevronRight,
  Clock,
  CornerDownLeft,
  CreditCard,
  Crop,
  Film,
  Folder,
  Home,
  Image as ImageIcon,
  LogOut,
  MoreHorizontal,
  Network,
  PanelLeft,
  Plus,
  Search,
  Settings,
  Trash2,
  Type,
  Video,
  Zap,
} from "lucide-react";
import { useClerk, useUser } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSettingsStore } from "@/stores/settingsStore";

const NAV_ITEMS = [
  { name: "Home", icon: Home, href: "/dashboard" },
  { name: "Node Editor", icon: Network, href: "/nodes" },
  { name: "Assets", icon: Folder, href: "/dashboard/assets" },
];

type ToolItem = {
  name: string;
  icon: React.ComponentType<{ size?: number }>;
  href: string;
  nodeType?: string;
};

type WorkflowSummary = {
  id: string;
  name: string;
  updatedAt: string;
  createdAt: string;
};

const TOOLS_ITEMS: ToolItem[] = [
  { name: "Image", icon: ImageIcon, href: "#", nodeType: "uploadImage" },
  { name: "Video", icon: Video, href: "#", nodeType: "uploadVideo" },
  { name: "Crop Image", icon: Crop, href: "#", nodeType: "cropImage" },
  { name: "Text", icon: Type, href: "#", nodeType: "text" },
  { name: "LLM", icon: Bot, href: "#", nodeType: "llm" },
  { name: "Extract Frame", icon: Film, href: "#", nodeType: "extractFrame" },
];

interface GlobalSidebarProps {
  initialExpanded?: boolean;
  onAddNode?: (type: string) => void;
}

const SIDEBAR_MIN_COLLAPSED_WIDTH = 52;
const SIDEBAR_MAX_COLLAPSED_WIDTH = 159;
const SIDEBAR_MIN_EXPANDED_WIDTH = 160;
const SIDEBAR_MAX_EXPANDED_WIDTH = 256;
const SIDEBAR_COLLAPSE_LIMIT_WIDTH = 84;
const SIDEBAR_COLLAPSED_LABEL_BREAKPOINT = SIDEBAR_COLLAPSE_LIMIT_WIDTH;

export function GlobalSidebar({ initialExpanded = false, onAddNode }: GlobalSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [expanded, setExpanded] = useState(initialExpanded);
  const [expandedWidth, setExpandedWidth] = useState(
    SIDEBAR_MAX_EXPANDED_WIDTH,
  );
  const [collapsedWidth, setCollapsedWidth] = useState(
    SIDEBAR_MIN_COLLAPSED_WIDTH,
  );
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [toolsExpanded, setToolsExpanded] = useState(true);
  const [sessionsExpanded, setSessionsExpanded] = useState(true);
  const [showUserPanel, setShowUserPanel] = useState(false);
  const [showSessionsPanel, setShowSessionsPanel] = useState(false);
  const [sessionQuery, setSessionQuery] = useState("");
  const [activeSessionIdx, setActiveSessionIdx] = useState(0);
  const [contextMenuSession, setContextMenuSession] = useState<string | null>(null);
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [deleteTargetSession, setDeleteTargetSession] = useState<WorkflowSummary | null>(null);
  const [tooltipInfo, setTooltipInfo] = useState<{ label: string; rect: DOMRect } | null>(null);
  const [recentWorkflows, setRecentWorkflows] = useState<WorkflowSummary[]>([]);
  const [loadingRecentWorkflows, setLoadingRecentWorkflows] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const avatarButtonRef = useRef<HTMLButtonElement>(null);
  const userPanelRef = useRef<HTMLDivElement>(null);
  const [userPanelPosition, setUserPanelPosition] = useState({
    left: 0,
    bottom: 8,
  });
  const activeSidebarWidth = expanded ? expandedWidth : collapsedWidth;
  const showSidebarLabels =
    activeSidebarWidth >= SIDEBAR_COLLAPSED_LABEL_BREAKPOINT;

  useEffect(() => {
    setExpanded(initialExpanded);
  }, [initialExpanded]);

  useEffect(() => {
    if (!showUserPanel) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (avatarButtonRef.current?.contains(target)) return;
      if (userPanelRef.current?.contains(target)) return;
      setShowUserPanel(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [showUserPanel]);

  useEffect(() => {
    if (!showUserPanel) return;

    const updateUserPanelPosition = () => {
      const sidebarRect = sidebarRef.current?.getBoundingClientRect();
      const avatarRect = avatarButtonRef.current?.getBoundingClientRect();
      if (!sidebarRect || !avatarRect) return;

      const panelWidth = 220;
      const viewportPadding = 8;
      const left = Math.max(
        viewportPadding,
        Math.min(
          sidebarRect.right + 8,
          window.innerWidth - panelWidth - viewportPadding,
        ),
      );
      const bottom = Math.max(
        viewportPadding,
        window.innerHeight - avatarRect.bottom,
      );
      setUserPanelPosition({ left, bottom });
    };

    updateUserPanelPosition();
    const transitionTimer = window.setTimeout(updateUserPanelPosition, 220);
    window.addEventListener("resize", updateUserPanelPosition);
    window.addEventListener("scroll", updateUserPanelPosition, true);

    return () => {
      window.clearTimeout(transitionTimer);
      window.removeEventListener("resize", updateUserPanelPosition);
      window.removeEventListener("scroll", updateUserPanelPosition, true);
    };
  }, [expanded, showUserPanel, activeSidebarWidth]);

  useEffect(() => {
    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, []);

  useEffect(() => {
    if (!showSidebarLabels) setShowSessionsPanel(false);
  }, [showSidebarLabels]);

  // Fetch sessions when sidebar is expanded and sessions are visible
  const hasWorkflows = recentWorkflows.length > 0;
  useEffect(() => {
    if (showSidebarLabels && sessionsExpanded && !hasWorkflows) {
      void fetchRecentWorkflows();
    }
  }, [showSidebarLabels, sessionsExpanded, hasWorkflows]);

  // Close context menu on outside click
  useEffect(() => {
    if (!contextMenuSession) return;
    const onDown = () => setContextMenuSession(null);
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [contextMenuSession]);

  useEffect(() => {
    if (!showSessionsPanel) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowSessionsPanel(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showSessionsPanel]);

  const initials = (
    user?.firstName ??
    user?.username ??
    user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ??
    "S"
  )
    .slice(0, 1)
    .toUpperCase();

  const displayName =
    user?.username ??
    user?.firstName ??
    user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ??
    "Account";

  const formatRelative = (value: string) => {
    const timestamp = new Date(value).getTime();
    const delta = Date.now() - timestamp;
    const minutes = Math.floor(delta / 60000);
    const hours = Math.floor(delta / 3600000);
    const days = Math.floor(delta / 86400000);

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const fetchRecentWorkflows = async () => {
    setLoadingRecentWorkflows(true);
    try {
      const res = await fetch("/api/workflows?limit=8", { cache: "no-store" });
      const json = await res.json();
      if (res.ok && json?.success && Array.isArray(json.data)) {
        setRecentWorkflows(json.data as WorkflowSummary[]);
      } else {
        setRecentWorkflows([]);
      }
    } catch {
      setRecentWorkflows([]);
    } finally {
      setLoadingRecentWorkflows(false);
    }
  };

  const filteredSessions = recentWorkflows.filter((workflow) =>
    workflow.name.toLowerCase().includes(sessionQuery.trim().toLowerCase()),
  );

  const onDragStart = (e: React.DragEvent, nodeType: string) => {
    e.dataTransfer.setData("application/reactflow", nodeType);
    e.dataTransfer.effectAllowed = "move";
  };

  const isActiveHref = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  const SidebarLink = ({ item }: { item: (typeof NAV_ITEMS)[number] }) => {
    const active = isActiveHref(item.href);
    const Icon = item.icon;
    return (
      <Link
        href={item.href}
        className={`nf-sidebar__item ${active ? "nf-sidebar__item--active" : ""}`}
        onMouseEnter={(e) => {
          if (!showSidebarLabels) {
            setTooltipInfo({ label: item.name, rect: (e.currentTarget as HTMLElement).getBoundingClientRect() });
          }
        }}
        onMouseLeave={() => setTooltipInfo(null)}
      >
        <Icon size={20} />
        <span className="nf-sidebar__item-label">{item.name}</span>
      </Link>
    );
  };

  const onSidebarResizeStart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsResizingSidebar(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const onMouseMove = (event: MouseEvent) => {
      const left = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const rawWidth = event.clientX - left;

      if (rawWidth < SIDEBAR_COLLAPSE_LIMIT_WIDTH) {
        setExpanded(false);
        setCollapsedWidth(SIDEBAR_MIN_COLLAPSED_WIDTH);
        return;
      }

      if (rawWidth >= SIDEBAR_MIN_EXPANDED_WIDTH) {
        const nextWidth = Math.min(
          SIDEBAR_MAX_EXPANDED_WIDTH,
          Math.max(SIDEBAR_MIN_EXPANDED_WIDTH, rawWidth),
        );
        setExpanded(true);
        setExpandedWidth(nextWidth);
        return;
      }

      const nextWidth = Math.min(
        SIDEBAR_MAX_COLLAPSED_WIDTH,
        Math.max(SIDEBAR_COLLAPSE_LIMIT_WIDTH, rawWidth),
      );
      setCollapsedWidth(nextWidth);
    };

    const onMouseUp = () => {
      setIsResizingSidebar(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const onToggleSidebar = () => {
    if (showSidebarLabels) {
      setExpanded(false);
      setCollapsedWidth(SIDEBAR_MIN_COLLAPSED_WIDTH);
      return;
    }
    setExpanded(true);
  };

  // On canvas pages (individual node editor), hide the Sessions section
  const isCanvasPage =
    /^\/nodes\/[^/]+$/.test(pathname) ||
    /^\/dashboard\/node-editor\/[^/]+$/.test(pathname)

  return (
    <nav
      ref={sidebarRef}
      className={`nf-sidebar ${expanded ? "nf-sidebar--expanded" : ""} ${showSidebarLabels ? "nf-sidebar--labels" : "nf-sidebar--icon-only"} ${isResizingSidebar ? "nf-sidebar--resizing" : ""}`}
      style={{ width: activeSidebarWidth }}
    >
      {/* Header zone — 64px tall */}
      <div className="nf-sidebar__top">
        <button
          type="button"
          className="nf-sidebar__item"
          title={showSidebarLabels ? "Collapse sidebar" : "Expand sidebar"}
          onClick={onToggleSidebar}
        >
          <PanelLeft size={20} />
        </button>
      </div>

      {/* Navigation */}
      <div className="nf-sidebar__nav">
        {/* Primary nav — 4 items */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: showSidebarLabels ? "stretch" : "center",
            gap: 1,
          }}
        >
          {NAV_ITEMS.map((item) => (
            <SidebarLink key={item.name} item={item} />
          ))}
        </div>

        {/* Tools section */}
        <div style={{ marginTop: 8 }}>
          {showSidebarLabels ? (
            <button
              type="button"
              onClick={() => setToolsExpanded(!toolsExpanded)}
              style={{
                width: "100%",
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 10px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "var(--nf-text-sidebar)",
              }}
            >
              <span style={{ fontSize: 13.5, fontWeight: 500 }}>Tools</span>
              <ChevronDown
                size={14}
                style={{
                  color: "var(--nf-text-label)",
                  transform: toolsExpanded ? "rotate(0deg)" : "rotate(-90deg)",
                  transition: "transform 0.15s",
                }}
              />
            </button>
          ) : (
            <div
              className="nf-sidebar__section-label"
              style={{
                padding: "8px 0",
                textAlign: "center",
              }}
            >
              <span style={{ fontSize: 13.5, fontWeight: 500, color: "var(--nf-text-sidebar)" }}>
                Tools
              </span>
            </div>
          )}

          {toolsExpanded && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: showSidebarLabels ? "stretch" : "center",
                gap: 1,
              }}
            >
              {TOOLS_ITEMS.map((item) => {
                const Icon = item.icon;
                const isDraggable = !!item.nodeType;
                const active = item.href !== "#" && isActiveHref(item.href);
                return (
                  <div
                    key={item.name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      position: "relative",
                    }}
                    className="nf-sidebar__tool-row"
                  >
                    <Link
                      href={item.href}
                      className={`nf-sidebar__item ${active ? "nf-sidebar__item--active" : ""}`}
                      draggable={isDraggable}
                      onDragStart={
                        isDraggable
                          ? (e) => onDragStart(e, item.nodeType!)
                          : undefined
                      }
                      style={isDraggable ? { cursor: "grab", flex: 1 } : { flex: 1 }}
                      onMouseEnter={(e) => {
                        if (!showSidebarLabels) {
                          setTooltipInfo({ label: item.name, rect: (e.currentTarget as HTMLElement).getBoundingClientRect() });
                        }
                      }}
                      onClick={(e) => {
                        if (item.href === "#") e.preventDefault();
                        if (item.nodeType && onAddNode) {
                          e.preventDefault();
                          onAddNode(item.nodeType);
                        }
                      }}
                      onMouseLeave={() => setTooltipInfo(null)}
                    >
                      <Icon size={20} />
                      <span className="nf-sidebar__item-label">{item.name}</span>
                    </Link>
                    {showSidebarLabels && (
                      <button
                        type="button"
                        className="nf-sidebar__tool-menu"
                        title={`${item.name} options`}
                        style={{
                          width: 28,
                          height: 28,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "transparent",
                          border: "none",
                          color: "var(--nf-text-label)",
                          cursor: "pointer",
                          borderRadius: 6,
                          flexShrink: 0,
                          opacity: 0,
                          transition: "opacity 0.15s",
                          position: "absolute",
                          right: 4,
                        }}
                      >
                        <MoreHorizontal size={16} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sessions section — hidden on canvas pages */}
        {showSidebarLabels && !isCanvasPage && (
          <div style={{ marginTop: 10, padding: "0 2px" }}>
            {/* Sessions header with hover search icon */}
            <div
              className="group"
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                padding: "0 10px",
                height: 36,
              }}
            >
              <button
                type="button"
                onClick={() => setSessionsExpanded(!sessionsExpanded)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--nf-text-muted)",
                  padding: 0,
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 500 }}>Sessions</span>
                <ChevronDown
                  size={14}
                  style={{
                    transform: sessionsExpanded ? "rotate(0deg)" : "rotate(-90deg)",
                    transition: "transform 0.15s",
                  }}
                />
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSessionsPanel(true);
                  setSessionQuery("");
                  setActiveSessionIdx(0);
                  void fetchRecentWorkflows();
                }}
                title="Search sessions"
                className="opacity-0 group-hover:opacity-100"
                style={{
                  marginLeft: "auto",
                  width: 24,
                  height: 24,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "transparent",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  color: "var(--nf-text-placeholder)",
                  transition: "opacity 0.15s",
                  padding: 0,
                }}
              >
                <Search size={14} />
              </button>
            </div>

            {/* Sessions list in sidebar */}
            {sessionsExpanded && (
              <div style={{ display: "flex", flexDirection: "column", gap: 1, marginTop: 2 }}>
                {recentWorkflows.slice(0, 5).map((workflow) => (
                  <div
                    key={workflow.id}
                    className="group/session"
                    style={{ position: "relative" }}
                  >
                    <Link
                      href={`/dashboard/node-editor/${workflow.id}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "6px 8px",
                        borderRadius: 8,
                        color: "var(--nf-text-sidebar)",
                        textDecoration: "none",
                        height: 44,
                      }}
                      className="nf-hover-item"
                    >
                      <span
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 7,
                          background: "var(--nf-bg-node-inner)",
                          border: "1px solid var(--nf-border-inner)",
                          display: "grid",
                          placeItems: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Network size={13} style={{ color: "var(--nf-text-label)" }} />
                      </span>
                      <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 13,
                            fontWeight: 500,
                            color: "var(--nf-text-primary)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {workflow.name}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 11,
                            color: "var(--nf-text-placeholder)",
                          }}
                        >
                          Node Editor
                        </p>
                      </div>
                    </Link>
                    {/* 3-dot menu on hover */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (contextMenuSession === workflow.id) {
                          setContextMenuSession(null);
                          setContextMenuPosition(null);
                        } else {
                          const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
                          setContextMenuSession(workflow.id);
                          setContextMenuPosition({ x: rect.right + 8, y: rect.top });
                        }
                      }}
                      className="opacity-0 group-hover/session:opacity-100"
                      style={{
                        position: "absolute",
                        right: 6,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 24,
                        height: 24,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "transparent",
                        border: "none",
                        borderRadius: 6,
                        cursor: "pointer",
                        color: "var(--nf-text-muted)",
                        transition: "opacity 0.15s",
                        padding: 0,
                      }}
                    >
                      <MoreHorizontal size={14} />
                    </button>
                  </div>
                ))}

                {/* + New Session button */}
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const res = await fetch("/api/workflows", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name: "New Workflow" }),
                      });
                      const json = await res.json();
                      if (res.ok && json?.success && json?.data?.id) {
                        void fetchRecentWorkflows();
                        router.push(`/dashboard/node-editor/${json.data.id}`);
                      } else {
                        router.push("/nodes/new");
                      }
                    } catch {
                      router.push("/nodes/new");
                    }
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "6px 8px",
                    height: 40,
                    borderRadius: 8,
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--nf-text-primary)",
                  }}
                  className="nf-hover-item"
                >
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 7,
                      background: "var(--nf-bg-node-inner)",
                      border: "1px solid var(--nf-border-inner)",
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Plus size={13} style={{ color: "var(--nf-text-label)" }} />
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>New Session</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Session search modal */}
      {showSessionsPanel && (
        <div
          onMouseDown={() => setShowSessionsPanel(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.50)",
            backdropFilter: "blur(4px)",
            zIndex: 80,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingTop: "15vh",
          }}
        >
          <div
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              width: 560,
              maxWidth: "calc(100vw - 40px)",
              background: "var(--nf-bg-node)",
              border: "1px solid var(--nf-border-inner)",
              borderRadius: 16,
              boxShadow: "0 32px 72px rgba(0,0,0,0.65)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Search input */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "0 16px",
                height: 56,
                borderBottom: "1px solid var(--nf-border-inner)",
              }}
            >
              <Clock size={20} style={{ color: "var(--nf-text-placeholder)", flexShrink: 0 }} />
              <input
                value={sessionQuery}
                onChange={(e) => {
                  setSessionQuery(e.target.value);
                  setActiveSessionIdx(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setActiveSessionIdx((i) => Math.min(i + 1, filteredSessions.length - 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setActiveSessionIdx((i) => Math.max(i - 1, 0));
                  } else if (e.key === "Enter" && filteredSessions[activeSessionIdx]) {
                    router.push(`/dashboard/node-editor/${filteredSessions[activeSessionIdx].id}`);
                    setShowSessionsPanel(false);
                  }
                }}
                autoFocus
                placeholder="Search sessions..."
                style={{
                  flex: 1,
                  border: "none",
                  background: "transparent",
                  color: "var(--nf-text-primary)",
                  fontSize: 15,
                  fontFamily: "inherit",
                  outline: "none",
                }}
              />
            </div>

            {/* Session list */}
            <div
              className="nf-scroll"
              style={{ overflowY: "auto", maxHeight: 400, padding: 8 }}
            >
              {loadingRecentWorkflows && (
                <div style={{ color: "var(--nf-text-muted)", fontSize: 13, padding: "10px 8px" }}>
                  Loading sessions…
                </div>
              )}
              {!loadingRecentWorkflows && filteredSessions.length === 0 && (
                <div style={{ color: "var(--nf-text-muted)", fontSize: 13, padding: "10px 8px" }}>
                  No sessions found
                </div>
              )}
              {!loadingRecentWorkflows &&
                filteredSessions.map((workflow, index) => (
                  <button
                    key={workflow.id}
                    type="button"
                    onClick={() => {
                      router.push(`/dashboard/node-editor/${workflow.id}`);
                      setShowSessionsPanel(false);
                    }}
                    onMouseEnter={() => setActiveSessionIdx(index)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      fontFamily: "inherit",
                      color: "var(--nf-text-sidebar)",
                      background:
                        index === activeSessionIdx ? "#3b5bdb" : "transparent",
                      transition: "background 0.1s",
                    }}
                  >
                    {/* Session icon */}
                    <span
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: index === activeSessionIdx ? "rgba(0,0,0,0.2)" : "var(--nf-bg-muted)",
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Network size={14} style={{ color: "var(--nf-text-primary)" }} />
                    </span>
                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 500,
                            color: "var(--nf-text-primary)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {workflow.name}
                        </span>
                        {index === 0 && (
                          <span
                            style={{
                              fontSize: 11,
                              padding: "1px 8px",
                              borderRadius: 999,
                              background: "rgba(59,91,219,0.35)",
                              color: "#a5b4fc",
                            }}
                          >
                            Session
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: index === activeSessionIdx ? "var(--nf-text-secondary)" : "var(--nf-text-placeholder)",
                          marginTop: 2,
                        }}
                      >
                        Node Editor · {formatRelative(workflow.updatedAt)}
                      </div>
                    </div>
                    {/* Enter icon for active */}
                    {index === activeSessionIdx && (
                      <CornerDownLeft size={14} style={{ color: "var(--nf-text-label)", flexShrink: 0 }} />
                    )}
                  </button>
                ))}
            </div>

            {/* Keyboard hints */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "0 16px",
                height: 40,
                borderTop: "1px solid var(--nf-border-inner)",
                background: "var(--nf-bg-node-inner)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <kbd
                  style={{
                    background: "var(--nf-bg-muted)",
                    border: "1px solid var(--nf-border-inner)",
                    borderRadius: 4,
                    padding: "2px 6px",
                    fontSize: 11,
                    fontWeight: 500,
                    color: "var(--nf-text-primary)",
                    fontFamily: "inherit",
                  }}
                >
                  ↑
                </kbd>
                <kbd
                  style={{
                    background: "var(--nf-bg-muted)",
                    border: "1px solid var(--nf-border-inner)",
                    borderRadius: 4,
                    padding: "2px 6px",
                    fontSize: 11,
                    fontWeight: 500,
                    color: "var(--nf-text-primary)",
                    fontFamily: "inherit",
                  }}
                >
                  ↓
                </kbd>
                <span style={{ fontSize: 12, color: "var(--nf-text-placeholder)" }}>Navigate</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <kbd
                  style={{
                    background: "var(--nf-bg-muted)",
                    border: "1px solid var(--nf-border-inner)",
                    borderRadius: 4,
                    padding: "2px 6px",
                    fontSize: 11,
                    fontWeight: 500,
                    color: "var(--nf-text-primary)",
                    fontFamily: "inherit",
                  }}
                >
                  Enter
                </kbd>
                <span style={{ fontSize: 12, color: "var(--nf-text-placeholder)" }}>Select</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
                <kbd
                  style={{
                    background: "var(--nf-bg-muted)",
                    border: "1px solid var(--nf-border-inner)",
                    borderRadius: 4,
                    padding: "2px 6px",
                    fontSize: 11,
                    fontWeight: 500,
                    color: "var(--nf-text-primary)",
                    fontFamily: "inherit",
                  }}
                >
                  Esc
                </kbd>
                <span style={{ fontSize: 12, color: "var(--nf-text-placeholder)" }}>Close</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete session confirmation dialog */}
      {deleteTargetSession && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 90,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            style={{
              background: "var(--nf-bg-node)",
              border: "1px solid var(--nf-border-inner)",
              borderRadius: 16,
              padding: 24,
              width: 420,
              maxWidth: "calc(100vw - 40px)",
              boxShadow: "0 32px 72px rgba(0,0,0,0.65)",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 600,
                color: "var(--nf-text-primary)",
              }}
            >
              Delete session?
            </h2>
            <p
              style={{
                margin: "8px 0 24px",
                fontSize: 13,
                color: "var(--nf-text-muted)",
                lineHeight: 1.5,
              }}
            >
              This will permanently delete &quot;{deleteTargetSession.name}&quot;. This action cannot be undone.
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 12,
              }}
            >
              <button
                type="button"
                onClick={() => setDeleteTargetSession(null)}
                style={{
                  height: 36,
                  borderRadius: 9999,
                  border: "1px solid var(--nf-border-inner)",
                  background: "transparent",
                  color: "var(--nf-text-primary)",
                  fontSize: 13,
                  padding: "0 16px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await fetch(`/api/workflows/${deleteTargetSession.id}`, { method: "DELETE" });
                    setRecentWorkflows((prev) =>
                      prev.filter((w) => w.id !== deleteTargetSession.id),
                    );
                  } catch { /* ignore */ }
                  setDeleteTargetSession(null);
                }}
                style={{
                  height: 36,
                  borderRadius: 9999,
                  border: "none",
                  background: "var(--nf-text-primary)",
                  color: "var(--nf-bg-canvas-grid)",
                  fontSize: 13,
                  fontWeight: 500,
                  padding: "0 16px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom actions */}
      <div className="nf-sidebar__actions">
        {showSidebarLabels && (
          <>
            {/* Earn Credits button */}
            <button
              type="button"
              style={{
                width: "100%",
                height: 36,
                borderRadius: 9,
                border: "1px solid var(--nf-border-inner)",
                background: "transparent",
                color: "var(--nf-text-secondary)",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Earn 3,000 Credits
            </button>

            {/* Upgrade button with shimmer */}
            <button
              type="button"
              className="nf-sidebar__upgrade-btn"
              style={{
                width: "100%",
                height: 36,
                borderRadius: 9,
                border: "none",
                background: "linear-gradient(135deg, #155dfc 0%, #7c3aed 50%, #155dfc 100%)",
                backgroundSize: "200% 100%",
                color: "#ffffff",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                position: "relative",
                overflow: "hidden",
              }}
            >
              Upgrade
            </button>
          </>
        )}

        {/* User account button */}
        <button
          type="button"
          ref={avatarButtonRef}
          onClick={() => setShowUserPanel(!showUserPanel)}
          title="Account"
          style={{
            width: "100%",
            height: 48,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: showSidebarLabels ? "0 8px" : "0",
            justifyContent: showSidebarLabels ? "flex-start" : "center",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            borderRadius: 9,
            color: "var(--nf-text-sidebar)",
          }}
        >
          <span className="nf-sidebar__avatar">{initials}</span>
          {showSidebarLabels && (
            <>
              <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--nf-text-sidebar)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    lineHeight: "20px",
                  }}
                >
                  {displayName}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--nf-text-label)",
                    lineHeight: "15px",
                  }}
                >
                  Free
                </div>
              </div>
              <ChevronRight size={14} style={{ color: "var(--nf-text-label)", flexShrink: 0 }} />
            </>
          )}
        </button>
      </div>

      {/* Resize handle */}
      <button
        type="button"
        className="nf-sidebar__resize-handle"
        onMouseDown={onSidebarResizeStart}
        aria-label="Resize sidebar"
      >
        <span className="nf-sidebar__resize-line" />
      </button>

      {/* Session context menu portal — renders outside sidebar to avoid overflow:hidden clipping */}
      {contextMenuSession && contextMenuPosition && typeof document !== "undefined" &&
        createPortal(
          (() => {
            const wf = recentWorkflows.find((w) => w.id === contextMenuSession);
            if (!wf) return null;
            return (
              <div
                onMouseDown={(e) => e.stopPropagation()}
                style={{
                  position: "fixed",
                  left: contextMenuPosition.x,
                  top: contextMenuPosition.y,
                  zIndex: 9999,
                  width: 176,
                  background: "var(--nf-bg-node-inner)",
                  border: "1px solid var(--nf-border-inner)",
                  borderRadius: 12,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                  overflow: "hidden",
                  padding: "4px 0",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    router.push(`/dashboard/node-editor/${wf.id}`);
                    setContextMenuSession(null);
                    setContextMenuPosition(null);
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 12px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--nf-text-primary)",
                    fontSize: 13,
                    fontFamily: "inherit",
                  }}
                  className="nf-hover-item"
                >
                  <ArrowRight size={14} style={{ color: "var(--nf-text-label)" }} />
                  Open Session
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteTargetSession(wf);
                    setContextMenuSession(null);
                    setContextMenuPosition(null);
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 12px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "#f87171",
                    fontSize: 13,
                    fontFamily: "inherit",
                  }}
                  className="hover:!bg-red-500/10"
                >
                  <Trash2 size={14} />
                  Delete Session
                </button>
              </div>
            );
          })(),
          document.body,
        )}

      {/* Collapsed-sidebar tooltip portal */}
      {tooltipInfo && !showSidebarLabels && typeof document !== "undefined" &&
        createPortal(
          <div
            style={{
              position: "fixed",
              left: tooltipInfo.rect.right + 10,
              top: tooltipInfo.rect.top + tooltipInfo.rect.height / 2,
              transform: "translateY(-50%)",
              zIndex: 9999,
              background: "var(--nf-bg-node-inner)",
              border: "1px solid var(--nf-border-inner)",
              color: "var(--nf-text-sidebar)",
              fontSize: 12,
              fontWeight: 500,
              padding: "5px 10px",
              borderRadius: 6,
              whiteSpace: "nowrap",
              pointerEvents: "none",
              boxShadow: "0 4px 16px rgba(0,0,0,0.6)",
              fontFamily: "inherit",
            }}
          >
            {/* Left-pointing arrow */}
            <span
              style={{
                position: "absolute",
                left: -5,
                top: "50%",
                transform: "translateY(-50%)",
                width: 0,
                height: 0,
                borderTop: "5px solid transparent",
                borderBottom: "5px solid transparent",
                borderRight: "5px solid var(--nf-bg-node-inner)",
              }}
            />
            {tooltipInfo.label}
          </div>,
          document.body,
        )}

      {/* User panel portal */}
      {showUserPanel &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={userPanelRef}
            style={{
              position: "fixed",
              left: userPanelPosition.left,
              bottom: userPanelPosition.bottom,
              width: 220,
              background: "var(--nf-bg-canvas-grid)",
              border: "1px solid var(--nf-border-inner)",
              borderRadius: 12,
              boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
              zIndex: 90,
              padding: "4px 0",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "4px 8px" }}>
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: "var(--nf-text-label)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  padding: "4px 8px",
                  margin: 0,
                }}
              >
                Workspaces
              </p>
              <button
                type="button"
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px",
                  borderRadius: 8,
                  background: "transparent",
                  border: "none",
                  color: "var(--nf-text-sidebar)",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: 12,
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    background: "var(--nf-bg-muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--nf-text-primary)",
                    flexShrink: 0,
                  }}
                >
                  {initials}
                </div>
                <div>
                  <p style={{ fontWeight: 500, margin: 0 }}>Default Workspace</p>
                  <p style={{ fontSize: 10, color: "var(--nf-text-label)", margin: 0 }}>Free</p>
                </div>
              </button>
              <button
                type="button"
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "6px 8px",
                  borderRadius: 8,
                  background: "transparent",
                  border: "none",
                  color: "var(--nf-text-label)",
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                <Plus size={14} /> Add workspace
              </button>
            </div>

            <div style={{ borderTop: "1px solid var(--nf-border-inner)", margin: "4px 8px" }} />

            <div style={{ padding: "4px" }}>
              {(
                [
                  { icon: Zap, label: "Upgrade plan", href: "/dashboard/pricing", action: undefined },
                  { icon: CreditCard, label: "Buy credits", href: "#", action: undefined },
                  { icon: Settings, label: "Settings", href: "#", action: "settings" as const },
                  { icon: BarChart2, label: "Usage Statistics", href: "#", action: undefined },
                ] as const
              ).map(({ icon: Icon, label, href, action }) => (
                <Link
                  key={label}
                  href={action === "settings" ? "#" : href}
                  onClick={(e) => {
                    if (action === "settings") {
                      e.preventDefault();
                      useSettingsStore.getState().openSettings("overview");
                    }
                    setShowUserPanel(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "8px 12px",
                    borderRadius: 8,
                    color: "var(--nf-text-muted)",
                    fontSize: 13,
                    textDecoration: "none",
                  }}
                >
                  <Icon size={14} style={{ color: "var(--nf-text-label)", flexShrink: 0 }} />
                  {label}
                </Link>
              ))}
              <button
                type="button"
                onClick={() => signOut({ redirectUrl: "/" })}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: "transparent",
                  border: "none",
                  color: "var(--nf-text-muted)",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                <LogOut size={14} style={{ color: "var(--nf-text-label)", flexShrink: 0 }} />
                Log out
              </button>
            </div>
          </div>,
          document.body,
        )}
    </nav>
  );
}
