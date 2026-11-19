/**
 * Virtual PC Terminal & Productivity Center for HyFly-4
 */
import { soundEngine } from './audio.js';

export class VirtualTerminal {
  constructor() {
    this.outputEl = document.getElementById('terminal-output');
    this.inputEl = document.getElementById('terminal-input');
    this.notesEl = document.getElementById('notes-content');
    this.notesWordCountEl = document.getElementById('notes-word-count');
    this.matrixInterval = null;
    this.uptimeSeconds = 0;

    this.history = [];
    this.historyIndex = -1;

    this.initNotes();
    this.initInput();
    this.initUptimeTimer();
    this.printWelcome();
  }

  printWelcome() {
    this.println("HyFly-4 Workstation Terminal v4.2.0 [OS: HyFly-Kernel 6.12.4-rt]", "warning");
    this.println("Type 'help' to inspect available system commands.\n");
  }

  initNotes() {
    if (!this.notesEl) return;
    const saved = localStorage.getItem('hyfly4_workspace_notes');
    if (saved) {
      this.notesEl.value = saved;
    } else {
      this.notesEl.value = `# HyFly-4 Development Scratchpad\n\n- Task 1: Complete 3D room collision and interaction geometry.\n- Task 2: Fine-tune Web Audio procedural Lo-Fi synthesizer chords.\n- Task 3: Sync telemetry HUD with SITL simulation endpoint.`;
    }
    this.updateNotesCount();

    this.notesEl.addEventListener('input', () => {
      localStorage.setItem('hyfly4_workspace_notes', this.notesEl.value);
      this.updateNotesCount();
    });
  }

  updateNotesCount() {
    if (!this.notesEl || !this.notesWordCountEl) return;
    const text = this.notesEl.value.trim();
    const words = text ? text.split(/\s+/).length : 0;
    const chars = text.length;
    this.notesWordCountEl.textContent = `${words} words | ${chars} characters | Autosaved`;
  }

  initInput() {
    if (!this.inputEl) return;
    this.inputEl.addEventListener('keydown', (e) => {
      soundEngine.playKeyClick();

      if (e.key === 'Enter') {
        const val = this.inputEl.value.trim();
        if (val) {
          this.history.push(val);
          this.historyIndex = this.history.length;
          this.executeCommand(val);
        } else {
          this.println("$ ");
        }
        this.inputEl.value = '';
      } else if (e.key === 'ArrowUp') {
        if (this.history.length > 0 && this.historyIndex > 0) {
          this.historyIndex--;
          this.inputEl.value = this.history[this.historyIndex];
        }
        e.preventDefault();
      } else if (e.key === 'ArrowDown') {
        if (this.historyIndex < this.history.length - 1) {
          this.historyIndex++;
          this.inputEl.value = this.history[this.historyIndex];
        } else {
          this.historyIndex = this.history.length;
          this.inputEl.value = '';
        }
        e.preventDefault();
      }
    });
  }

  initUptimeTimer() {
    setInterval(() => {
      this.uptimeSeconds++;
      const uptimeEl = document.getElementById('spec-uptime');
      if (uptimeEl) {
        const h = Math.floor(this.uptimeSeconds / 3600);
        const m = Math.floor((this.uptimeSeconds % 3600) / 60);
        const s = this.uptimeSeconds % 60;
        uptimeEl.textContent = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      }

      // Random jitter for specs
      const cpuVal = document.getElementById('spec-cpu');
      const cpuBar = document.getElementById('spec-cpu-bar');
      if (cpuVal && cpuBar) {
        const usage = Math.floor(18 + Math.random() * 22);
        cpuVal.textContent = `${usage}%`;
        cpuBar.style.width = `${usage}%`;
      }
    }, 1000);
  }

  println(text, className = '') {
    if (!this.outputEl) return;
    const div = document.createElement('div');
    div.className = `terminal-line ${className}`;
    div.textContent = text;
    this.outputEl.appendChild(div);
    this.outputEl.scrollTop = this.outputEl.scrollHeight;
  }

