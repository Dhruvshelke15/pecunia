import { Amplify } from "aws-amplify";
import {
  Authenticator,
  ThemeProvider,
  createTheme,
} from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { awsConfig } from "./aws-exports";
import RevenueForm from "./RevenueForm";
import Dashboard from "./Dashboard";
import AiChat from "./AiChat";
import { useTheme } from "./hooks/useTheme";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";

Amplify.configure(awsConfig);

const amplifyTheme = createTheme({
  name: "pecunia-theme",
  tokens: {
    colors: {
      brand: {
        primary: {
          10: { value: "rgba(20,184,166,0.08)" },
          20: { value: "rgba(20,184,166,0.12)" },
          40: { value: "rgba(20,184,166,0.2)" },
          60: { value: "rgba(20,184,166,0.5)" },
          80: { value: "#0d9488" },
          90: { value: "#14b8a6" },
          100: { value: "#2dd4bf" },
        },
      },
      background: {
        primary: { value: "#070b12" },
        secondary: { value: "#0d1520" },
      },
      font: {
        primary: { value: "#f0f0f0" },
        secondary: { value: "rgba(255,255,255,0.5)" },
        interactive: { value: "#14b8a6" },
      },
      border: {
        primary: { value: "rgba(255,255,255,0.07)" },
        secondary: { value: "rgba(255,255,255,0.04)" },
        focus: { value: "rgba(20,184,166,0.5)" },
      },
    },
    components: {
      authenticator: {
        router: {
          borderWidth: { value: "1px" },
          borderStyle: { value: "solid" },
          borderColor: { value: "rgba(255,255,255,0.07)" },
          backgroundColor: { value: "rgba(255,255,255,0.04)" },
          boxShadow: { value: "0 24px 64px rgba(0,0,0,0.5)" },
        },
        container: {
          widthMax: { value: "420px" },
        },
      },
      button: {
        primary: {
          backgroundColor: { value: "#14b8a6" },
          color: { value: "#070b12" },
          borderColor: { value: "#14b8a6" },
          _hover: {
            backgroundColor: { value: "#0d9488" },
            borderColor: { value: "#0d9488" },
          },
          _focus: {
            backgroundColor: { value: "#0d9488" },
            borderColor: { value: "#0d9488" },
          },
          _active: {
            backgroundColor: { value: "#0f766e" },
            borderColor: { value: "#0f766e" },
          },
        },
        link: {
          color: { value: "#14b8a6" },
          _hover: {
            color: { value: "#2dd4bf" },
            backgroundColor: { value: "rgba(20,184,166,0.08)" },
          },
        },
      },
      fieldcontrol: {
        color: { value: "#f0f0f0" },
        borderColor: { value: "rgba(255,255,255,0.07)" },
        _focus: {
          borderColor: { value: "rgba(20,184,166,0.5)" },
          boxShadow: { value: "0 0 0 3px rgba(20,184,166,0.1)" },
        },
      },
      field: {
        label: {
          color: { value: "rgba(255,255,255,0.5)" },
        },
      },
      tabs: {
        item: {
          color: { value: "rgba(255,255,255,0.4)" },
          borderColor: { value: "rgba(255,255,255,0.07)" },
          _active: {
            color: { value: "#14b8a6" },
            borderColor: { value: "#14b8a6" },
            backgroundColor: { value: "transparent" },
          },
          _hover: {
            color: { value: "rgba(255,255,255,0.7)" },
          },
          _focus: {
            color: { value: "#14b8a6" },
          },
        },
      },
      heading: {
        color: { value: "#f0f0f0" },
      },
      text: {
        color: { value: "rgba(255,255,255,0.5)" },
      },
      alert: {
        backgroundColor: { value: "rgba(248,113,113,0.08)" },
        color: { value: "#f87171" },
      },
    },
    radii: {
      small: { value: "8px" },
      medium: { value: "10px" },
      large: { value: "12px" },
    },
    space: {
      medium: { value: "1.25rem" },
      large: { value: "1.5rem" },
    },
  },
});

const LoginHeader = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "10px",
      paddingTop: "2rem",
      paddingBottom: "0.5rem",
    }}
  >
    <div
      style={{
        width: "40px",
        height: "40px",
        borderRadius: "12px",
        background: "rgba(20,184,166,0.1)",
        border: "1px solid rgba(20,184,166,0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "18px",
        fontWeight: 700,
        color: "#14b8a6",
      }}
    >
      P
    </div>
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          color: "#f0f0f0",
          fontWeight: 700,
          fontSize: "17px",
          letterSpacing: "-0.01em",
        }}
      >
        Pecunia{" "}
        <span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 400 }}>
          Finance
        </span>
      </div>
    </div>
  </div>
);

const LoginFooter = () => (
  <div
    style={{
      textAlign: "center",
      padding: "1rem 0 1.5rem",
      fontSize: "11px",
      color: "rgba(255,255,255,0.2)",
    }}
  >
    Secure • Private • Yours
  </div>
);

function App() {
  const { isDark, toggle } = useTheme();

  return (
    <ThemeProvider theme={amplifyTheme} colorMode="dark">
      <Authenticator
        components={{
          Header: LoginHeader,
          Footer: LoginFooter,
        }}
      >
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
                  title={
                    isDark ? "Switch to light mode" : "Switch to dark mode"
                  }
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
    </ThemeProvider>
  );
}

export default App;
