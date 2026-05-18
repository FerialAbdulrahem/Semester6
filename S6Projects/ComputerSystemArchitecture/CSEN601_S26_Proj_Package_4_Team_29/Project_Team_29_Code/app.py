"""
Web UI backend for Package 4 Processor Simulator
Run: python app.py
Then open: http://localhost:8080
"""

import subprocess, os, tempfile, re, json
from flask import Flask, request, jsonify, render_template_string

app = Flask(__name__)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SIM_BIN  = os.path.join(BASE_DIR, "simulator")

def compile_simulator():
    sources = ["main.c","alu.c","registers.c","InstructionMem.c",
               "DataMem.c","fetch.c","decode.c","execute.c"]
    cmd = ["gcc", "-O2", "-o", SIM_BIN] + [os.path.join(BASE_DIR, s) for s in sources]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print("COMPILE ERROR:\n", result.stderr)
        return False
    print("✓ Simulator compiled successfully")
    return True


def parse_output(raw: str) -> dict:
    lines = raw.splitlines()

    # ── Regexes ──────────────────────────────────────────────────────────
    cycle_re    = re.compile(r"={3,}\s*Clock Cycle\s+(\d+)")
    imem_re     = re.compile(r"InstrMem\[(\d+)\]\s*=\s*0x([0-9A-Fa-f]+)")
    dmem_re     = re.compile(r"DataMem\[\s*(\d+)\s*\]\s*=\s*(-?\d+)\s*\(0x")
    total_re    = re.compile(r"Total Clock Cycles Executed:\s*(\d+)")
    program_re  = re.compile(r"\[MAIN\]\s+Program has\s+(\d+) instructions")
    expected_re = re.compile(r"Expected clock cycles.*?:\s*(\d+)")
    # IF: "[IF] Fetched: PC=5  0x..."
    if_re       = re.compile(r"\[IF\] Fetched:.*?PC=\s*(-?\d+)")
    # ID: "[ID] Decode: PC=5  0x..."
    id_re       = re.compile(r"\[ID\] Decode:.*?PC=\s*(-?\d+)")
    # EX: "[EX] Execute: opcode=…" — no PC here; we derive PC from the
    #      instrPC that was latched: the previous cycle's ID PC becomes
    #      this cycle's EX PC (tracked below).
    ex_active_re = re.compile(r"\[EX\] Execute:")
    flush_re     = re.compile(r"flushed", re.IGNORECASE)
    reg_re       = re.compile(r"\bR(\d+)\s*=\s*(-?\d+)\s*\(0x[0-9A-Fa-f]+\)")
    sreg_re      = re.compile(r"\bSREG\s*=\s*(0x[0-9A-Fa-f]+)")
    pc_reg_re    = re.compile(r"\bPC\s*=\s*(\d+)\b")

    total_cycles = 0
    num_instr    = 0
    expected_cyc = 0
    registers    = {}
    inst_mem     = {}
    data_mem     = {}
    cycles       = []
    section      = None
    current_cycle = None

    for line in lines:
        # ── Section markers ──────────────────────────────────────────
        if total_re.search(line):
            total_cycles = int(total_re.search(line).group(1))
        if program_re.search(line):
            num_instr = int(program_re.search(line).group(1))
        if expected_re.search(line):
            expected_cyc = int(expected_re.search(line).group(1))

        if "REGISTER FILE" in line:
            section = "regs";  continue
        if "INSTRUCTION MEMORY" in line:
            section = "imem";  continue
        if "DATA MEMORY" in line:
            section = "dmem";  continue

        m = cycle_re.search(line)
        if m:
            if current_cycle:
                cycles.append(current_cycle)
            current_cycle = {
                "cycle":   int(m.group(1)),
                "raw":     [],
                "if_pc":   None,   # PC fetched this cycle
                "id_pc":   None,   # PC decoded this cycle
                "ex_active": False,
                "flushed": False,
            }
            section = "cycle"
            continue

        # ── Register/memory sections ─────────────────────────────────
        if section == "regs":
            for rm in reg_re.finditer(line):
                registers["R" + rm.group(1)] = rm.group(2)
            pc_m = pc_reg_re.search(line)
            if pc_m:
                registers["PC"] = pc_m.group(1)
            sreg_m = sreg_re.search(line)
            if sreg_m:
                registers["SREG"] = str(int(sreg_m.group(1), 16))

        if section == "imem":
            m2 = imem_re.search(line)
            if m2:
                inst_mem[int(m2.group(1))] = "0x" + m2.group(2).upper()

        if section == "dmem":
            m2 = dmem_re.search(line)
            if m2:
                addr, val = int(m2.group(1)), int(m2.group(2))
                if val != 0:
                    data_mem[addr] = val

        # ── Per-cycle tracking ────────────────────────────────────────
        if current_cycle and section == "cycle":
            current_cycle["raw"].append(line)

            m_if = if_re.search(line)
            if m_if:
                current_cycle["if_pc"] = int(m_if.group(1))

            m_id = id_re.search(line)
            if m_id:
                current_cycle["id_pc"] = int(m_id.group(1))

            if ex_active_re.search(line):
                current_cycle["ex_active"] = True

            if flush_re.search(line):
                current_cycle["flushed"] = True

    if current_cycle:
        cycles.append(current_cycle)

    # ── Build timeline ────────────────────────────────────────────────────
    #
    # Pipeline: IF → ID → EX (3 stages, no stalls for data hazards in P4)
    #
    # Key insight from the simulator source:
    #   • fetch.c  prints "[IF] Fetched: PC=X"  in the cycle the instruction
    #     is fetched.
    #   • decode.c prints "[ID] Decode: PC=X"   in the cycle the instruction
    #     is decoded (one cycle after its fetch cycle normally, but after a
    #     branch flush the decode cycle may be skipped entirely).
    #   • execute.c prints "[EX] Execute:" with NO PC. The instrPC is stored
    #     in the ID/EX latch; we derive it: whatever was in ID last cycle is
    #     now in EX this cycle (when ex_active is True).
    #
    # So: for each instruction track its IF cycle and ID cycle from the output
    # directly. EX cycle = the cycle AFTER its ID cycle where ex_active==True.
    #
    # Flushed instructions: they were fetched (appear in IF) but their ID
    # entry is immediately followed by a flush line, OR they were in IF/ID
    # when a branch resolved and the latch says "flushed".
    #
    # We also track "bubble" cycles: cycles where EX is empty (latch was
    # invalid).

    # Map: pc → {fetch_cycle, id_cycle, ex_cycle, flushed}
    timeline = {}

    # Pass 1: collect IF and ID events
    for c in cycles:
        cnum = c["cycle"]
        pc_if = c["if_pc"]
        pc_id = c["id_pc"]

        if pc_if is not None:
            if pc_if not in timeline:
                timeline[pc_if] = {"fetch": cnum, "id": None, "ex": None, "flushed": False}
            else:
                # Re-fetched after branch (same PC fetched again): treat as new entry
                # Use a composite key pc:fetch_cycle to disambiguate
                pass  # handled below with composite keys if needed

        if pc_id is not None:
            if pc_id not in timeline:
                timeline[pc_id] = {"fetch": None, "id": cnum, "ex": None, "flushed": False}
            else:
                if timeline[pc_id]["id"] is None:
                    timeline[pc_id]["id"] = cnum

    # Pass 2: assign EX cycles
    # For each instruction that has an ID cycle, find the next cycle where
    # ex_active == True. We do this by building a mapping: id_cycle → pc,
    # then looking up the next ex_active cycle.
    id_cycle_to_pc = {}
    for pc, info in timeline.items():
        if info["id"] is not None:
            id_cycle_to_pc[info["id"]] = pc

    ex_active_cycles = {c["cycle"] for c in cycles if c["ex_active"]}

    for pc, info in timeline.items():
        if info["id"] is not None and info["ex"] is None:
            # EX should fire in the cycle immediately after ID
            candidate = info["id"] + 1
            if candidate in ex_active_cycles:
                info["ex"] = candidate
            else:
                # look forward up to 3 cycles (in case of gap)
                for delta in range(2, 5):
                    if info["id"] + delta in ex_active_cycles:
                        info["ex"] = info["id"] + delta
                        break

    # Pass 3: mark flushed instructions
    # An instruction is flushed if it was fetched or decoded but the cycle
    # it was in (or the following cycle) had a flush event, AND it never
    # reached EX (no ex_cycle recorded).
    flush_cycles = {c["cycle"] for c in cycles if c["flushed"]}

    for pc, info in timeline.items():
        if info["ex"] is None:
            # Check if any flush happened at or after its fetch cycle
            fc = info["fetch"] or info["id"]
            if fc is not None:
                if any(f >= fc for f in flush_cycles):
                    info["flushed"] = True

    # Pass 4: handle re-fetched PCs (branch targets that share PC with an
    # earlier flushed instruction).  We split them by fetch cycle.
    # Build a clean list with unique (pc, fetch_cycle) keys.
    final_timeline = {}
    for pc, info in timeline.items():
        key = f"{pc}"
        # If both a flushed entry AND a completed entry exist for the same PC,
        # keep both by suffixing the flushed one.
        if info["flushed"] and info["ex"] is not None:
            info["flushed"] = False  # completed, don't mark flushed
        final_timeline[key] = info

    return {
        "cycles":       cycles,
        "registers":    registers,
        "inst_mem":     inst_mem,
        "data_mem":     data_mem,
        "total_cycles": total_cycles or len(cycles),
        "num_instr":    num_instr,
        "expected_cyc": expected_cyc,
        "raw":          "\n".join(lines),
        "timeline":     final_timeline,
    }


