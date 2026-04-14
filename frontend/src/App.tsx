import { Amplify } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { awsConfig } from "./aws-exports";
import RevenueForm from "./RevenueForm";
import Dashboard from "./Dashboard";
import AiChat from "./AiChat";
import { motion } from "framer-motion";

Amplify.configure(awsConfig);

function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div className="min-h-screen">
          {/* Navbar */}
          <motion.header
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{
              borderBottom: "1px solid var(--border)",
              background: "rgba(8, 12, 20, 0.85)",
              backdropFilter: "blur(20px)",
            }}
            className="sticky top-0 z-50 px-8 py-4 flex justify-between items-center"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold mono"
                style={{
                  background: "var(--accent-dim)",
                  border: "1px solid var(--accent-border)",
                  color: "var(--accent)",
                }}
              >
                P
              </div>
              <div>
                <span
                  className="font-bold text-base tracking-tight"
                  style={{ color: "var(--text-primary)" }}
                >
                  Pecunia
                </span>
                <span
                  className="text-xs ml-2"
                  style={{ color: "var(--text-muted)" }}
                >
                  finance
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span
                className="text-xs mono hidden sm:block px-3 py-1.5 rounded-lg"
                style={{
                  color: "var(--text-secondary)",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  maxWidth: "200px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user?.signInDetails?.loginId ?? user?.username}
              </span>
              <button
                onClick={signOut}
                className="text-xs px-4 py-1.5 rounded-lg transition-all duration-200"
                style={{
                  color: "var(--danger)",
                  background: "var(--danger-dim)",
                  border: "1px solid rgba(255,92,92,0.15)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,92,92,0.18)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--danger-dim)";
                }}
              >
                Sign out
              </button>
            </div>
          </motion.header>

          {/* Main layout */}
          <main className="max-w-screen-xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: form + AI */}
            <div className="lg:col-span-4 space-y-5">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
              >
                <RevenueForm />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <AiChat />
              </motion.div>
            </div>

            {/* Right: dashboard */}
            <div className="lg:col-span-8">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
              >
                <Dashboard />
              </motion.div>
            </div>
          </main>
        </div>
      )}
    </Authenticator>
  );
}

export default App;
