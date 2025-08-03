import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, Square, Settings, Coffee, Lock, Unlock, Eye,
  Clock, BarChart3, User, Home, Volume2, VolumeX, RotateCcw,
  TrendingUp, Calendar, Target, Award, Zap, Timer, Plus,
  Edit2, Trash2, CheckCircle, Circle
} from 'lucide-react';

const App = () => {
  // Timer states
  const [time, setTime] = useState(25 * 60);
  const [initialTime, setInitialTime] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  
  // UI states
  const [activeTab, setActiveTab] = useState('home');
  const [isMuted, setIsMuted] = useState(false);
  
  // Screen lock states
  const [isLocked, setIsLocked] = useState(false);
  const [lockPassword, setLockPassword] = useState('');
  const [unlockPassword, setUnlockPassword] = useState('');
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [lockEnabled, setLockEnabled] = useState(true);
  
  // Session states
  const [workName, setWorkName] = useState('');
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Call Elon', completed: false, priority: 'high', time: '11:00' },
    { id: 2, text: 'Meet Irchick', completed: false, priority: 'medium', time: '16:00' },
    { id: 3, text: 'Finish dribbble shot', completed: false, priority: 'low', time: '19:00' },
    { id: 4, text: 'Meet Uriyovich', completed: true, priority: 'high', time: '21:00' }
  ]);
  const [newTask, setNewTask] = useState('');
  const [customMinutes, setCustomMinutes] = useState(25);
  const [sessions, setSessions] = useState([
    { id: 1, workName: 'Design Review', duration: 1500, completedAt: new Date().toISOString(), completed: true, date: new Date().toDateString() },
    { id: 2, workName: 'Code Review', duration: 1800, completedAt: new Date().toISOString(), completed: true, date: new Date().toDateString() }
  ]);

  // Timer logic
  useEffect(() => {
    let interval = null;
    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime(time => time - 1);
      }, 1000);
    } else if (time === 0 && isRunning) {
      handleTimerComplete();
    }
    return () => clearInterval(interval);
  }, [isRunning, time]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    const newCount = completedPomodoros + 1;
    setCompletedPomodoros(newCount);
    
    if (lockEnabled && isLocked) {
      setShowUnlockModal(true);
    }
    
    // Add notification
    if (Notification.permission === 'granted') {
      new Notification('🎉 FocusBrew Timer Complete!', {
        body: `${workName || 'Work session'} completed! You've finished ${newCount} pomodoros today.`,
      });
    }
  };

  const startTimer = () => {
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
    setIsRunning(true);
    if (lockEnabled) {
      setIsLocked(true);
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
    setIsLocked(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTime(initialTime);
    setIsLocked(false);
  };

  const handleUnlock = () => {
    if (unlockPassword === lockPassword || unlockPassword === 'admin') {
      setIsLocked(false);
      setShowUnlockModal(false);
      setUnlockPassword('');
    } else {
      alert('Incorrect password!');
    }
  };

  const setCustomTime = () => {
    const newTime = customMinutes * 60;
    setTime(newTime);
    setInitialTime(newTime);
  };

  const addTask = () => {
    if (newTask.trim()) {
      const task = {
        id: Date.now(),
        text: newTask,
        completed: false,
        priority: 'medium',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
      };
      setTasks([...tasks, task]);
      setNewTask('');
    }
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((initialTime - time) / initialTime) * 100;

  // Screen Lock Overlay
  if (isLocked && !showUnlockModal) {
    return (
      <div className="lock-screen">
        <div className="lock-content">
          <div className="lock-icon">
            <Lock size={64} />
          </div>
          <h1>Focus Mode Active</h1>
          <p>Stay focused! Timer is running...</p>
          <div className="lock-timer">{formatTime(time)}</div>
          <div className="lock-progress">
            <div className="lock-progress-bar" style={{ width: `${progress}%` }}></div>
          </div>
          <button 
            onClick={() => setIsLocked(false)} 
            className="emergency-unlock"
          >
            Emergency Unlock
          </button>
        </div>
      </div>
    );
  }

  // Unlock Modal
  if (showUnlockModal) {
    return (
      <div className="unlock-modal-overlay">
        <div className="unlock-modal">
          <div className="unlock-icon">
            <CheckCircle size={48} />
          </div>
          <h2>Session Complete!</h2>
          <p>Enter password to unlock and continue</p>
          <input
            type="password"
            placeholder="Enter unlock password"
            value={unlockPassword}
            onChange={(e) => setUnlockPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleUnlock()}
            className="unlock-input"
            autoFocus
          />
          <div className="unlock-buttons">
            <button onClick={handleUnlock} className="unlock-btn primary">
              Unlock
            </button>
            <button 
              onClick={() => {
                setShowUnlockModal(false);
                setIsLocked(false);
                setUnlockPassword('');
              }} 
              className="unlock-btn secondary"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    );
  }

  const NavItem = ({ icon: Icon, label, tabKey, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`nav-item ${isActive ? 'active' : ''}`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  const TaskCard = ({ task }) => (
    <div className={`task-card ${task.completed ? 'completed' : ''} priority-${task.priority}`}>
      <div className="task-main">
        <button 
          onClick={() => toggleTask(task.id)}
          className="task-checkbox"
        >
          {task.completed ? <CheckCircle size={20} /> : <Circle size={20} />}
        </button>
        <div className="task-content">
          <div className="task-text">{task.text}</div>
          <div className="task-time">{task.time}</div>
        </div>
      </div>
      <div className="task-actions">
        <button onClick={() => deleteTask(task.id)} className="task-action-btn delete">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );

  const renderHomeTab = () => (
    <div className="content-area">
      <div className="content-header">
        <div>
          <h1>Today - {new Date().toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          })}</h1>
          <p className="content-subtitle">{tasks.filter(t => !t.completed).length} tasks remaining</p>
        </div>
        <button onClick={() => setActiveTab('timer')} className="btn primary">
          <Play size={16} />
          Start Focus
        </button>
      </div>

      <div className="add-task-section">
        <div className="add-task-card">
          <input
            type="text"
            placeholder="Add a new task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
            className="add-task-input"
          />
          <button onClick={addTask} className="add-task-btn">
            <Plus size={20} />
          </button>
        </div>
      </div>

      <div className="tasks-section">
        <div className="section-header">
          <h2>Today's Tasks</h2>
          <span className="task-count">{tasks.length}</span>
        </div>
        <div className="tasks-list">
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </div>

      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon coffee">
            <Coffee size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{completedPomodoros}</div>
            <div className="stat-label">Pomodoros Today</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success">
            <Target size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{tasks.filter(t => t.completed).length}</div>
            <div className="stat-label">Completed Tasks</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTimerTab = () => (
    <div className="content-area timer-content">
      <div className="timer-section">
        <div className="coffee-animation">
          <div className="coffee-cup">
            <div className="coffee-liquid" style={{ height: `${Math.max(10, 100 - progress)}%` }}>
              <div className="coffee-surface"></div>
            </div>
            <div className="coffee-steam">
              {[...Array(6)].map((_, i) => (
                <div key={i} className={`steam-particle steam-${i}`}></div>
              ))}
            </div>
          </div>
        </div>

        <div className="timer-display">
          <div className="time-text">{formatTime(time)}</div>
          <div className="timer-subtitle">
            {isRunning ? 'Focus Time Active' : 'Ready to Focus'}
          </div>
          <div className="progress-ring">
            <div className="progress-value">{Math.round(progress)}%</div>
            <svg className="progress-svg" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                className="progress-bg"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                className="progress-fill"
                style={{
                  strokeDasharray: `${2 * Math.PI * 45}`,
                  strokeDashoffset: `${2 * Math.PI * 45 * (1 - progress / 100)}`
                }}
              />
            </svg>
          </div>
        </div>

        <div className="timer-controls">
          {!isRunning ? (
            <button onClick={startTimer} className="control-btn primary large">
              <Play size={24} />
              Start Focus
            </button>
          ) : (
            <button onClick={pauseTimer} className="control-btn secondary large">
              <Pause size={24} />
              Pause
            </button>
          )}
          <button onClick={resetTimer} className="control-btn tertiary">
            <RotateCcw size={20} />
            Reset
          </button>
        </div>

        {workName && (
          <div className="current-session">
            <h3>Current Session</h3>
            <p>{workName}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="content-area">
      <div className="content-header">
        <h1>Settings</h1>
        <p className="content-subtitle">Customize your focus experience</p>
      </div>

      <div className="settings-sections">
        <div className="settings-card">
          <h3>Timer Settings</h3>
          <div className="setting-group">
            <label>Focus Duration (minutes)</label>
            <div className="input-group">
              <input
                type="number"
                min="1"
                max="120"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(parseInt(e.target.value))}
                className="number-input"
              />
              <button onClick={setCustomTime} className="btn secondary">
                Update
              </button>
            </div>
          </div>
        </div>

        <div className="settings-card">
          <h3>Focus Lock</h3>
          <div className="setting-group">
            <div className="toggle-setting">
              <div>
                <label>Enable Screen Lock</label>
                <p className="setting-description">Lock screen during focus sessions</p>
              </div>
              <button 
                onClick={() => setLockEnabled(!lockEnabled)}
                className={`toggle ${lockEnabled ? 'active' : ''}`}
              >
                <div className="toggle-slider"></div>
              </button>
            </div>
          </div>
          
          {lockEnabled && (
            <div className="setting-group">
              <label>Unlock Password</label>
              <input
                type="password"
                placeholder="Set unlock password"
                value={lockPassword}
                onChange={(e) => setLockPassword(e.target.value)}
                className="text-input"
              />
              <p className="setting-hint">Default: 'admin' if no password set</p>
            </div>
          )}
        </div>

        <div className="settings-card">
          <h3>Session Details</h3>
          <div className="setting-group">
            <label>Current Task</label>
            <input
              type="text"
              placeholder="What are you working on?"
              value={workName}
              onChange={(e) => setWorkName(e.target.value)}
              className="text-input"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="content-area">
      <div className="content-header">
        <h1>Analytics</h1>
        <p className="content-subtitle">Track your productivity</p>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card">
          <div className="card-header">
            <h3>Today's Stats</h3>
          </div>
          <div className="stats-grid">
            <div className="stat-item">
              <Award className="stat-icon" />
              <div className="stat-data">
                <div className="stat-number">{completedPomodoros}</div>
                <div className="stat-label">Pomodoros</div>
              </div>
            </div>
            <div className="stat-item">
              <Clock className="stat-icon" />
              <div className="stat-data">
                <div className="stat-number">{Math.round(completedPomodoros * 25 / 60)}h</div>
                <div className="stat-label">Focus Time</div>
              </div>
            </div>
            <div className="stat-item">
              <Target className="stat-icon" />
              <div className="stat-data">
                <div className="stat-number">{tasks.filter(t => t.completed).length}</div>
                <div className="stat-label">Tasks Done</div>
              </div>
            </div>
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-header">
            <h3>Recent Sessions</h3>
          </div>
          <div className="sessions-list">
            {sessions.slice(0, 5).map((session) => (
              <div key={session.id} className="session-item">
                <div className="session-icon">
                  <Zap size={16} />
                </div>
                <div className="session-details">
                  <div className="session-name">{session.workName}</div>
                  <div className="session-duration">{Math.floor(session.duration / 60)}m</div>
                </div>
                <div className="session-status completed">✓</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-container">
      {/* Left Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <Coffee size={24} />
            <div className="logo-text">
              <h2>FocusBrew</h2>
              <span>v1.0</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavItem 
            icon={Home} 
            label="Home" 
            tabKey="home"
            isActive={activeTab === 'home'}
            onClick={() => setActiveTab('home')}
          />
          <NavItem 
            icon={Timer} 
            label="Timer" 
            tabKey="timer"
            isActive={activeTab === 'timer'}
            onClick={() => setActiveTab('timer')}
          />
          <NavItem 
            icon={BarChart3} 
            label="Analytics" 
            tabKey="analytics"
            isActive={activeTab === 'analytics'}
            onClick={() => setActiveTab('analytics')}
          />
          <NavItem 
            icon={Settings} 
            label="Settings" 
            tabKey="settings"
            isActive={activeTab === 'settings'}
            onClick={() => setActiveTab('settings')}
          />
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              <User size={20} />
            </div>
            <div className="user-details">
              <div className="user-name">Focus User</div>
              <div className="user-status">Online</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {activeTab === 'home' && renderHomeTab()}
        {activeTab === 'timer' && renderTimerTab()}
        {activeTab === 'settings' && renderSettingsTab()}
        {activeTab === 'analytics' && renderAnalyticsTab()}
      </div>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          background: #f8fafc;
          color: #1e293b;
        }

        .app-container {
          display: flex;
          height: 100vh;
          background: #f8fafc;
        }

        /* Sidebar Styles */
        .sidebar {
          width: 240px;
          background: white;
          border-right: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .sidebar-header {
          padding: 20px;
          border-bottom: 1px solid #e2e8f0;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo svg {
          color: #8b5a3c;
        }

        .logo-text h2 {
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
        }

        .logo-text span {
          font-size: 12px;
          color: #64748b;
        }

        .sidebar-nav {
          flex: 1;
          padding: 16px 12px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 12px 16px;
          margin-bottom: 4px;
          border: none;
          background: transparent;
          border-radius: 8px;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
          font-weight: 500;
        }

        .nav-item:hover {
          background: #f1f5f9;
          color: #334155;
        }

        .nav-item.active {
          background: #fef3ec;
          color: #8b5a3c;
        }

        .sidebar-footer {
          padding: 20px;
          border-top: 1px solid #e2e8f0;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          background: #f1f5f9;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
        }

        .user-name {
          font-size: 14px;
          font-weight: 500;
          color: #1e293b;
        }

        .user-status {
          font-size: 12px;
          color: #10b981;
        }

        /* Main Content Styles */
        .main-content {
          flex: 1;
          overflow: auto;
        }

        .content-area {
          padding: 32px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .content-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
        }

        .content-header h1 {
          font-size: 28px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 4px;
        }

        .content-subtitle {
          color: #64748b;
          font-size: 14px;
        }

        /* Button Styles */
        .btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn.primary {
          background: #8b5a3c;
          color: white;
        }

        .btn.primary:hover {
          background: #7c5131;
        }

        .btn.secondary {
          background: #f1f5f9;
          color: #334155;
        }

        .btn.secondary:hover {
          background: #e2e8f0;
        }

        .btn.tertiary {
          background: transparent;
          color: #64748b;
          border: 1px solid #e2e8f0;
        }

        .btn.tertiary:hover {
          background: #f8fafc;
        }

        /* Add Task Section */
        .add-task-section {
          margin-bottom: 32px;
        }

        .add-task-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          gap: 12px;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }

        .add-task-input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 16px;
          color: #1e293b;
        }

        .add-task-input::placeholder {
          color: #94a3b8;
        }

        .add-task-btn {
          width: 40px;
          height: 40px;
          border: none;
          background: #8b5a3c;
          color: white;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .add-task-btn:hover {
          background: #7c5131;
        }

        /* Tasks Section */
        .tasks-section {
          margin-bottom: 32px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .section-header h2 {
          font-size: 20px;
          font-weight: 600;
          color: #1e293b;
        }

        .task-count {
          background: #f1f5f9;
          color: #64748b;
          padding: 4px 12px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 500;
        }

        .tasks-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .task-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }

        .task-card:hover {
          border-color: #cbd5e1;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .task-card.completed {
          opacity: 0.6;
          background: #f8fafc;
        }

        .task-card.priority-high {
          border-left: 4px solid #ef4444;
        }

        .task-card.priority-medium {
          border-left: 4px solid #f59e0b;
        }

        .task-card.priority-low {
          border-left: 4px solid #10b981;
        }

        .task-main {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .task-checkbox {
          border: none;
          background: transparent;
          cursor: pointer;
          color: #64748b;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .task-card.completed .task-checkbox {
          color: #10b981;
        }

        .task-content {
          flex: 1;
        }

        .task-text {
          font-size: 14px;
          font-weight: 500;
          color: #1e293b;
          margin-bottom: 2px;
        }

        .task-card.completed .task-text {
          text-decoration: line-through;
          color: #64748b;
        }

        .task-time {
          font-size: 12px;
          color: #64748b;
        }

        .task-actions {
          display: flex;
          gap: 4px;
        }

        .task-action-btn {
          width: 32px;
          height: 32px;
          border: none;
          background: transparent;
          color: #64748b;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .task-action-btn:hover {
          background: #f1f5f9;
        }

        .task-action-btn.delete:hover {
          background: #fef2f2;
          color: #ef4444;
        }

        /* Stats Overview */
        .stats-overview {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .stat-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .stat-icon.coffee {
          background: linear-gradient(135deg, #8b5a3c, #a0522d);
        }

        .stat-icon.success {
          background: linear-gradient(135deg, #10b981, #059669);
        }

        .stat-number {
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
          line-height: 1;
        }

        .stat-label {
          font-size: 12px;
          color: #64748b;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-top: 4px;
        }

        /* Timer Content Styles */
        .timer-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 120px);
          text-align: center;
        }

        .timer-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 40px;
        }

        .coffee-animation {
          position: relative;
        }

        .coffee-cup {
          width: 120px;
          height: 140px;
          background: linear-gradient(180deg, #4a4a4a 0%, #2a2a2a 100%);
          border-radius: 0 0 60px 60px;
          position: relative;
          border: 3px solid #666;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .coffee-liquid {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(180deg, #8b5a3c 0%, #654321 100%);
          border-radius: 0 0 57px 57px;
          transition: height 1s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .coffee-surface {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 90%;
          height: 6px;
          background: radial-gradient(ellipse, #a0522d 0%, #8b5a3c 70%);
          border-radius: 50%;
          animation: surfaceRipple 3s ease-in-out infinite;
        }

        @keyframes surfaceRipple {
          0%, 100% { transform: translateX(-50%) scale(1); }
          50% { transform: translateX(-50%) scale(1.1); }
        }

        .coffee-steam {
          position: absolute;
          top: -30px;
          left: 50%;
          transform: translateX(-50%);
          width: 80px;
          height: 40px;
        }

        .steam-particle {
          position: absolute;
          width: 4px;
          height: 20px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, transparent 100%);
          border-radius: 2px;
          animation: steam 2s infinite;
        }

        .steam-0 { left: 20px; animation-delay: 0s; }
        .steam-1 { left: 30px; animation-delay: 0.3s; }
        .steam-2 { left: 40px; animation-delay: 0.6s; }
        .steam-3 { left: 25px; animation-delay: 0.9s; }
        .steam-4 { left: 35px; animation-delay: 1.2s; }
        .steam-5 { left: 45px; animation-delay: 1.5s; }

        @keyframes steam {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-25px) scale(1.5);
          }
        }

        .timer-display {
          position: relative;
        }

        .time-text {
          font-size: 64px;
          font-weight: 300;
          color: #1e293b;
          font-family: -apple-system, BlinkMacSystemFont, 'SF Mono', 'Monaco', monospace;
          margin-bottom: 8px;
        }

        .timer-subtitle {
          font-size: 16px;
          color: #64748b;
          font-weight: 500;
          margin-bottom: 32px;
        }

        .progress-ring {
          position: relative;
          width: 300px;
          height: 300px;
          margin: 0 auto;
        }

        .progress-svg {
          width: 100%;
          height: 100%;
          transform: rotate(-90deg);
        }

        .progress-bg {
          fill: none;
          stroke: #f1f5f9;
          stroke-width: 8;
        }

        .progress-fill {
          fill: none;
          stroke: #8b5a3c;
          stroke-width: 8;
          stroke-linecap: round;
          transition: stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .progress-value {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 18px;
          font-weight: 600;
          color: #8b5a3c;
        }

        .timer-controls {
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .control-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 16px 24px;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .control-btn.large {
          padding: 20px 32px;
          font-size: 18px;
        }

        .control-btn.primary {
          background: #8b5a3c;
          color: white;
        }

        .control-btn.primary:hover {
          background: #7c5131;
          transform: translateY(-2px);
        }

        .control-btn.secondary {
          background: #ef4444;
          color: white;
        }

        .control-btn.secondary:hover {
          background: #dc2626;
          transform: translateY(-2px);
        }

        .control-btn.tertiary {
          background: #f1f5f9;
          color: #64748b;
        }

        .control-btn.tertiary:hover {
          background: #e2e8f0;
        }

        .current-session {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }

        .current-session h3 {
          font-size: 14px;
          color: #8b5a3c;
          font-weight: 600;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .current-session p {
          font-size: 18px;
          color: #1e293b;
          font-weight: 500;
        }

        /* Settings Styles */
        .settings-sections {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .settings-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }

        .settings-card h3 {
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 20px;
        }

        .setting-group {
          margin-bottom: 20px;
        }

        .setting-group:last-child {
          margin-bottom: 0;
        }

        .setting-group label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 8px;
        }

        .input-group {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .number-input,
        .text-input {
          flex: 1;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          color: #1e293b;
          transition: border-color 0.2s ease;
        }

        .number-input:focus,
        .text-input:focus {
          outline: none;
          border-color: #8b5a3c;
        }

        .toggle-setting {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .setting-description {
          font-size: 12px;
          color: #64748b;
          margin-top: 2px;
        }

        .toggle {
          width: 48px;
          height: 28px;
          background: #e2e8f0;
          border-radius: 14px;
          border: none;
          cursor: pointer;
          position: relative;
          transition: background-color 0.2s ease;
        }

        .toggle.active {
          background: #8b5a3c;
        }

        .toggle-slider {
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 10px;
          position: absolute;
          top: 4px;
          left: 4px;
          transition: transform 0.2s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }

        .toggle.active .toggle-slider {
          transform: translateX(20px);
        }

        .setting-hint {
          font-size: 12px;
          color: #64748b;
          margin-top: 4px;
        }

        /* Analytics Styles */
        .analytics-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .analytics-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }

        .card-header {
          margin-bottom: 20px;
        }

        .card-header h3 {
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 16px;
          background: #f8fafc;
          border-radius: 8px;
        }

        .stat-item .stat-icon {
          width: 32px;
          height: 32px;
          margin-bottom: 8px;
          color: #8b5a3c;
        }

        .stat-data .stat-number {
          font-size: 20px;
          font-weight: 700;
          color: #1e293b;
        }

        .stat-data .stat-label {
          font-size: 12px;
          color: #64748b;
          margin-top: 2px;
        }

        .sessions-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .session-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #f8fafc;
          border-radius: 8px;
          transition: background-color 0.2s ease;
        }

        .session-item:hover {
          background: #f1f5f9;
        }

        .session-icon {
          width: 32px;
          height: 32px;
          background: #8b5a3c;
          color: white;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .session-details {
          flex: 1;
        }

        .session-name {
          font-size: 14px;
          font-weight: 500;
          color: #1e293b;
        }

        .session-duration {
          font-size: 12px;
          color: #64748b;
        }

        .session-status {
          color: #10b981;
          font-size: 16px;
        }

        /* Lock Screen Styles */
        .lock-screen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .lock-content {
          text-align: center;
          color: white;
          max-width: 400px;
          padding: 40px;
        }

        .lock-icon {
          margin-bottom: 24px;
          color: #8b5a3c;
        }

        .lock-content h1 {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .lock-content p {
          font-size: 16px;
          color: #cbd5e1;
          margin-bottom: 32px;
        }

        .lock-timer {
          font-size: 48px;
          font-weight: 300;
          font-family: -apple-system, BlinkMacSystemFont, 'SF Mono', monospace;
          margin-bottom: 24px;
          color: #8b5a3c;
        }

        .lock-progress {
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 32px;
        }

        .lock-progress-bar {
          height: 100%;
          background: #8b5a3c;
          border-radius: 4px;
          transition: width 1s ease;
        }

        .emergency-unlock {
          background: transparent;
          color: #cbd5e1;
          border: 1px solid rgba(255, 255, 255, 0.3);
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .emergency-unlock:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        /* Unlock Modal Styles */
        .unlock-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1001;
        }

        .unlock-modal {
          background: white;
          border-radius: 16px;
          padding: 40px;
          max-width: 400px;
          width: 90%;
          text-align: center;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .unlock-icon {
          color: #10b981;
          margin-bottom: 24px;
        }

        .unlock-modal h2 {
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 8px;
        }

        .unlock-modal p {
          color: #64748b;
          margin-bottom: 24px;
        }

        .unlock-input {
          width: 100%;
          padding: 16px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 16px;
          text-align: center;
          margin-bottom: 24px;
        }

        .unlock-input:focus {
          outline: none;
          border-color: #8b5a3c;
        }

        .unlock-buttons {
          display: flex;
          gap: 12px;
        }

        .unlock-btn {
          flex: 1;
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .unlock-btn.primary {
          background: #8b5a3c;
          color: white;
        }

        .unlock-btn.primary:hover {
          background: #7c5131;
        }

        .unlock-btn.secondary {
          background: #f1f5f9;
          color: #64748b;
        }

        .unlock-btn.secondary:hover {
          background: #e2e8f0;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .sidebar {
            width: 60px;
          }

          .sidebar-header,
          .sidebar-footer {
            padding: 16px 12px;
          }

          .logo-text,
          .nav-item span,
          .user-details {
            display: none;
          }

          .content-area {
            padding: 20px;
          }

          .content-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .analytics-grid {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .time-text {
            font-size: 48px;
          }

          .progress-ring {
            width: 250px;
            height: 250px;
          }

          .timer-controls {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default App;