# ── HTML ──────────────────────────────────────────────────────────────────────
HTML = r"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>McHarvard · Pipeline Simulator</title>
<link href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@300;400;500;700&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
<style>
:root {
  --bg:           #050810;
  --surface:      #07091580;
  --panel:        #080b14;
  --card:         #0c1020;
  --card2:        #0f1426;
  --border:       #141c30;
  --border2:      #1d2840;
  --accent:       #00ffc8;
  --accent-dim:   rgba(0,255,200,.10);
  --accent-glow:  rgba(0,255,200,.20);
  --blue:         #60a5fa;
  --blue-dim:     rgba(96,165,250,.12);
  --purple:       #a78bfa;
  --purple-dim:   rgba(167,139,250,.12);
  --green:        #34d399;
  --green-dim:    rgba(52,211,153,.12);
  --orange:       #fb923c;
  --red:          #f87171;
  --yellow:       #fbbf24;
  --text:         #c8d6e8;
  --text-dim:     #3d5470;
  --text-mid:     #6888a8;
  --if-col:       #60a5fa;
  --id-col:       #a78bfa;
  --ex-col:       #34d399;
  --mono:         'Roboto Mono', monospace;
  --display:      'Roboto', sans-serif;
  --body:         'Roboto', sans-serif;
}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { height: 100%; background: var(--bg); color: var(--text); font-family: var(--body); overflow: hidden; }

/* subtle grid */
body::before {
  content: ''; position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background-image:
    linear-gradient(rgba(0,255,200,.012) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,255,200,.012) 1px, transparent 1px);
  background-size: 40px 40px;
}
body::after {
  content: ''; position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background: radial-gradient(ellipse 90% 55% at 50% 0%, rgba(0,255,200,.05) 0%, transparent 65%);
}

/* ── Layout ── */
.shell { position: relative; z-index: 1; display: grid; grid-template-rows: 52px 1fr; height: 100vh; }
.topbar {
  display: flex; align-items: center; gap: 14px; padding: 0 18px;
  background: rgba(5,8,16,.94); border-bottom: 1px solid var(--border);
  backdrop-filter: blur(16px);
}
.logo-mark { display: flex; align-items: center; gap: 10px; }
.logo-chip {
  width: 30px; height: 30px;
  background: linear-gradient(135deg, #00231a, #003d2e);
  border: 1px solid rgba(0,255,200,.3); border-radius: 7px;
  display: flex; align-items: center; justify-content: center; font-size: 13px;
  box-shadow: 0 0 18px rgba(0,255,200,.12);
}
.logo-title {
  font-family: var(--display); font-size: 1.05rem; font-weight: 700;
  letter-spacing: 1.5px; color: var(--accent);
  text-shadow: 0 0 24px rgba(0,255,200,.35);
}
.logo-sub {
  font-family: var(--mono); font-size: .46rem; color: var(--text-dim);
  letter-spacing: 1.8px; text-transform: uppercase; margin-top: 2px;
}
.topbar-div { width: 1px; height: 22px; background: var(--border); }
.topbar-info { font-family: var(--mono); font-size: .55rem; color: var(--text-dim); letter-spacing: .8px; }
.topbar-right { margin-left: auto; display: flex; align-items: center; gap: 10px; }
.status-dot { display: flex; align-items: center; gap: 5px; font-family: var(--mono); font-size: .55rem; color: var(--text-dim); }
.dot { width: 5px; height: 5px; border-radius: 50%; background: var(--green); box-shadow: 0 0 8px var(--green); animation: pulse 2s ease-in-out infinite; }
@keyframes pulse { 0%,100%{opacity:1}50%{opacity:.35} }
.badge {
  font-family: var(--mono); font-size: .52rem; font-weight: 700;
  letter-spacing: 2px; text-transform: uppercase; padding: 3px 9px;
  border-radius: 4px; background: rgba(0,255,200,.07);
  border: 1px solid rgba(0,255,200,.18); color: var(--accent);
}

/* ── Main grid ── */
.main { display: grid; grid-template-columns: 330px 1fr; overflow: hidden; }
.sidebar { display: flex; flex-direction: column; background: var(--surface); border-right: 1px solid var(--border); overflow: hidden; backdrop-filter: blur(12px); }

/* ── Tabs ── */
.tabs { display: flex; background: var(--bg); border-bottom: 1px solid var(--border); flex-shrink: 0; }
.tab {
  flex: 1; height: 40px; background: transparent; border: none;
  border-bottom: 2px solid transparent;
  display: flex; align-items: center; justify-content: center; gap: 5px;
  cursor: pointer; color: var(--text-dim); font-family: var(--mono);
  font-size: .5rem; letter-spacing: 1px; text-transform: uppercase;
  transition: all .2s;
}
.tab:hover { color: var(--text-mid); background: rgba(255,255,255,.015); }
.tab.active { color: var(--accent); border-bottom-color: var(--accent); background: rgba(0,255,200,.04); }
.tab-icon { font-size: 12px; }

/* ── Panels ── */
.panel { display: none; flex: 1; flex-direction: column; overflow: hidden; }
.panel.active { display: flex; }
.panel-scroll { flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 12px; }
.panel-scroll::-webkit-scrollbar { width: 2px; }
.panel-scroll::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }

