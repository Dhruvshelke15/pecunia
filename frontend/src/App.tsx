import { Amplify } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { awsConfig } from "./aws-exports";
import RevenueForm from "./RevenueForm";
import Dashboard from "./Dashboard";
import AiChat from "./AiChat";
import { useTheme } from "./hooks/useTheme";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";

Amplify.configure(awsConfig);

function App() {
  const { isDark, toggle } = useTheme();

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div
          className="min-h-screen transition-colors duration-200"
          style={{ background: "var(--bg-base)" }}
        >
          {/* Navbar */}
          <motion.header
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.35 }}
            className="sticky top-0 z-50 px-6 py-3.5 flex items-center justify-between"
            style={{
              background: "var(--nav-bg)",
              borderBottom: "1px solid var(--border)",
              backdropFilter: "blur(20px)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                style={{
                  background: "rgba(20,184,166,0.1)",
                  border: "1px solid rgba(20,184,166,0.2)",
                  color: "#14b8a6",
                }}
              >
                P
              </div>
              <div className="flex items-baseline gap-1.5">
                <span
                  className="font-bold text-sm tracking-tight"
                  style={{ color: "var(--text-primary)" }}
                >
                  Pecunia
                </span>
                <span
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  finance
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <span
                className="hidden sm:block text-xs font-mono px-3 py-1.5 rounded-lg max-w-[200px] truncate"
                style={{
                  color: "var(--text-secondary)",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                }}
              >
                {user?.signInDetails?.loginId ?? user?.username}
              </span>

              {/* Theme toggle */}
              <button
                onClick={toggle}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  color: "var(--text-secondary)",
                }}
                title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDark ? (
                  <Sun className="w-3.5 h-3.5" />
                ) : (
                  <Moon className="w-3.5 h-3.5" />
                )}
              </button>

              <button
                onClick={signOut}
                className="text-xs px-3.5 py-1.5 rounded-lg font-medium transition-all duration-200"
                style={{
                  color: "#f87171",
                  background: "rgba(248,113,113,0.1)",
                  border: "1px solid rgba(248,113,113,0.2)",
                }}
              >
                Sign out
              </button>
            </div>
          </motion.header>

          {/* Layout */}
          <main className="max-w-screen-xl mx-auto px-5 py-7 grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-4 space-y-5">
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <RevenueForm />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <AiChat />
              </motion.div>
            </div>

            <div className="lg:col-span-8">
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
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
