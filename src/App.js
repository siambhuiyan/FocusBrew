import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, Square, Settings, Coffee, Maximize, Minimize2, Eye,
  Clock, BarChart3, User, Home, Volume2, VolumeX, RotateCcw,
  TrendingUp, Calendar, Target, Award, Zap, Timer
} from 'lucide-react';
import './App.css';

const App = () => {
  // Timer states
  const [time, setTime] = useState(25 * 60);
  const [initialTime, setInitialTime] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  
  // UI states
  const [activeTab, setActiveTab] = useState('timer');
  const [showVideo, setShowVideo] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isOverlay, setIsOverlay] = useState(false);
  
  // Session states
  const [workName, setWorkName] = useState('');
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState('');
  const [customMinutes, setCustomMinutes] = useState(25);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [sessions, setSessions] = useState([]);
  
  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Check if running in overlay mode
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setIsOverlay(urlParams.get('overlay') === 'true');
  }, []);

  // Load saved data
  useEffect(() => {
    if (window.electronAPI) {
      loadSavedData();
    }
  }, []);

  // Animated background effect
  useEffect(() => {
    if (!youtubeUrl && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      let animationId;
      
      const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
      
      const particles = [];
      for (let i = 0; i < 100; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.2
        });
      }
      
      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Gradient background
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#1a1a1a');
        gradient.addColorStop(0.3, '#2d2d2d');
        gradient.addColorStop(0.7, '#1f1f1f');
        gradient.addColorStop(1, '#0a0a0a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Animate particles
        particles.forEach(particle => {
          particle.x += particle.vx;
          particle.y += particle.vy;
          
          if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
          if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
          
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(139, 69, 19, ${particle.opacity})`;
          ctx.fill();
        });
        
        // Coffee-themed floating elements
        const time = Date.now() * 0.001;
        for (let i = 0; i < 5; i++) {
          const x = Math.sin(time + i) * 100 + canvas.width / 2;
          const y = Math.cos(time + i * 0.7) * 50 + canvas.height / 2;
          const size = Math.sin(time + i * 0.3) * 10 + 20;
          
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(210, 105, 30, ${0.1 + Math.sin(time + i) * 0.05})`;
          ctx.fill();
        }
        
        animationId = requestAnimationFrame(animate);
      };
      
      animate();
      
      return () => {
        cancelAnimationFrame(animationId);
        window.removeEventListener('resize', resizeCanvas);
      };
    }
  }, [youtubeUrl]);

  const loadSavedData = async () => {
    try {
      const savedSessions = await window.electronAPI.getStoreValue('sessions') || [];
      setSessions(savedSessions);
      
      const savedSettings = await window.electronAPI.getStoreValue('settings') || {};
      if (savedSettings.customMinutes) setCustomMinutes(savedSettings.customMinutes);
      if (savedSettings.youtubeUrl) setYoutubeUrl(savedSettings.youtubeUrl);
      if (savedSettings.completedPomodoros) setCompletedPomodoros(savedSettings.completedPomodoros);
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  };

  // Timer logic
  useEffect(() => {
    let interval = null;
    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime(time => time - 1);
      }, 1000);
    } else if (time === 0) {
      handleTimerComplete();
    }
    return () => clearInterval(interval);
  }, [isRunning, time]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    const newCount = completedPomodoros + 1;
    setCompletedPomodoros(newCount);
    
    if (Notification.permission === 'granted') {
      new Notification('🎉 FocusBrew Timer Complete!', {
        body: `${workName || 'Work session'} completed! You've finished ${newCount} pomodoros today.`,
        icon: '/icon.png'
      });
    }
    
    saveSession();
    
    if (window.electronAPI) {
      window.electronAPI.setStoreValue('settings', {
        ...{ customMinutes, youtubeUrl },
        completedPomodoros: newCount
      });
    }
  };

  const saveSession = async () => {
    const session = {
      id: Date.now(),
      workName: workName || 'Unnamed Session',
      tags: [...tags],
      duration: initialTime,
      completedAt: new Date().toISOString(),
      completed: time === 0,
      date: new Date().toDateString()
    };

    const updatedSessions = [session, ...sessions];
    setSessions(updatedSessions);
    
    if (window.electronAPI) {
      await window.electronAPI.setStoreValue('sessions', updatedSessions);
    }
  };

  const startTimer = () => {
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
    setIsRunning(true);
  };

  const pauseTimer = () => setIsRunning(false);
  const resetTimer = () => {
    setIsRunning(false);
    setTime(initialTime);
  };

  const setCustomTime = () => {
    const newTime = customMinutes * 60;
    setTime(newTime);
    setInitialTime(newTime);
    
    if (window.electronAPI) {
      window.electronAPI.setStoreValue('settings', {
        customMinutes,
        youtubeUrl,
        completedPomodoros
      });
    }
  };

  const addTag = () => {
    if (currentTag && !tags.includes(currentTag)) {
      setTags([...tags, currentTag]);
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return '';
    const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&mute=${isMuted ? 1 : 0}&loop=1&playlist=${videoId}`;
  };

  const progress = ((initialTime - time) / initialTime) * 100;
  const coffeeLevel = Math.max(10, 100 - progress);

  // Analytics calculations
  const todaySessions = sessions.filter(s => s.date === new Date().toDateString());
  const weekSessions = sessions.filter(s => {
    const sessionDate = new Date(s.completedAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return sessionDate >= weekAgo;
  });
  const totalFocusTime = sessions.reduce((total, session) => total + (session.completed ? session.duration : 0), 0);
  const averageSessionLength = sessions.length > 0 ? Math.round(totalFocusTime / sessions.length / 60) : 0;

  if (isOverlay) {
    return (
      <div className="overlay-container">
        <div className="overlay-header">
          <Coffee className="overlay-icon" />
          <span className="overlay-title">FocusBrew</span>
        </div>
        <div className="overlay-timer">{formatTime(time)}</div>
        <div className="overlay-coffee">
          <div 
            className="overlay-coffee-fill" 
            style={{ height: `${coffeeLevel}%` }}
          ></div>
        </div>
        <div className="overlay-controls">
          {!isRunning ? (
            <button onClick={startTimer} className="overlay-btn">
              <Play size={16} />
            </button>
          ) : (
            <button onClick={pauseTimer} className="overlay-btn">
              <Pause size={16} />
            </button>
          )}
          <button onClick={resetTimer} className="overlay-btn">
            <Square size={16} />
          </button>
        </div>
      </div>
    );
  }

  const renderTimerTab = () => (
    <div className="timer-container">
      {/* Background */}
      <div className="timer-background">
        {youtubeUrl ? (
          <div className="video-background">
            <iframe
              src={getYouTubeEmbedUrl(youtubeUrl)}
              title="Background Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="background-video"
            ></iframe>
            <div className="video-overlay"></div>
          </div>
        ) : (
          <canvas ref={canvasRef} className="animated-background"></canvas>
        )}
      </div>

      {/* Timer Content */}
      <div className="timer-content">
        <div className="timer-display-container">
          {/* 3D Coffee Cup */}
          <div className="coffee-3d-container">
            <div className="coffee-cup-3d">
              <div className="cup-body">
                <div className="coffee-liquid-3d" style={{ height: `${coffeeLevel}%` }}>
                  <div className="coffee-surface"></div>
                </div>
                <div className="cup-handle"></div>
              </div>
              <div className="coffee-steam-3d">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className={`steam-particle-3d steam-${i}`}></div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Timer Display */}
          <div className="timer-display-3d">
            <div className="time-text-3d">{formatTime(time)}</div>
            <div className="timer-subtitle">
              {isRunning ? 'Focus Time' : 'Ready to Focus'}
            </div>
            
            {/* 3D Progress Ring */}
            <div className="progress-ring-3d">
              <svg className="progress-svg-3d" viewBox="0 0 200 200">
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8B4513" />
                    <stop offset="50%" stopColor="#D2691E" />
                    <stop offset="100%" stopColor="#FF8C00" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <circle
                  cx="100"
                  cy="100"
                  r="85"
                  className="progress-bg-3d"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="85"
                  className="progress-fill-3d"
                  style={{
                    strokeDasharray: `${2 * Math.PI * 85}`,
                    strokeDashoffset: `${2 * Math.PI * 85 * (1 - progress / 100)}`,
                    stroke: 'url(#progressGradient)',
                    filter: 'url(#glow)'
                  }}
                />
              </svg>
              <div className="progress-percentage">{Math.round(progress)}%</div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="timer-controls-3d">
            {!isRunning ? (
              <button onClick={startTimer} className="control-btn-3d primary">
                <Play size={24} />
                <span>Start Focus</span>
                <div className="btn-shine"></div>
              </button>
            ) : (
              <button onClick={pauseTimer} className="control-btn-3d secondary">
                <Pause size={24} />
                <span>Pause</span>
                <div className="btn-shine"></div>
              </button>
            )}
            <button onClick={resetTimer} className="control-btn-3d tertiary">
              <RotateCcw size={24} />
              <span>Reset</span>
              <div className="btn-shine"></div>
            </button>
          </div>

          {/* Session Info */}
          {workName && (
            <div className="current-session-display">
              <h3>Current Session</h3>
              <p>{workName}</p>
              {tags.length > 0 && (
                <div className="session-tags-display">
                  {tags.map((tag, i) => (
                    <span key={i} className="tag-display">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Media Controls */}
        {youtubeUrl && (
          <div className="media-controls">
            <button 
              onClick={() => setIsMuted(!isMuted)} 
              className="media-btn"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="settings-container">
      <div className="settings-grid">
        <div className="settings-card">
          <h3><Timer size={20} /> Timer Settings</h3>
          <div className="setting-group">
            <label>Custom Timer Duration (minutes):</label>
            <div className="time-setter">
              <input
                type="number"
                min="1"
                max="120"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(parseInt(e.target.value))}
                className="time-input-3d"
              />
              <button onClick={setCustomTime} className="set-time-btn-3d">
                Set Timer
              </button>
            </div>
          </div>
        </div>

        <div className="settings-card">
          <h3><User size={20} /> Session Details</h3>
          <div className="setting-group">
            <label>What are you working on?</label>
            <input
              type="text"
              placeholder="Enter your current task..."
              value={workName}
              onChange={(e) => setWorkName(e.target.value)}
              className="work-input-3d"
            />
          </div>
          
          <div className="setting-group">
            <label>Add Tags:</label>
            <div className="tag-input-container">
              <input
                type="text"
                placeholder="Add a tag..."
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                className="tag-input-3d"
              />
              <button onClick={addTag} className="add-tag-btn-3d">+</button>
            </div>
            <div className="tags-list-3d">
              {tags.map((tag, index) => (
                <span key={index} className="tag-3d">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="remove-tag-3d">×</button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="settings-card">
          <h3><Volume2 size={20} /> Background Music</h3>
          <div className="setting-group">
            <label>YouTube Music URL:</label>
            <input
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              className="url-input-3d"
            />
            <small>Paste a YouTube link for background focus music</small>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="analytics-container">
      <div className="analytics-grid">
        {/* Stats Cards */}
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon">
              <Award size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-number">{completedPomodoros}</div>
              <div className="stat-label">Today's Pomodoros</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Clock size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-number">{Math.round(totalFocusTime / 3600)}h</div>
              <div className="stat-label">Total Focus Time</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-number">{averageSessionLength}m</div>
              <div className="stat-label">Avg Session</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Target size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-number">{sessions.filter(s => s.completed).length}</div>
              <div className="stat-label">Completed Sessions</div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="charts-section">
          <div className="chart-card">
            <h3>Weekly Progress</h3>
            <div className="progress-chart">
              {[...Array(7)].map((_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (6 - i));
                const dayName = date.toLocaleDateString('en', { weekday: 'short' });
                const daySessions = sessions.filter(s => 
                  new Date(s.completedAt).toDateString() === date.toDateString()
                ).length;
                const maxHeight = Math.max(...[...Array(7)].map((_, j) => {
                  const d = new Date();
                  d.setDate(d.getDate() - (6 - j));
                  return sessions.filter(s => 
                    new Date(s.completedAt).toDateString() === d.toDateString()
                  ).length;
                }), 1);
                
                return (
                  <div key={i} className="chart-bar-container">
                    <div 
                      className="chart-bar"
                      style={{ height: `${(daySessions / maxHeight) * 100}%` }}
                    ></div>
                    <div className="chart-label">
                      <div className="chart-day">{dayName}</div>
                      <div className="chart-count">{daySessions}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="chart-card">
            <h3>Focus Categories</h3>
            <div className="category-chart">
              {Object.entries(
                sessions.reduce((acc, session) => {
                  session.tags.forEach(tag => {
                    acc[tag] = (acc[tag] || 0) + 1;
                  });
                  return acc;
                }, {})
              ).slice(0, 5).map(([tag, count], i) => (
                <div key={i} className="category-item">
                  <div className="category-bar">
                    <div 
                      className="category-fill"
                      style={{ width: `${(count / Math.max(...Object.values(sessions.reduce((acc, session) => {
                        session.tags.forEach(tag => {
                          acc[tag] = (acc[tag] || 0) + 1;
                        });
                        return acc;
                      }, {})))) * 100}%` }}
                    ></div>
                  </div>
                  <div className="category-info">
                    <span className="category-name">{tag}</span>
                    <span className="category-count">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="recent-sessions-card">
          <h3>Recent Sessions</h3>
          <div className="sessions-list-3d">
            {sessions.slice(0, 10).map((session) => (
              <div key={session.id} className="session-item-3d">
                <div className="session-icon">
                  {session.completed ? <Zap className="completed" /> : <Clock className="incomplete" />}
                </div>
                <div className="session-details">
                  <div className="session-name">{session.workName}</div>
                  <div className="session-meta">
                    <span className="session-duration">{Math.floor(session.duration / 60)}m</span>
                    <span className="session-date">
                      {new Date(session.completedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="session-tags-3d">
                    {session.tags.map((tag, i) => (
                      <span key={i} className="session-tag-3d">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className={`session-status ${session.completed ? 'completed' : 'incomplete'}`}>
                  {session.completed ? '✓' : '○'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-3d">
      {/* Header */}
      <header className="app-header-3d">
        <div className="logo-section-3d">
          <Coffee className="app-logo-3d" />
          <div className="logo-text">
            <h1>FocusBrew</h1>
            <span className="tagline">Professional Focus Timer</span>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="nav-tabs">
          <button 
            className={`nav-tab ${activeTab === 'timer' ? 'active' : ''}`}
            onClick={() => setActiveTab('timer')}
          >
            <Home size={18} />
            Timer
          </button>
          <button 
            className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={18} />
            Settings
          </button>
          <button 
            className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart3 size={18} />
            Analytics
          </button>
        </nav>

        <div className="header-controls-3d">
          <button onClick={() => window.electronAPI?.showOverlay()} className="header-btn-3d" title="Show Overlay">
            <Eye size={20} />
          </button>
          <button onClick={() => window.electronAPI?.toggleFullscreen()} className="header-btn-3d" title="Toggle Fullscreen">
            <Maximize size={20} />
          </button>
          <button onClick={() => window.electronAPI?.minimizeToTray()} className="header-btn-3d" title="Minimize to Tray">
            <Minimize2 size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content-3d">
        {activeTab === 'timer' && renderTimerTab()}
        {activeTab === 'settings' && renderSettingsTab()}
        {activeTab === 'analytics' && renderAnalyticsTab()}
      </main>
    </div>
  );
};

export default App;