/* ── Field label ── */
.field-label {
  display: flex; align-items: center; gap: 8px;
  font-family: var(--mono); font-size: .5rem; color: var(--text-dim);
  text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px;
}
.fll { flex: 1; height: 1px; background: var(--border); }

/* ── Editor ── */
.editor-wrap { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; transition: border-color .2s; }
.editor-wrap:focus-within { border-color: rgba(0,255,200,.35); box-shadow: 0 0 0 3px rgba(0,255,200,.05); }
.editor-hdr {
  background: var(--bg); padding: 6px 12px;
  display: flex; align-items: center; justify-content: space-between;
  border-bottom: 1px solid var(--border);
}
.ed-dots { display: flex; gap: 5px; }
.ed-dot { width: 7px; height: 7px; border-radius: 50%; }
.ed-dot:nth-child(1){background:#f87171}.ed-dot:nth-child(2){background:#fbbf24}.ed-dot:nth-child(3){background:#34d399}
.ed-file { font-family: var(--mono); font-size: .52rem; color: var(--text-dim); }
textarea {
  width: 100%; min-height: 230px; background: var(--panel);
  color: #7dd3fc; border: none; padding: 12px 14px;
  font-family: var(--mono); font-size: .76rem; line-height: 1.85;
  resize: vertical; outline: none; caret-color: var(--accent);
}
textarea::placeholder { color: var(--text-dim); opacity: .4; }

/* ── Buttons ── */
.btn-row { display: flex; gap: 8px; }
.btn {
  padding: 9px 14px; border: none; border-radius: 7px; cursor: pointer;
  font-family: var(--mono); font-weight: 700; font-size: .68rem;
  letter-spacing: .5px; display: flex; align-items: center; gap: 7px;
  justify-content: center; transition: all .18s; white-space: nowrap;
}
.btn-primary {
  flex: 1;
  background: linear-gradient(135deg, #003d30, #005c47);
  color: var(--accent); border: 1px solid rgba(0,255,200,.3);
  box-shadow: 0 0 20px rgba(0,255,200,.08), inset 0 1px 0 rgba(0,255,200,.08);
}
.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #005c47, #007a5e);
  box-shadow: 0 0 32px rgba(0,255,200,.18); transform: translateY(-1px);
}
.btn-primary:disabled { opacity: .3; cursor: not-allowed; transform: none; }
.btn-ghost { background: var(--card); border: 1px solid var(--border2); color: var(--text-mid); }
.btn-ghost:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }
.error-box {
  background: rgba(248,113,113,.07); border: 1px solid rgba(248,113,113,.22);
  border-radius: 7px; padding: 10px 12px; color: var(--red);
  font-family: var(--mono); font-size: .68rem; line-height: 1.6; white-space: pre-wrap;
}

/* ── Stats strip ── */
.stats-strip { flex-shrink: 0; border-top: 1px solid var(--border); display: grid; grid-template-columns: repeat(4,1fr); }
.stat-cell { padding: 9px 6px; text-align: center; border-right: 1px solid var(--border); }
.stat-cell:last-child { border-right: none; }
.stat-label { font-family: var(--mono); font-size: .46rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 1.2px; }
.stat-value { font-family: var(--display); font-size: 1.3rem; font-weight: 700; letter-spacing: .5px; color: var(--accent); margin-top: 2px; text-shadow: 0 0 14px rgba(0,255,200,.25); }

/* ── Register panel ── */
.sec-head { display: flex; align-items: center; gap: 8px; font-family: var(--mono); font-size: .5rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 2px; }
.sec-head::after { content: ''; flex: 1; height: 1px; background: var(--border); }
.flag-row { display: flex; gap: 4px; }
.flag { flex: 1; border-radius: 6px; padding: 6px 3px; text-align: center; background: var(--card); border: 1px solid var(--border); transition: all .2s; }
.flag.on { background: var(--green-dim); border-color: rgba(52,211,153,.3); box-shadow: 0 0 10px rgba(52,211,153,.1); }
.flag-name { font-family: var(--mono); font-size: .48rem; color: var(--text-dim); letter-spacing: 1px; }
.flag-val { font-family: var(--display); font-size: .95rem; font-weight: 700; color: var(--text-dim); margin-top: 2px; }
.flag.on .flag-val { color: var(--green); }
.pc-row { background: var(--card); border: 1px solid var(--border); border-radius: 7px; padding: 8px 14px; display: flex; align-items: center; gap: 10px; }
.pc-label { font-family: var(--mono); font-size: .52rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 1px; }
.pc-value { margin-left: auto; font-family: var(--display); font-size: 1.2rem; font-weight: 700; letter-spacing: .5px; color: var(--orange); }
.reg-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 3px; }
.reg-chip { background: var(--card); border: 1px solid var(--border); border-radius: 5px; padding: 5px 3px; text-align: center; transition: all .15s; }
.reg-chip:hover { background: var(--card2); border-color: var(--border2); }
.reg-chip.nz { background: var(--blue-dim); border-color: rgba(96,165,250,.22); }
.reg-name { font-family: var(--mono); font-size: .46rem; color: var(--text-dim); }
.reg-val { font-family: var(--mono); font-size: .68rem; font-weight: 700; color: var(--text-dim); margin-top: 1px; }
.reg-chip.nz .reg-val { color: var(--blue); }

