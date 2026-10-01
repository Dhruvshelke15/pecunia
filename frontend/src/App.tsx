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
import BalanceHero from "./components/BalanceHero";
import HealthScoreCard from "./components/HealthScoreCard";
import ForecastCard from "./components/ForecastCard";
import PersonalityCard from "./components/PersonalityCard";
import Welcome from "./components/Welcome";
import { useState } from "react";
import { useTheme } from "./hooks/useTheme";
import { Sun, Moon, LogOut } from "lucide-react";

Amplify.configure(awsConfig);

const amplifyTheme = createTheme({
  name: "pecunia-theme",
  tokens: {
    colors: {
      brand: {
        primary: {
          10: { value: "var(--brass-soft)" },
          20: { value: "var(--brass-soft)" },
          40: { value: "var(--brass-soft)" },
          60: { value: "var(--brass)" },
          80: { value: "var(--brass)" },
          90: { value: "var(--brass)" },
          100: { value: "var(--brass)" },
        },
      },
      background: {
        primary: { value: "var(--surface)" },
        secondary: { value: "var(--surface-2)" },
      },
      font: {
        primary: { value: "var(--ink)" },
        secondary: { value: "var(--ink-2)" },
        interactive: { value: "var(--brass)" },
      },
      border: {
        primary: { value: "var(--line-strong)" },
        secondary: { value: "var(--line)" },
        focus: { value: "var(--brass)" },
      },
    },
    components: {
      authenticator: {
        router: {
          borderWidth: { value: "1px" },
          borderStyle: { value: "solid" },
          borderColor: { value: "var(--line)" },
          backgroundColor: { value: "var(--surface)" },
          boxShadow: { value: "none" },
        },
        container: { widthMax: { value: "420px" } },
      },
      button: {
        primary: {
          backgroundColor: { value: "var(--brass)" },
          color: { value: "var(--surface)" },
          borderColor: { value: "var(--brass)" },
          _hover: {
            backgroundColor: { value: "var(--brass)" },
            borderColor: { value: "var(--brass)" },
          },
          _focus: {
            backgroundColor: { value: "var(--brass)" },
            borderColor: { value: "var(--brass)" },
          },
          _active: {
            backgroundColor: { value: "var(--brass)" },
            borderColor: { value: "var(--brass)" },
          },
        },
        link: {
          color: { value: "var(--brass)" },
          _hover: {
            color: { value: "var(--ink)" },
            backgroundColor: { value: "var(--brass-soft)" },
          },
        },
      },
      fieldcontrol: {
        color: { value: "var(--ink)" },
        borderColor: { value: "var(--line-strong)" },
        _focus: {
          borderColor: { value: "var(--brass)" },
          boxShadow: { value: "none" },
        },
      },
      field: { label: { color: { value: "var(--ink-2)" } } },
      tabs: {
        item: {
          color: { value: "var(--ink-3)" },
          borderColor: { value: "var(--line)" },
          _active: {
            color: { value: "var(--ink)" },
            borderColor: { value: "var(--brass)" },
            backgroundColor: { value: "transparent" },
          },
          _hover: { color: { value: "var(--ink)" } },
          _focus: { color: { value: "var(--ink)" } },
        },
      },
      heading: { color: { value: "var(--ink)" } },
      text: { color: { value: "var(--ink-2)" } },
      alert: {
        backgroundColor: { value: "var(--expense-soft)" },
        color: { value: "var(--expense)" },
      },
    },
    radii: {
      small: { value: "8px" },
      medium: { value: "8px" },
      large: { value: "14px" },
    },
  },
});

const Wordmark = ({ size = "text-xl" }: { size?: string }) => (
  <span
    className={`font-display ${size} tracking-tight`}
    style={{ color: "var(--ink)" }}
  >
    Pecunia<span style={{ color: "var(--brass)" }}>.</span>
  </span>
);

const LoginHeader = () => (
  <div className="text-center pt-8 pb-2">
    <Wordmark size="text-4xl" />
    <p className="mt-2 text-sm" style={{ color: "var(--ink-2)" }}>
      Know where every dollar went.
    </p>
  </div>
);

function App() {
  const { isDark, toggle } = useTheme();
  // Welcome screen shows once per sign-in; sessionStorage keeps refreshes from re-showing it.
  const [started, setStarted] = useState(() => {
    try {
      return sessionStorage.getItem("pecunia-started") === "1";
    } catch {
      return false;
    }
  });
  const markStarted = (value: boolean) => {
    setStarted(value);
    try {
      if (value) sessionStorage.setItem("pecunia-started", "1");
      else sessionStorage.removeItem("pecunia-started");
    } catch {
      /* storage unavailable: welcome just shows again next load */
    }
  };

  return (
    <ThemeProvider theme={amplifyTheme} colorMode={isDark ? "dark" : "light"}>
      <Authenticator components={{ Header: LoginHeader }}>
        {({ signOut, user }) =>
          !started ? (
            <Welcome
              email={user?.signInDetails?.loginId}
              onContinue={(target) => {
                markStarted(true);
                window.scrollTo(0, 0);
                if (target === "entry")
                  setTimeout(
                    () => document.getElementById("amount")?.focus(),
                    50,
                  );
              }}
            />
          ) : (
            <div className="min-h-screen">
              <header
                className="sticky top-0 z-30 backdrop-blur-md"
                style={{
                  background: "color-mix(in srgb, var(--bg) 85%, transparent)",
                  borderBottom: "1px solid var(--line)",
                }}
              >
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
                  <Wordmark />
                  <div className="flex items-center gap-2">
                    <span
                      className="hidden sm:block text-sm max-w-[220px] truncate mr-1"
                      style={{ color: "var(--ink-3)" }}
                    >
                      {user?.signInDetails?.loginId ?? user?.username}
                    </span>
                    <button
                      onClick={toggle}
                      className="btn-quiet w-8 h-8"
                      aria-label={
                        isDark
                          ? "Switch to light theme"
                          : "Switch to dark theme"
                      }
                    >
                      {isDark ? (
                        <Sun className="w-4 h-4" />
                      ) : (
                        <Moon className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        markStarted(false);
                        signOut?.();
                      }}
                      className="btn-quiet h-8 px-3"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign out
                    </button>
                  </div>
                </div>
              </header>

              <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">
                <BalanceHero />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  <div className="lg:col-span-4 space-y-5">
                    <RevenueForm />
                    <AiChat />
                  </div>
                  <div className="lg:col-span-8">
                    <Dashboard />
                  </div>
                </div>

                <section aria-labelledby="insights-title" className="pt-4">
                  <h2 id="insights-title" className="font-display text-2xl">
                    Insights
                  </h2>
                  <p
                    className="text-sm mt-1 mb-4"
                    style={{ color: "var(--ink-3)" }}
                  >
                    Generated on request from your entries. Nothing runs until
                    you ask.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
                    <HealthScoreCard />
                    <ForecastCard />
                    <PersonalityCard />
                  </div>
                </section>
              </main>
            </div>
          )
        }
      </Authenticator>
    </ThemeProvider>
  );
}

export default App;
