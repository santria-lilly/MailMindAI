import React, { useState, useEffect } from 'react';
import {
  Mail,
  ShieldCheck,
  Key,
  ExternalLink,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Cpu,
  Power
} from 'lucide-react';
import { AuthStatus } from '../types';
import { api } from '../services/api';

interface SettingsViewProps {
  authStatus: AuthStatus | null;
  onRefreshAuthStatus: () => void;
  onResetDemo: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  authStatus,
  onRefreshAuthStatus,
  onResetDemo
}) => {
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showGuide, setShowGuide] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get('error');
    if (err) {
      setMessage({ type: 'error', text: decodeURIComponent(err) });
    } else if (params.get('connected') === 'true') {
      setMessage({ type: 'success', text: `Google account ${params.get('email') || ''} connected successfully!` });
    }
  }, []);

  const handleConnectGmail = async () => {
    try {
      setConnecting(true);
      setMessage(null);
      const res = await api.getGoogleAuthUrl();
      // Redirect to Google OAuth consent screen
      window.location.href = res.authorization_url;
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to start Google OAuth flow' });
      setConnecting(false);
    }
  };

  const handleDisconnectGmail = async () => {
    if (!window.confirm('Are you sure you want to disconnect your Gmail account? Demo mode will remain active.')) {
      return;
    }
    try {
      setDisconnecting(true);
      await api.disconnectGoogle();
      setMessage({ type: 'success', text: 'Gmail account disconnected successfully.' });
      onRefreshAuthStatus();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to disconnect account' });
    } finally {
      setDisconnecting(false);
    }
  };

  const handleResetDemoData = async () => {
    try {
      setResetting(true);
      setMessage(null);
      await api.resetDemoData();
      setMessage({ type: 'success', text: 'Demo dataset reset with fresh sample emails, tasks, and notifications.' });
      onResetDemo();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to reset demo dataset' });
    } finally {
      setResetting(false);
    }
  };

  const isConnected = authStatus?.is_authenticated;
  const hasCredsConfigured = authStatus?.has_credentials_configured;
  const isAiConfigured = authStatus?.ai_configured;

  return (
    <div className="space-y-8 pb-12">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-charcoal-900 tracking-tight">
          Integrations & System Configuration
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
          Configure real Gmail OAuth 2.0 API, configure AI engine credentials, or operate seamlessly in Demo Mode.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-2.5 text-xs font-medium animate-in fade-in ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gmail API Integration Card */}
        <div className="rounded-2xl bg-white border border-cream-200 p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sage-700 text-cream-50 flex items-center justify-center shadow-card">
                <Mail className="w-5 h-5 text-emerald-200" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900 text-sm">
                  Official Gmail API Integration
                </h3>
                <p className="text-xs text-charcoal-400">Google OAuth 2.0 Authentication</p>
              </div>
            </div>

            <span
              className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${
                isConnected
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-cream-100 text-charcoal-600 border-cream-300'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-charcoal-400'}`} />
              {isConnected ? 'Connected' : 'Demo Mode Active'}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-cream-50/60 border border-cream-200 space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-cream-200">
              <span className="text-charcoal-500">OAuth Client ID:</span>
              <span className="font-mono text-charcoal-800">
                {authStatus?.client_id_configured ? 'Configured in backend/.env' : 'Not configured'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-cream-200">
              <span className="text-charcoal-500">OAuth Client Secret:</span>
              <span className="font-mono text-charcoal-800">
                {authStatus?.client_secret_configured ? 'Configured in backend/.env' : 'Not configured'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-cream-200">
              <span className="text-charcoal-500">Redirect URI:</span>
              <span className="font-mono text-charcoal-800 truncate max-w-[200px]" title={authStatus?.redirect_uri}>
                {authStatus?.redirect_uri || 'http://localhost:8000/api/auth/google/callback'}
              </span>
            </div>
            {isConnected && (
              <div className="flex justify-between py-1">
                <span className="text-charcoal-500">Active Gmail Account:</span>
                <span className="font-semibold text-emerald-800 truncate">
                  {authStatus?.connected_email}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            {isConnected ? (
              <button
                onClick={handleDisconnectGmail}
                disabled={disconnecting}
                className="px-4 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Power className="w-3.5 h-3.5" />
                {disconnecting ? 'Disconnecting...' : 'Disconnect Account'}
              </button>
            ) : hasCredsConfigured ? (
              <button
                onClick={handleConnectGmail}
                disabled={connecting}
                className="px-5 py-2.5 rounded-xl bg-sage-700 hover:bg-sage-800 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-subtle disabled:opacity-50"
              >
                <Mail className="w-4 h-4 text-emerald-200" />
                {connecting ? 'Connecting...' : 'Connect Google Account'}
              </button>
            ) : (
              <div className="space-y-2 w-full">
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span>
                    To connect your real Gmail, provide your Google OAuth Client ID and Secret in <code className="bg-amber-100 px-1 py-0.5 rounded">backend/.env</code>.
                    Demo Mode is active so you can evaluate all features immediately without credentials!
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Engine & Demo Mode Card */}
        <div className="rounded-2xl bg-white border border-cream-200 p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sage-700 text-cream-50 flex items-center justify-center shadow-card">
                <Cpu className="w-5 h-5 text-emerald-200" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900 text-sm">
                  AI Prioritization & Reply Engine
                </h3>
                <p className="text-xs text-charcoal-400">LLM & Rule-Based Fallback Engine</p>
              </div>
            </div>

            <span
              className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${
                isAiConfigured
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isAiConfigured ? 'Gemini AI Active' : 'Intelligent Fallback'}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-cream-50/60 border border-cream-200 space-y-2 text-xs leading-relaxed text-charcoal-700">
            <p>
              <strong>Security Architecture:</strong> Email bodies are treated strictly as untrusted data.
              Prompt injection defenses and input sanitization protect against malicious commands embedded in incoming emails.
            </p>
            <p className="text-charcoal-500 pt-1">
              <strong>Human-in-the-Loop:</strong> AI reply drafts are never dispatched autonomously.
              Every message must be reviewed, edited if desired, and explicitly confirmed before transmission.
            </p>
          </div>

          {/* Reset Demo Data Action */}
          <div className="pt-2 border-t border-cream-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-charcoal-800 block">
                Demonstration Dataset
              </span>
              <span className="text-[11px] text-charcoal-400 block">
                Reload realistic sample emails, tasks, and notifications
              </span>
            </div>

            <button
              onClick={handleResetDemoData}
              disabled={resetting}
              className="px-4 py-2 rounded-xl border border-cream-300 text-charcoal-700 hover:bg-cream-100 text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
              {resetting ? 'Resetting...' : 'Reset Demo Data'}
            </button>
          </div>
        </div>
      </div>

      {/* Step-by-Step Gmail API Setup Guide Accordion */}
      <div className="rounded-2xl bg-white border border-cream-200 shadow-subtle overflow-hidden">
        <div
          onClick={() => setShowGuide(!showGuide)}
          className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-cream-50 transition-colors bg-cream-50/40"
        >
          <div className="flex items-center gap-2.5">
            <Key className="w-5 h-5 text-sage-700" />
            <div>
              <h3 className="font-semibold text-charcoal-900 text-sm">
                Google Cloud Console & Gmail Setup Guide
              </h3>
              <p className="text-xs text-charcoal-400">
                Step-by-step instructions to obtain OAuth credentials (from GMAIL_SETUP.md)
              </p>
            </div>
          </div>
          {showGuide ? <ChevronUp className="w-5 h-5 text-charcoal-400" /> : <ChevronDown className="w-5 h-5 text-charcoal-400" />}
        </div>

        {showGuide && (
          <div className="p-6 border-t border-cream-200 space-y-6 text-xs sm:text-sm text-charcoal-700 leading-relaxed divide-y divide-cream-100">
            {/* Step 1 */}
            <div className="space-y-2 pt-2 first:pt-0">
              <h4 className="font-bold text-charcoal-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-sage-700 text-white flex items-center justify-center text-xs">1</span>
                Create Project in Google Cloud Console
              </h4>
              <p className="text-xs text-charcoal-600 pl-7">
                Navigate to <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="text-sage-700 underline font-medium inline-flex items-center gap-0.5">Google Cloud Console <ExternalLink className="w-3 h-3" /></a>, click project dropdown, and create a new project named <strong>MailMind AI</strong>.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-2 pt-4">
              <h4 className="font-bold text-charcoal-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-sage-700 text-white flex items-center justify-center text-xs">2</span>
                Enable the Gmail API
              </h4>
              <p className="text-xs text-charcoal-600 pl-7">
                Go to <strong>APIs & Services &gt; Library</strong>. Search for <strong>Gmail API</strong>, select it, and click <strong>Enable</strong>.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-2 pt-4">
              <h4 className="font-bold text-charcoal-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-sage-700 text-white flex items-center justify-center text-xs">3</span>
                Configure OAuth Consent Screen
              </h4>
              <p className="text-xs text-charcoal-600 pl-7">
                Go to <strong>APIs & Services &gt; OAuth consent screen</strong>. Select <strong>External</strong> user type. Fill in App Name (MailMind AI) and user support email. Under <strong>Test Users</strong>, add the Gmail address you will use for testing.
              </p>
            </div>

            {/* Step 4 */}
            <div className="space-y-2 pt-4">
              <h4 className="font-bold text-charcoal-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-sage-700 text-white flex items-center justify-center text-xs">4</span>
                Create OAuth 2.0 Web Client Credentials
              </h4>
              <div className="text-xs text-charcoal-600 pl-7 space-y-2">
                <p>
                  Go to <strong>APIs & Services &gt; Credentials &gt; Create Credentials &gt; OAuth Client ID</strong>.
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Application Type: <strong>Web application</strong></li>
                  <li>Name: <strong>MailMind AI Web Client</strong></li>
                  <li>Authorized JavaScript Origins: <code className="bg-cream-100 px-1 py-0.5 rounded text-charcoal-800">http://localhost:5173</code></li>
                  <li>Authorized Redirect URIs: <code className="bg-cream-100 px-1 py-0.5 rounded text-charcoal-800">http://localhost:8000/api/auth/google/callback</code></li>
                </ul>
              </div>
            </div>

            {/* Step 5 */}
            <div className="space-y-2 pt-4">
              <h4 className="font-bold text-charcoal-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-sage-700 text-white flex items-center justify-center text-xs">5</span>
                Add Credentials to backend/.env
              </h4>
              <div className="text-xs text-charcoal-600 pl-7 space-y-2">
                <p>Copy your Client ID and Client Secret from Google Cloud Console into <code className="bg-cream-100 px-1 py-0.5 rounded text-charcoal-800">backend/.env</code>:</p>
                <div className="p-3 rounded-xl bg-charcoal-900 text-cream-100 font-mono text-[11px] overflow-x-auto">
                  GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com<br />
                  GOOGLE_CLIENT_SECRET=your-client-secret<br />
                  GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback
                </div>
                <p>Restart the backend server and return here to click <strong>&quot;Connect Google Account&quot;</strong>!</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