/* ── Memory panel ── */
.mem-wrap { border: 1px solid var(--border); border-radius: 7px; overflow: hidden; }
.mem-table { width: 100%; border-collapse: collapse; font-family: var(--mono); font-size: .68rem; }
.mem-table thead th { background: var(--bg); padding: 6px 10px; text-align: left; color: var(--text-dim); font-size: .5rem; text-transform: uppercase; letter-spacing: 1.2px; border-bottom: 1px solid var(--border); }
.mem-table tbody tr:hover td { background: rgba(0,255,200,.025); }
.mem-table td { padding: 5px 10px; border-bottom: 1px solid var(--border); }
.mem-table tr:last-child td { border-bottom: none; }
.addr { display: inline-block; padding: 1px 6px; border-radius: 3px; font-size: .6rem; font-weight: 700; background: var(--blue-dim); color: var(--blue); }
.hex  { color: var(--orange); }
.bin  { color: var(--text-dim); font-size: .6rem; letter-spacing: .5px; }
.dec  { color: var(--green); }

/* ── Empty states ── */
.empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; color: var(--text-dim); padding: 28px; text-align: center; }
.empty-icon { font-size: 1.8rem; opacity: .15; }
.empty-title { font-family: var(--display); font-size: .95rem; font-weight: 700; letter-spacing: .5px; color: var(--text-mid); }
.empty-sub { font-family: var(--body); font-size: .72rem; max-width: 210px; line-height: 1.65; opacity: .55; }

/* ── Content area ── */
.content { display: flex; flex-direction: column; background: var(--bg); overflow: hidden; }
.toolbar {
  height: 48px; flex-shrink: 0;
  background: rgba(7,9,21,.96); border-bottom: 1px solid var(--border);
  display: flex; align-items: center; padding: 0 14px; gap: 10px;
  backdrop-filter: blur(12px);
}
.toolbar-title { font-family: var(--display); font-size: .95rem; font-weight: 700; letter-spacing: 1px; color: var(--text); flex: 1; }

/* Cycle nav */
.cycle-nav { display: flex; align-items: center; gap: 6px; }
.nav-btn {
  width: 26px; height: 26px; background: var(--card); border: 1px solid var(--border2);
  color: var(--text-mid); border-radius: 5px; cursor: pointer; font-size: .75rem;
  display: flex; align-items: center; justify-content: center; transition: all .15s;
  font-family: var(--mono);
}
.nav-btn:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }
.nav-btn:disabled { opacity: .18; cursor: not-allowed; }
.cycle-counter {
  font-family: var(--mono); font-size: .68rem; background: var(--card);
  border: 1px solid var(--border2); border-radius: 5px; padding: 4px 12px;
  color: var(--accent); min-width: 105px; text-align: center;
}
.play-btn {
  height: 26px; padding: 0 12px; background: var(--green-dim);
  border: 1px solid rgba(52,211,153,.28); color: var(--green);
  border-radius: 5px; cursor: pointer; font-family: var(--mono);
  font-weight: 700; font-size: .65rem; letter-spacing: .5px; transition: all .15s;
}
.play-btn:hover { background: rgba(52,211,153,.18); }
.play-btn.playing { background: rgba(248,113,113,.1); border-color: rgba(248,113,113,.28); color: var(--red); }

/* View switch */
.view-switch { display: flex; background: var(--card); border: 1px solid var(--border); border-radius: 6px; overflow: hidden; }
.view-btn {
  padding: 4px 10px; background: transparent; border: none;
  color: var(--text-dim); cursor: pointer; font-family: var(--mono);
  font-size: .58rem; font-weight: 700; letter-spacing: .8px; text-transform: uppercase;
  transition: all .15s;
}
.view-btn + .view-btn { border-left: 1px solid var(--border); }
.view-btn:hover { color: var(--text-mid); }
.view-btn.active { color: var(--accent); background: var(--accent-dim); }

/* ── Pipeline body ── */
.pipeline-body { flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 12px; }
.pipeline-body::-webkit-scrollbar { width: 3px; }
.pipeline-body::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }

/* ── Stage cards ── */
.stages-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; }
.stage-card {
  border-radius: 10px; padding: 16px; border: 1px solid var(--border);
  background: var(--card); position: relative; overflow: hidden;
}
.stage-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; }
.stage-card::after  { content: ''; position: absolute; top: 0; left: 0; bottom: 0; width: 3px; }
.sc-if { border-color: rgba(96,165,250,.2); background: rgba(96,165,250,.04); }
.sc-if::before  { background: var(--if-col); box-shadow: 0 0 14px var(--if-col); }
.sc-if::after   { background: linear-gradient(to bottom, var(--if-col), transparent); }
.sc-id { border-color: rgba(167,139,250,.2); background: rgba(167,139,250,.04); }
.sc-id::before  { background: var(--id-col); box-shadow: 0 0 14px var(--id-col); }
.sc-id::after   { background: linear-gradient(to bottom, var(--id-col), transparent); }
.sc-ex { border-color: rgba(52,211,153,.2); background: rgba(52,211,153,.04); }
.sc-ex::before  { background: var(--ex-col); box-shadow: 0 0 14px var(--ex-col); }
.sc-ex::after   { background: linear-gradient(to bottom, var(--ex-col), transparent); }
.sc-empty { opacity: .28; }
.sc-stage { font-family: var(--mono); font-size: .5rem; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; margin-bottom: 10px; }
.sc-if .sc-stage { color: var(--if-col); }
.sc-id .sc-stage { color: var(--id-col); }
.sc-ex .sc-stage { color: var(--ex-col); }
.sc-empty .sc-stage { color: var(--text-dim); }
.sc-instr { font-family: var(--display); font-size: 1.55rem; font-weight: 700; letter-spacing: 1px; color: var(--text); margin-bottom: 6px; }
.sc-detail { font-family: var(--mono); font-size: .6rem; color: var(--text-dim); line-height: 1.65; }

