import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { awsConfig } from './aws-exports';
import RevenueForm from './RevenueForm';
import Dashboard from './Dashboard';
import { Wallet, LogOut } from 'lucide-react'; // Icons
import { motion } from 'framer-motion'; // Animations

Amplify.configure(awsConfig);

function App() {
  return (
    // Customize the Authenticator to fit the dark theme (optional tweaks)
    <Authenticator>
      {({ signOut, user }) => (
        <div className="min-h-screen text-slate-200 font-sans selection:bg-indigo-500 selection:text-white">
          
          {/* Animated Navbar */}
          <motion.nav 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex justify-between items-center px-6 py-4 border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/30">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">Pecunia</h1>
                <p className="text-xs text-slate-400">Serverless Finance Tracker</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-400 hidden sm:block">
                {user?.username}
              </span>
              <button 
                onClick={signOut}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-full transition-all"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </motion.nav>

          {/* Main Content Area */}
          <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
            
            {/* Left Column: Form (Sticky on desktop) */}
            <div className="lg:col-span-4 space-y-6">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <RevenueForm />
              </motion.div>
            </div>

            {/* Right Column: Dashboard */}
            <div className="lg:col-span-8">
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
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