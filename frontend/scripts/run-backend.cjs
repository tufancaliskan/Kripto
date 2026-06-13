const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const backendDir = path.resolve(__dirname, "../../backend");
const isWin = process.platform === "win32";
const venvPython = path.join(
  backendDir,
  ".venv",
  isWin ? "Scripts/python.exe" : "bin/python"
);

const python = fs.existsSync(venvPython)
  ? venvPython
  : isWin
    ? "python"
    : "python3";

const child = spawn(python, ["run.py"], {
  cwd: backendDir,
  stdio: "inherit",
  shell: isWin,
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});