/* ── Log card ── */
.log-card { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 14px; }
.log-title {
  font-family: var(--mono); font-size: .52rem; color: var(--text-dim);
  text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px;
  display: flex; align-items: center; gap: 8px;
}
.log-title::after { content: ''; flex: 1; height: 1px; background: var(--border); }
.log-line { display: flex; gap: 8px; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,.015); align-items: flex-start; }
.log-line:last-child { border-bottom: none; }
.log-badge {
  font-family: var(--mono); font-size: .5rem; font-weight: 700;
  padding: 2px 6px; border-radius: 3px; white-space: nowrap;
  margin-top: 1px; flex-shrink: 0; letter-spacing: .8px;
}
.lb-if  { background: var(--blue-dim);   color: var(--blue); }
.lb-id  { background: var(--purple-dim); color: var(--purple); }
.lb-ex  { background: var(--green-dim);  color: var(--green); }
.lb-up  { background: rgba(251,146,60,.1); color: var(--orange); }
.lb-fl  { background: rgba(248,113,113,.1); color: var(--red); }
.log-text { font-family: var(--mono); font-size: .65rem; color: var(--text); line-height: 1.6; word-break: break-all; }
.log-dim  { font-family: var(--mono); font-size: .65rem; color: var(--text-dim); line-height: 1.6; }

/* ── Timeline table ── */
.tl-card { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 16px; }
.tl-title {
  font-family: var(--display); font-size: .85rem; font-weight: 700;
  letter-spacing: .5px; color: var(--text); margin-bottom: 4px;
}
.tl-subtitle { font-family: var(--mono); font-size: .5rem; color: var(--text-dim); letter-spacing: 1px; margin-bottom: 14px; }
.tl-scroll { overflow-x: auto; }
.tl-scroll::-webkit-scrollbar { height: 3px; }
.tl-scroll::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }
.tl-table { border-collapse: collapse; font-family: var(--mono); font-size: .65rem; }
.tl-table th {
  background: var(--bg); padding: 5px 10px; color: var(--text-dim);
  border: 1px solid var(--border); font-size: .52rem; text-transform: uppercase;
  letter-spacing: 1px; white-space: nowrap; font-weight: 700;
}
.tl-table th.tl-cur { color: var(--orange); border-color: rgba(251,146,60,.4); background: rgba(251,146,60,.06); }
.tl-table td { padding: 5px 10px; border: 1px solid var(--border); text-align: center; min-width: 42px; white-space: nowrap; }
.tl-label  { text-align: left !important; color: var(--text-mid) !important; font-weight: 600 !important; padding-left: 12px !important; min-width: 100px !important; white-space: nowrap; }
.tl-empty  { color: var(--text-dim); font-size: .55rem; }

/* Stage cells */
.tl-if { background: rgba(96,165,250,.15); color: var(--if-col); font-weight: 700; border-color: rgba(96,165,250,.25) !important; }
.tl-id { background: rgba(167,139,250,.15); color: var(--id-col); font-weight: 700; border-color: rgba(167,139,250,.25) !important; }
.tl-ex { background: rgba(52,211,153,.15); color: var(--ex-col); font-weight: 700; border-color: rgba(52,211,153,.25) !important; }
.tl-flush { background: rgba(248,113,113,.12); color: var(--red); font-weight: 700; border-color: rgba(248,113,113,.25) !important; text-decoration: line-through; }
.tl-bubble { background: rgba(255,255,255,.02); color: var(--text-dim); font-size: .55rem; }

/* Current-cycle highlight on rows */
.tl-table tr:hover td { background-blend-mode: screen; filter: brightness(1.15); }

/* Legend */
.tl-legend {
  display: flex; gap: 14px; flex-wrap: wrap; margin-top: 12px; padding: 10px 12px;
  background: rgba(0,0,0,.2); border-radius: 6px;
  font-family: var(--mono); font-size: .55rem; color: var(--text-dim);
}
.leg-item { display: flex; align-items: center; gap: 5px; }
.leg-swatch { display: inline-block; width: 28px; padding: 1px 4px; border-radius: 3px; text-align: center; font-size: .5rem; font-weight: 700; }

/* Raw output */
.raw-card {
  background: var(--panel); border: 1px solid var(--border); border-radius: 10px;
  padding: 16px; font-family: var(--mono); font-size: .7rem; color: #5ba8d8;
  white-space: pre-wrap; overflow-x: auto; flex: 1; min-height: 200px; line-height: 1.75;
}

/* Center states */
.center-state { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; color: var(--text-dim); padding: 40px; text-align: center; }
.center-icon  { font-size: 2.8rem; opacity: .12; }
.center-title { font-family: var(--display); font-size: 1.3rem; font-weight: 700; letter-spacing: 1.5px; color: var(--text-mid); }
.center-sub   { font-family: var(--body); font-size: .78rem; max-width: 310px; line-height: 1.7; opacity: .55; }

