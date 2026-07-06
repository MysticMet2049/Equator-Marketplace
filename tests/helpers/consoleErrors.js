export function collectConsoleErrors(page) {
  const errors = [];
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text();
    if (/favicon|ResizeObserver|Failed to load resource.*404/i.test(text)) return;
    errors.push(text);
  });
  return errors;
}
