import os

dashboard_css = """
/* ============================================
   DASHBOARD STYLES — DO NOT MODIFY ABOVE
   ============================================ */

/* Node styles */
.workflow-node {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  min-width: 220px;
  max-width: 280px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.4);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  position: relative;
}

.workflow-node--wide {
  min-width: 260px;
}

.workflow-node--selected {
  border-color: #8b5cf6 !important;
  box-shadow: 0 0 0 2px rgba(139,92,246,0.3) !important;
}

.workflow-node--running {
  border-color: #8b5cf6 !important;
  animation: nodeGlow 2s ease-in-out infinite;
}

.workflow-node--success {
  animation: successFlash 1s ease-out forwards;
}

.workflow-node--failed {
  border-color: #ef4444 !important;
  box-shadow: 0 0 15px rgba(239,68,68,0.3) !important;
}

.workflow-node__header {
  height: 36px;
  background: #111111;
  border-bottom: 1px solid #2a2a2a;
  border-radius: 12px 12px 0 0;
  padding: 0 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  position: relative;
}

.workflow-node__title {
  font-size: 12px;
  color: #888888;
  font-weight: 500;
  flex: 1;
}

.workflow-node__status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transition: background 0.3s ease;
}

.workflow-node__status-dot--idle { background: #2a2a2a; }
.workflow-node__status-dot--running { 
  background: #8b5cf6;
  animation: pulseDotSmall 1.5s ease-in-out infinite;
}
.workflow-node__status-dot--success { background: #22c55e; }
.workflow-node__status-dot--failed { background: #ef4444; }

.workflow-node__delete {
  width: 20px;
  height: 20px;
  background: transparent;
  border: none;
  color: #555555;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  opacity: 0;
  transition: opacity 0.15s, color 0.15s, background 0.15s;
}

.workflow-node:hover .workflow-node__delete { opacity: 1; }
.workflow-node__delete:hover { color: #ef4444 !important; background: rgba(239,68,68,0.1) !important; }

.workflow-node__body {
  padding: 10px;
}

.workflow-node__textarea {
  width: 100%;
  background: #111111;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  color: white;
  font-size: 12px;
  line-height: 1.5;
  padding: 8px;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  transition: border-color 0.15s;
  box-sizing: border-box;
}

.workflow-node__textarea:focus {
  outline: none;
  border-color: #8b5cf6;
}

.workflow-node__textarea--small { min-height: 40px; }

.workflow-node__textarea--connected,
.workflow-node__input--connected,
.workflow-node__number-input--connected {
  opacity: 0.4;
  cursor: not-allowed;
  background: #0f0f0f !important;
}

.workflow-node__input {
  width: 100%;
  background: #111111;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  color: white;
  font-size: 12px;
  padding: 0 10px;
  height: 32px;
  font-family: inherit;
  transition: border-color 0.15s;
  box-sizing: border-box;
}

.workflow-node__input:focus {
  outline: none;
  border-color: #8b5cf6;
}

.workflow-node__select {
  width: 100%;
  height: 32px;
  background: #111111;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  color: white;
  font-size: 12px;
  padding: 0 10px;
  cursor: pointer;
  font-family: inherit;
  margin-bottom: 8px;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
}

.workflow-node__select:focus { outline: none; }

.workflow-node__label {
  display: block;
  font-size: 10px;
  color: #555555;
  margin-bottom: 4px;
  font-weight: 400;
}

.workflow-node__field { margin-bottom: 8px; }

.workflow-node__hint {
  display: block;
  font-size: 10px;
  color: #444444;
  margin-top: 4px;
}

.workflow-node__run-btn {
  width: 100%;
  height: 32px;
  background: #8b5cf6;
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: background 0.15s, opacity 0.15s;
  font-family: inherit;
  margin-top: 8px;
}

.workflow-node__run-btn:hover { background: #7c3aed; }
.workflow-node__run-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.workflow-node__run-btn--loading { background: #4c1d95; }

.workflow-node__result {
  margin-top: 8px;
  padding: 8px;
  background: #111111;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  font-size: 11px;
  color: white;
  max-height: 100px;
  overflow-y: auto;
  line-height: 1.5;
  word-break: break-word;
}

.workflow-node__result--error {
  color: #ef4444;
  border-color: #ef4444;
  background: rgba(239,68,68,0.05);
}

.workflow-node__preview {
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #2a2a2a;
  margin-top: 8px;
}

.workflow-node__crop-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.workflow-node__crop-cell { display: flex; flex-direction: column; }

.workflow-node__number-input {
  height: 28px;
  width: 100%;
  background: #111111;
  border: 1px solid #2a2a2a;
  border-radius: 6px;
  color: white;
  font-size: 12px;
  text-align: center;
  font-family: inherit;
  transition: border-color 0.15s;
  box-sizing: border-box;
}

.workflow-node__number-input:focus {
  outline: none;
  border-color: #8b5cf6;
}

.workflow-node__handle-labels {
  position: absolute;
  left: 14px;
  top: 0;
  bottom: 0;
  pointer-events: none;
}

.workflow-node__handle-label {
  position: absolute;
  font-size: 9px;
  color: #444444;
  white-space: nowrap;
  transform: translateY(-50%);
}

/* React Flow Handle styles */
.workflow-handle {
  width: 10px !important;
  height: 10px !important;
  border-radius: 50% !important;
  border-width: 2px !important;
  transition: transform 0.15s, background 0.15s;
}

.workflow-handle:hover { transform: scale(1.4); }

.workflow-handle--text {
  background: #1a1a1a !important;
  border-color: #eab308 !important;
}

.workflow-handle--text.connected,
.react-flow__handle-connecting.workflow-handle--text {
  background: #eab308 !important;
}

.workflow-handle--image {
  background: #1a1a1a !important;
  border-color: #3b82f6 !important;
}

.workflow-handle--image.connected {
  background: #3b82f6 !important;
}

.workflow-handle--video {
  background: #1a1a1a !important;
  border-color: #22c55e !important;
}

.workflow-handle--video.connected {
  background: #22c55e !important;
}

.workflow-handle--number {
  background: #1a1a1a !important;
  border-color: #ec4899 !important;
}

.workflow-handle--number.connected {
  background: #ec4899 !important;
}

/* Animations */
@keyframes nodeGlow {
  0%, 100% { box-shadow: 0 0 10px rgba(139,92,246,0.3); }
  50% { box-shadow: 0 0 30px rgba(139,92,246,0.8), 0 0 60px rgba(139,92,246,0.4); }
}

@keyframes successFlash {
  0% { border-color: #22c55e; box-shadow: 0 0 20px rgba(34,197,94,0.5); }
  100% { border-color: #2a2a2a; box-shadow: none; }
}

@keyframes pulseDotSmall {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.3); }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spin { animation: spin 1s linear infinite; }

@keyframes slideInRight {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes dashFlow {
  to { stroke-dashoffset: -8; }
}

/* React Flow overrides */
.react-flow__edge-path {
  stroke: #8b5cf6;
  stroke-width: 2;
  stroke-dasharray: 5 5;
  animation: dashFlow 1s linear infinite;
}

.react-flow__connection-path {
  stroke: #8b5cf6;
  stroke-width: 2;
}

.react-flow__background {
  background: #0a0a0a;
}

.react-flow__minimap {
  background: #111111 !important;
  border: 1px solid #2a2a2a !important;
  border-radius: 8px !important;
}
"""

with open("src/app/globals.css", "a") as f:
    if "DASHBOARD STYLES" not in open("src/app/globals.css").read():
        f.write("\n" + dashboard_css)

print("Appended CSS successfully.")