/* Spinner */
.spinner { width: 20px; height: 20px; border: 2px solid var(--border2); border-top-color: var(--accent); border-radius: 50%; animation: spin .7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg) } }
@keyframes fade-up { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
.anim { animation: fade-up .22s ease both; }
</style>
</head>
<body>
<div class="shell">
  <header class="topbar">
    <div class="logo-mark">
      <div class="logo-chip">⚡</div>
      <div>
        <div class="logo-title">McHarvard</div>
        <div class="logo-sub">Harvard Arch · 3-Stage Pipeline · CSEN601 S26</div>
      </div>
    </div>
    <div class="topbar-div"></div>
    <div class="topbar-info">IF → ID → EX</div>
    <div class="topbar-right">
      <div class="status-dot"><div class="dot"></div>Ready</div>
      <div class="badge">GUC · MET</div>
    </div>
  </header>

  <div class="main">
    <!-- ── Sidebar ── -->
    <aside class="sidebar">
      <div class="tabs">
        <button class="tab active" onclick="switchTab('editor')"><span class="tab-icon">✏️</span>Editor</button>
        <button class="tab" onclick="switchTab('registers')"><span class="tab-icon">📊</span>Regs</button>
        <button class="tab" onclick="switchTab('memory')"><span class="tab-icon">🗄️</span>Memory</button>
      </div>

      <div class="panel active" id="panel-editor">
        <div class="panel-scroll">
          <div>
            <div class="field-label">Assembly Program <div class="fll"></div></div>
            <div class="editor-wrap">
              <div class="editor-hdr">
                <div class="ed-dots"><div class="ed-dot"></div><div class="ed-dot"></div><div class="ed-dot"></div></div>
                <div class="ed-file">program.asm</div>
              </div>
              <textarea id="program" rows="14" placeholder="# Write assembly here...&#10;LDI R1 5&#10;LDI R2 3&#10;ADD R1 R2"></textarea>
            </div>
          </div>
          <div class="btn-row">
            <button class="btn btn-primary" id="run-btn" onclick="runSimulator()">▶ Run Simulation</button>
            <button class="btn btn-ghost" onclick="loadSample()" title="Load sample">📄</button>
          </div>
          <div id="error-area"></div>
        </div>
        <div class="stats-strip" id="stats-strip" style="display:none">
          <div class="stat-cell"><div class="stat-label">Cycles</div><div class="stat-value" id="s-cycles">–</div></div>
          <div class="stat-cell"><div class="stat-label">Expected</div><div class="stat-value" id="s-expected">–</div></div>
          <div class="stat-cell"><div class="stat-label">Instrs</div><div class="stat-value" id="s-instrs">–</div></div>
          <div class="stat-cell"><div class="stat-label">CPI</div><div class="stat-value" id="s-cpi">–</div></div>
        </div>
      </div>

      <div class="panel" id="panel-registers">
        <div class="panel-scroll" id="reg-content">
          <div class="empty"><div class="empty-icon">📊</div><div class="empty-title">No Data Yet</div><div class="empty-sub">Run a simulation to see final register values.</div></div>
        </div>
      </div>

      <div class="panel" id="panel-memory">
        <div class="panel-scroll" id="mem-content">
          <div class="empty"><div class="empty-icon">🗄️</div><div class="empty-title">No Data Yet</div><div class="empty-sub">Run a simulation to see memory contents.</div></div>
        </div>
      </div>
    </aside>

    <!-- ── Content ── -->
    <div class="content">
      <div class="toolbar">
        <div class="toolbar-title">Pipeline Execution View</div>
        <div class="cycle-nav">
          <button class="nav-btn" id="btn-prev" onclick="prevCycle()" disabled>◀</button>
          <div class="cycle-counter" id="cycle-counter">–</div>
          <button class="nav-btn" id="btn-next" onclick="nextCycle()" disabled>▶</button>
          <button class="play-btn" id="play-btn" onclick="togglePlay()">▶ Play</button>
        </div>
        <div class="view-switch">
          <button class="view-btn active" id="vbtn-pipeline" onclick="switchView('pipeline')">Pipeline</button>
          <button class="view-btn"        id="vbtn-timeline" onclick="switchView('timeline')">Timeline</button>
          <button class="view-btn"        id="vbtn-raw"      onclick="switchView('raw')">Raw</button>
        </div>
      </div>
      <div class="pipeline-body" id="pipeline-body">
        <div class="center-state">
          <div class="center-icon">⚡</div>
          <div class="center-title">Ready to Simulate</div>
          <div class="center-sub">Write an assembly program in the editor and click Run to visualize the 3-stage pipeline execution.</div>
        </div>
      </div>
    </div>
  </div>
</div>

<script>
let simData = null, curCycle = 0, viewMode = 'pipeline', playTimer = null;
const PLAY_MS = 800;

/* ── Tab / view switching ─────────────────────────────────────── */
function switchTab(tab) {
  document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.getElementById('panel-' + tab).classList.add('active');
  document.querySelectorAll('.tab').forEach(b => {
    if ((b.getAttribute('onclick') || '').includes("'" + tab + "'")) b.classList.add('active');
  });
}
function switchView(v) {
  viewMode = v;
  document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
  const vb = document.getElementById('vbtn-' + v);
  if (vb) vb.classList.add('active');
  if (simData) renderView();
}
function loadSample() { document.getElementById('program').value = SAMPLE; }

/* ── Run ─────────────────────────────────────────────────────── */
async function runSimulator() {
  const program = document.getElementById('program').value.trim();
  if (!program) return;
  const btn = document.getElementById('run-btn');
  btn.disabled = true;
  btn.innerHTML = '<div class="spinner" style="width:13px;height:13px;border-width:2px"></div> Running…';
  document.getElementById('error-area').innerHTML = '';
  stopPlay(); curCycle = 0; simData = null;
  document.getElementById('pipeline-body').innerHTML =
    '<div class="center-state"><div class="spinner"></div><div class="center-title">Simulating</div></div>';
  document.getElementById('stats-strip').style.display = 'none';
  try {
    const res  = await fetch('/run', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({program}) });
    const data = await res.json();
    if (data.error) {
      document.getElementById('error-area').innerHTML = `<div class="error-box">❌ ${esc(data.error)}</div>`;
      document.getElementById('pipeline-body').innerHTML =
        '<div class="center-state"><div class="center-icon">❌</div><div class="center-title">Compile Error</div><div class="center-sub">Check your assembly syntax.</div></div>';
      return;
    }
    simData = data; curCycle = 0;
    updateStats(); renderRegisters(); renderMemory(); updateCycleNav(); switchView(viewMode);
  } catch(e) {
    document.getElementById('error-area').innerHTML = `<div class="error-box">Network error: ${esc(e.message)}</div>`;
  } finally {
    btn.disabled = false; btn.innerHTML = '▶ Run Simulation';
  }
}

/* ── Stats ───────────────────────────────────────────────────── */
function updateStats() {
  if (!simData) return;
  document.getElementById('stats-strip').style.display = 'grid';
  document.getElementById('s-cycles').textContent   = simData.total_cycles;
  document.getElementById('s-expected').textContent = simData.expected_cyc || '–';
  document.getElementById('s-instrs').textContent   = simData.num_instr;
  const cpi = simData.num_instr ? (simData.total_cycles / simData.num_instr).toFixed(2) : '–';
  document.getElementById('s-cpi').textContent = cpi;
}

/* ── View dispatch ───────────────────────────────────────────── */
function renderView() {
  if (!simData) return;
  if (viewMode === 'pipeline')  renderPipeline();
  else if (viewMode === 'timeline') renderTimeline();
  else renderRaw();
}

