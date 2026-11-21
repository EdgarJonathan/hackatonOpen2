const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = 5173;
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
};

function resolveInsideRoot(relativePath) {
  const candidates = [
    path.resolve(root, relativePath),
    path.resolve(root, "public", relativePath),
  ];

  return (
    candidates.find((candidate) => {
      const inside = candidate === path.resolve(root) || candidate.startsWith(path.resolve(root) + path.sep);
      return inside && fs.existsSync(candidate) && fs.statSync(candidate).isFile();
    }) ?? null
  );
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://127.0.0.1:${port}`);
  const requested = decodeURIComponent(url.pathname).replace(/^\/+/, "");
  const relativePath = requested === "" ? "index.html" : requested;
  const filePath = resolveInsideRoot(relativePath);

  if (!filePath) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("No encontrado");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("No encontrado");
      return;
    }

    const type = types[path.extname(filePath)] ?? "application/octet-stream";
    response.writeHead(200, { "Content-Type": type });
    response.end(data);
  });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`LegacyBridge AI en http://127.0.0.1:${port}`);
});