  executeCommand(cmdStr) {
    this.println(`$ ${cmdStr}`, 'cmd-echo');
    const parts = cmdStr.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (this.matrixInterval) {
      clearInterval(this.matrixInterval);
      this.matrixInterval = null;
    }

    switch (cmd) {
      case 'garden':
        this.println("Garden terrace: Outdoor deck, glass railing, bamboo planters at (+18m, -7m).");
        break;
      case 'fireplace':
        this.println("Stone hearth: Toggle cozy fire with [E] in the living room.");
        break;
      case 'sit':
        this.println("Elaina relaxes in sitting posture. Use [6] to toggle.");
        break;
      case 'weather':
        this.println("Weather system active: Rain / Overcast / Day / Sunset presets available.");
        break;

      case 'photo':
        document.body.classList.toggle('photo-mode');
        this.println("Photo Mode toggled.");
        break;

      case 'help':
        this.println("Available Commands:");
        this.println("  help       - Show this command reference");
        this.println("  about      - Display workstation and HyFly-4 overview");
        this.println("  neofetch   - Display hardware specs and ASCII banner");
        this.println("  projects   - Show related autonomous & game engineering projects");
        this.println("  skills     - List technology stack and domains");
        this.println("  matrix     - Launch matrix digital rain simulation");
        this.println("  date       - Print current system date and UTC time");
        this.println("  echo <msg> - Print message to terminal");
        this.println("  clear      - Clear the terminal screen");
        this.println("  exit       - Close virtual PC monitor");
        break;

      case 'status':
        this.println("Engine: Three.js r160 WebGL2 | 60 FPS locked | 28m x 28m | Architect: xianly runa");
        break;

      case 'about':
        this.println("HyFly-4: Interactive 3D Virtual Workspace & Autonomous Lab");
        this.println("Engineered with WebGL, Three.js, Web Audio API, and Modern HTML5 Standards.");
        this.println("Features real-time lighting dynamics, synthesized lo-fi audio, and workstation control.");
        break;

      case 'neofetch':
      case 'specs':
        const banner = 
`  _   _       _____ _         _  _   
 | | | |_   _|  ___| |_   _  | || |  
 | |_| | | | | |_  | | | | | | || |_ 
 |  _  | |_| |  _| | | |_| | |__   _|
 |_| |_|\\__, |_|   |_|\\__, |    |_|  
        |___/         |___/          `;
        this.println(banner, 'success');
        this.println("OS: HyFly-4 Virtual Linux x86_64");
        this.println("Host: Three.js 3D Virtual Environment");
        this.println("Kernel: 6.12.4-rt-aerospace");
        this.println("Shell: hyfly-sh 4.2");
        this.println("Renderer: WebGL2 Canvas Accelerated");
        this.println("Audio: Web Audio API Low-Pass Synthesizer");
        this.println("Memory: 16384 MB / 64000 MB");
        break;

      case 'projects':
        this.println("Active Engineering Projects:");
        this.println("1. HyFly-4: 3D Virtual Room & Interactive Telemetry Dashboard");
        this.println("2. KRRTI Autonomous Flight Controller (pymavlink + 6-DOF SITL)");
        this.println("3. KurirRush3D: Low-poly delivery navigation game");
        this.println("4. SplittyGo: Smart group finance and expense tracker");
        break;

      case 'skills':
        this.println("Technical Domains & Stack:");
        this.println("- Robotics: MAVLink, ArduPilot SITL, UAV Flight Dynamics, OpenCV");
        this.println("- 3D & Web: Three.js, WebGL, Modern CSS/HTML5, Canvas 2D");
        this.println("- Audio Engineering: Web Audio API, Procedural DSP, Subtractive Synth");
        this.println("- Systems: Python, Dart/Flutter, Linux Shell, Git");
        break;

      case 'matrix':
        this.println("Starting digital rain stream (Press any key or enter command to stop)...", "success");
        let lines = 0;
        this.matrixInterval = setInterval(() => {
          const chars = "01010101XYZABCDEFGHIJKLM456789!@#$%^&*";
          let line = "";
          for (let i = 0; i < 48; i++) {
            line += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          this.println(line, "success");
          lines++;
          if (lines > 35) {
            clearInterval(this.matrixInterval);
            this.matrixInterval = null;
          }
        }, 80);
        break;

      case 'date':
      case 'time':
        this.println(new Date().toUTCString());
        break;

      case 'echo':
        this.println(args.join(' '));
        break;

      case 'clear':
        if (this.outputEl) this.outputEl.innerHTML = '';
        break;

      case 'exit':
        const dialog = document.getElementById('pc-dialog');
        if (dialog && dialog.close) dialog.close();
        break;

      default:
        this.println(`Command not found: '${cmd}'. Type 'help' for command list.`, 'error');
        break;
    }
  }
}

