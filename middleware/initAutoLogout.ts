
let sessionCheckInterval: NodeJS.Timeout | null = null;

function checkBackendSessionValidity(): void {
  const token = localStorage.getItem("token");
  if (!token) return;

  fetch("/api/session-check/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Session invalid");
      }
    })
    .catch(() => {
      // TODO: Replace this stub with your actual logout logic or import the function if defined elsewhere
      function performAutoLogout(forced: boolean): void {
        // Implement your logout logic here, e.g., clearing tokens, redirecting, etc.
        console.log("Auto logout triggered. Forced:", forced);
      }
      performAutoLogout(true);  // pass true for forced logout
    });
}

// Start session check interval (every 30 seconds)
if (!sessionCheckInterval) {
  sessionCheckInterval = setInterval(checkBackendSessionValidity, 30000);
}