/* ── Pipeline view ───────────────────────────────────────────── */
function renderPipeline() {
  const cycles = simData.cycles;
  if (!cycles || !cycles.length) {
    document.getElementById('pipeline-body').innerHTML =
      '<div class="center-state"><div class="center-icon">🤔</div><div class="center-title">No Cycle Data</div></div>';
    return;
  }
  const c = cycles[curCycle];
  if (!c) return;

  // Group raw lines by stage tag
  const linesByStage = { IF: [], ID: [], EX: [] };
  let lastStage = null;
  for (const line of c.raw) {
    const m = line.match(/\[(IF|ID|EX)\]/);
    if (m) {
      lastStage = m[1];
      linesByStage[lastStage].push(line);
    } else if (lastStage && line.trim()) {
      linesByStage[lastStage].push(line);
    }
  }

  const card = (cls, abbr, full, lines) => {
    if (!lines.length)
      return `<div class="stage-card ${cls} sc-empty anim">
        <div class="sc-stage">${abbr} · ${full}</div>
        <div class="sc-instr" style="color:var(--text-dim)">BUBBLE</div>
      </div>`;
    let instr = '—';
    const mn = lines.find(l => /\b(LDI|ADD|SUB|MUL|AND|OR|JR|SAL|SAR|LB|SB|BEQZ)\b/i.test(l));
    if (mn) instr = mn.match(/\b(LDI|ADD|SUB|MUL|AND|OR|JR|SAL|SAR|LB|SB|BEQZ)\b/i)[1].toUpperCase();
    else { const oc = lines[0].match(/opcode=(\d+)/); if (oc) instr = 'OP' + oc[1]; }
    const detail = lines.map(l => esc(l.replace(/\[(IF|ID|EX)\]/g,'').trim())).join('<br>');
    return `<div class="stage-card ${cls} anim">
      <div class="sc-stage">${abbr} · ${full}</div>
      <div class="sc-instr">${instr}</div>
      <div class="sc-detail">${detail}</div>
    </div>`;
  };

  let html = `<div class="stages-grid">
    ${card('sc-if','IF','Instruction Fetch', linesByStage.IF)}
    ${card('sc-id','ID','Decode',            linesByStage.ID)}
    ${card('sc-ex','EX','Execute / WB',      linesByStage.EX)}
  </div>
  <div class="log-card anim">
    <div class="log-title">Cycle ${c.cycle} · Detail Log</div>
    ${c.raw.filter(l => l.trim()).map(renderLogLine).join('')}
  </div>`;
  document.getElementById('pipeline-body').innerHTML = html;
}

function renderLogLine(line) {
  let badge = '', cls = '';
  if (line.includes('[IF]'))        { badge = 'IF';  cls = 'lb-if'; }
  else if (line.includes('[ID]'))   { badge = 'ID';  cls = 'lb-id'; }
  else if (line.includes('[EX]'))   { badge = 'EX';  cls = 'lb-ex'; }
  else if (line.includes('updated')){ badge = 'UPD'; cls = 'lb-up'; }
  else if (/flush/i.test(line))     { badge = 'FLU'; cls = 'lb-fl'; }
  else return `<div class="log-line"><div class="log-dim">${esc(line)}</div></div>`;
  return `<div class="log-line">
    <div class="log-badge ${cls}">${badge}</div>
    <div class="log-text">${esc(line.replace(/\[(IF|ID|EX)\]/g,'').trim())}</div>
  </div>`;
}

/* ── Timeline view ───────────────────────────────────────────── */
/*
 * LOGIC:
 * The Python parser tracks for each instruction (identified by its PC):
 *   fetch   = cycle where "[IF] Fetched: PC=X" appeared
 *   id      = cycle where "[ID] Decode: PC=X"  appeared
 *   ex      = fetch+2 normally, BUT after a branch flush some instructions
 *             only have IF (or IF+ID) and no EX — they are flushed.
 *
 * We use the timeline dict from the server directly.
 * For display we show:
 *   IF cell  → fetch cycle
 *   ID cell  → id cycle
 *   EX cell  → ex cycle
 *   FLU cell → cycles the instruction occupied before being flushed
 *   '·'      → all other cycles
 */
function renderTimeline() {
  const tl = simData.timeline;
  if (!tl || Object.keys(tl).length === 0) {
    document.getElementById('pipeline-body').innerHTML =
      '<div class="center-state"><div class="center-icon">📊</div><div class="center-title">No Timeline Data</div></div>';
    return;
  }

  const maxCycle = simData.total_cycles || simData.cycles.length;

  // Sort instructions by PC (numeric)
  const instructions = Object.entries(tl)
    .map(([pc, info]) => ({ pc: parseInt(pc), ...info }))
    .sort((a, b) => a.pc - b.pc);

  // Column headers
  const cols = [];
  for (let i = 1; i <= maxCycle; i++) cols.push(i);

  let html = `<div class="tl-card anim">
  <div class="tl-title">Pipeline Timeline</div>
  <div class="tl-subtitle">${instructions.length} instructions · ${maxCycle} cycles · branches/flushes shown</div>
  <div class="tl-scroll"><table class="tl-table"><thead><tr>
  <th class="tl-label" style="text-align:left">Instr (PC)</th>`;

  cols.forEach(c => {
    const isCur = (c === curCycle + 1);
    html += `<th${isCur ? ' class="tl-cur"' : ''}>${c}</th>`;
  });
  html += `</tr></thead><tbody>`;

  instructions.forEach(inst => {
    const { pc, fetch, id, ex, flushed } = inst;
    const rowLabel = flushed ? `<span style="color:var(--red)">✕</span> PC=${pc}` : `PC=${pc}`;
    html += `<tr><td class="tl-label">${rowLabel}</td>`;

    cols.forEach(c => {
      let cellClass = 'tl-empty';
      let content   = '·';

      if (fetch === c) {
        cellClass = flushed && id === null ? 'tl-flush' : 'tl-if';
        content   = flushed && id === null ? 'IF✕' : 'IF';
      } else if (id === c) {
        cellClass = flushed && ex === null ? 'tl-flush' : 'tl-id';
        content   = flushed && ex === null ? 'ID✕' : 'ID';
      } else if (ex === c) {
        cellClass = 'tl-ex';
        content   = 'EX';
      }

      html += `<td class="${cellClass}">${content}</td>`;
    });

    html += `</tr>`;
  });

  // Bubble row: cycles where no instruction is in any active stage
  html += `<tr style="border-top:2px solid var(--border2)">
    <td class="tl-label" style="color:var(--text-dim);font-style:italic">Bubble</td>`;
  cols.forEach(c => {
    const anyActive = instructions.some(i => i.fetch === c || i.id === c || i.ex === c);
    html += `<td class="tl-bubble">${anyActive ? '' : '○'}</td>`;
  });
  html += `</tr>`;

  html += `</tbody></table></div>
  <div class="tl-legend">
    <span class="leg-item"><span class="leg-swatch tl-if">IF</span> Fetch</span>
    <span class="leg-item"><span class="leg-swatch tl-id">ID</span> Decode</span>
    <span class="leg-item"><span class="leg-swatch tl-ex">EX</span> Execute</span>
    <span class="leg-item"><span class="leg-swatch tl-flush">✕</span> Flushed</span>
    <span class="leg-item" style="color:var(--text-dim)">○ = bubble (empty stage)</span>
  </div>
  </div>`;

  document.getElementById('pipeline-body').innerHTML = html;
}

