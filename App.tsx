import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import ChatInterface from '@/components/ChatInterface.tsx';
import Sidebar from '@/components/Sidebar.tsx';
import SettingsModal from '@/components/SettingsModal.tsx';
import { ChatSession, ChatSettings } from '@/types.ts';

// Default initial session
const createNewSession = (): ChatSession => ({
  id: Date.now().toString(),
  title: 'New Chat',
  messages: [],
  createdAt: Date.now(),
});

const App: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // App-wide Settings State
  const [appSettings, setAppSettings] = useState<ChatSettings>({
    webSearchEnabled: false,
    turboMode: false,
    soundEnabled: true,
  });

  // Load from local storage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem('mimo_sessions');
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        if (parsed.length > 0) {
          setSessions(parsed);
          setActiveSessionId(parsed[parsed.length - 1].id);
        } else {
          const newSession = createNewSession();
          setSessions([newSession]);
          setActiveSessionId(newSession.id);
        }
      } catch (e) {
        console.error("Failed to load sessions", e);
      }
    } else {
      const newSession = createNewSession();
      setSessions([newSession]);
      setActiveSessionId(newSession.id);
    }

    const savedSettings = localStorage.getItem('mimo_settings');
    if (savedSettings) {
      try {
        setAppSettings(JSON.parse(savedSettings));
      } catch (e) { }
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('mimo_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('mimo_settings', JSON.stringify(appSettings));
  }, [appSettings]);

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0] || createNewSession();

  const handleUpdateSession = (updatedSession: ChatSession) => {
    setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
  };

  const handleNewChat = () => {
    const newSession = createNewSession();
    setSessions(prev => [...prev, newSession]);
    setActiveSessionId(newSession.id);
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSessions = sessions.filter(s => s.id !== id);
    if (newSessions.length === 0) {
      const fresh = createNewSession();
      setSessions([fresh]);
      setActiveSessionId(fresh.id);
    } else {
      setSessions(newSessions);
      if (activeSessionId === id) {
        setActiveSessionId(newSessions[newSessions.length - 1].id);
      }
    }
    if (newSessions.length === 0) {
      localStorage.removeItem('mimo_sessions');
    }
  };

  const handleClearAllChats = () => {
    const fresh = createNewSession();
    setSessions([fresh]);
    setActiveSessionId(fresh.id);
    localStorage.removeItem('mimo_sessions');
  };

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-[#343541]">
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <div className="flex-1 flex flex-col h-full relative min-w-0">
        {/* Mobile Header */}
        <div className="md:hidden flex-shrink-0 flex items-center justify-between p-3 bg-[#343541] border-b border-white/10 text-gray-200 z-10">
          <button onClick={() => setSidebarOpen(true)} className="p-1 hover:bg-white/10 rounded-md">
            <Menu size={24} />
          </button>
          <span className="font-medium text-sm truncate max-w-[200px]">
            {activeSession.title}
          </span>
          <div className="w-8" /> {/* Spacer */}
        </div>

        <ChatInterface
          currentSession={activeSession}
          onUpdateSession={handleUpdateSession}
          settings={appSettings}
          onUpdateSettings={setAppSettings}
        />
      </div>

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onClearAllChats={handleClearAllChats}
        settings={appSettings}
        onUpdateSettings={setAppSettings}
      />
    </div>
  );
};

export default App;