/* ── Raw view ────────────────────────────────────────────────── */
function renderRaw() {
  document.getElementById('pipeline-body').innerHTML =
    `<div class="raw-card anim">${esc(simData.raw || '')}</div>`;
}

/* ── Registers ───────────────────────────────────────────────── */
function renderRegisters() {
  if (!simData?.registers) return;
  const regs = simData.registers;
  const sreg = parseInt(regs['SREG']) || 0;
  const pc   = regs['PC'] || '0';
  const flags = [{n:'C',b:4},{n:'V',b:3},{n:'N',b:2},{n:'S',b:1},{n:'Z',b:0}];
  let html = `<div class="sec-head">Status Flags · SREG = 0x${(sreg&0xff).toString(16).padStart(2,'0').toUpperCase()}</div>
  <div class="flag-row">${flags.map(f => {
    const v = (sreg >> f.b) & 1;
    return `<div class="flag ${v?'on':''}"><div class="flag-name">${f.n}</div><div class="flag-val">${v}</div></div>`;
  }).join('')}</div>
  <div class="pc-row"><div class="pc-label">Program Counter</div><div class="pc-value">PC = ${pc}</div></div>
  <div class="sec-head">General Registers · R0–R63</div>
  <div class="reg-grid">`;
  for (let i = 0; i <= 63; i++) {
    const v  = regs['R' + i] !== undefined ? regs['R' + i] : '0';
    const nz = parseInt(v) !== 0;
    html += `<div class="reg-chip ${nz?'nz':''}"><div class="reg-name">R${i}</div><div class="reg-val">${v}</div></div>`;
  }
  html += '</div>';
  document.getElementById('reg-content').innerHTML = html;
}

/* ── Memory ──────────────────────────────────────────────────── */
function renderMemory() {
  if (!simData) return;
  const iMem  = simData.inst_mem || {}, dMem = simData.data_mem || {};
  const iKeys = Object.keys(iMem).map(Number).sort((a,b) => a-b);
  const dKeys = Object.keys(dMem).map(Number).sort((a,b) => a-b);

  let html = `<div class="sec-head">Instruction Memory · ${iKeys.length} entries</div>
  <div class="mem-wrap"><table class="mem-table"><thead><tr><th>Addr</th><th>Hex</th><th>Binary</th></tr></thead><tbody>`;
  iKeys.slice(0,100).forEach(k => {
    const hex = iMem[k] || '0x0000';
    const num = parseInt(hex, 16);
    const bin = num.toString(2).padStart(16,'0').replace(/(.{4})/g,'$1 ').trim();
    html += `<tr><td><span class="addr">${k}</span></td><td class="hex">${hex}</td><td class="bin">${bin}</td></tr>`;
  });
  if (iKeys.length > 100)
    html += `<tr><td colspan="3" style="color:var(--text-dim);text-align:center;padding:8px;font-family:var(--mono);font-size:.6rem">…${iKeys.length-100} more</td></tr>`;
  html += `</tbody></table></div>
  <div class="sec-head">Data Memory · ${dKeys.length} non-zero</div>`;
  if (dKeys.length === 0) {
    html += `<div style="color:var(--text-dim);font-family:var(--mono);font-size:.68rem;padding:8px 2px">All data memory locations are zero.</div>`;
  } else {
    html += `<div class="mem-wrap"><table class="mem-table"><thead><tr><th>Addr</th><th>Dec</th><th>Hex</th></tr></thead><tbody>`;
    dKeys.forEach(k => {
      const v = dMem[k];
      html += `<tr><td><span class="addr">${k}</span></td><td class="dec">${v}</td><td class="hex">0x${(v&0xff).toString(16).padStart(2,'0').toUpperCase()}</td></tr>`;
    });
    html += `</tbody></table></div>`;
  }
  document.getElementById('mem-content').innerHTML = html;
}

/* ── Cycle nav ───────────────────────────────────────────────── */
function updateCycleNav() {
  if (!simData?.cycles) return;
  const total = simData.cycles.length;
  document.getElementById('cycle-counter').textContent = total ? `Cycle ${curCycle+1} / ${total}` : '–';
  document.getElementById('btn-prev').disabled = curCycle <= 0;
  document.getElementById('btn-next').disabled = curCycle >= total - 1;
}
function prevCycle() { if (curCycle > 0)                              { curCycle--; renderView(); updateCycleNav(); } }
function nextCycle() { if (simData?.cycles && curCycle < simData.cycles.length-1) { curCycle++; renderView(); updateCycleNav(); } }
function togglePlay() {
  const btn = document.getElementById('play-btn');
  if (playTimer) {
    stopPlay();
  } else {
    playTimer = setInterval(() => {
      if (!simData?.cycles || curCycle >= simData.cycles.length-1) { stopPlay(); return; }
      nextCycle();
    }, PLAY_MS);
    btn.textContent = '⏸ Pause'; btn.classList.add('playing');
  }
}
function stopPlay() {
  if (playTimer) { clearInterval(playTimer); playTimer = null; }
  const btn = document.getElementById('play-btn');
  if (btn) { btn.textContent = '▶ Play'; btn.classList.remove('playing'); }
}
function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

loadSample();
switchView('pipeline');
</script>
</body>
</html>
"""


# ── Routes ────────────────────────────────────────────────────────────────────
@app.route("/")
def index():
    return render_template_string(HTML)

@app.route("/run", methods=["POST"])
def run():
    data    = request.get_json()
    program = data.get("program", "").strip()
    if not program:
        return jsonify({"error": "No program provided."})

    with tempfile.NamedTemporaryFile(mode="w", suffix=".txt",
                                    delete=False, dir=BASE_DIR) as f:
        f.write(program + "\n")
        tmpfile = f.name

    try:
        result = subprocess.run(
            [SIM_BIN, tmpfile],
            capture_output=True, text=True, timeout=15,
            cwd=BASE_DIR
        )
        raw = result.stdout + (result.stderr or "")
        if result.returncode != 0 and not result.stdout.strip():
            return jsonify({"error": result.stderr or "Simulator crashed."})

        parsed = parse_output(raw)
        return jsonify(parsed)

    except subprocess.TimeoutExpired:
        return jsonify({"error": "Simulation timed out (>15s). Possible infinite loop."})
    except Exception as e:
        return jsonify({"error": str(e)})
    finally:
        os.unlink(tmpfile)


if __name__ == "__main__":
    if not compile_simulator():
        print("ERROR: Could not compile the simulator. Make sure gcc is available.")
        exit(1)
    print("\n✓ Starting web server at http://localhost:8080\n")
    app.run(host='0.0.0.0', port=8080, debug=False)