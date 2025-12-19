import { useState, useEffect } from 'react';
import './App.css';

const API_BASE = 'http://localhost:5000';

function App() {
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [currentMessage, setCurrentMessage] = useState('');
  const [showAdmin, setShowAdmin] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API_BASE}/messages`);
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/users`);
      const data = await res.json();
      setUsersList(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentUser(data.username);
        setCurrentUserId(data.id);
        setIsAdmin(data.username === 'xiaoming' && loginPassword === '123');
        setShowLogin(false);
        setLoginUsername('');
        setLoginPassword('');
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Login failed');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: registerUsername, password: registerPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentUser(data.username);
        setCurrentUserId(data.id);
        setIsAdmin(false);
        setShowRegister(false);
        setRegisterUsername('');
        setRegisterPassword('');
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Registration failed');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentUserId(null);
    setIsAdmin(false);
    setShowHistory(false);
    setShowAdmin(false);
  };

  const handleSubmitMessage = async (e) => {
    e.preventDefault();
    if (currentMessage.trim()) {
      try {
        const res = await fetch(`${API_BASE}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: currentMessage, userId: currentUserId }),
        });
        if (res.ok) {
          setCurrentMessage('');
          fetchMessages();
          setShowHistory(true);
        }
      } catch (err) {
        alert('Failed to submit message');
      }
    }
  };

  const deleteMessage = async (id) => {
    if (isAdmin) {
      try {
        await fetch(`${API_BASE}/messages/${id}`, { method: 'DELETE' });
        fetchMessages();
      } catch (err) {
        alert('Failed to delete message');
      }
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditUsername(user.username);
    setEditPassword('');
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: editUsername, password: editPassword }),
      });
      if (res.ok) {
        alert('用户信息更新成功');
        setEditingUser(null);
        setEditUsername('');
        setEditPassword('');
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || '更新失败');
      }
    } catch (err) {
      alert('更新失败');
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('确定要删除这个用户吗？')) {
      try {
        await fetch(`${API_BASE}/users/${id}`, { method: 'DELETE' });
        alert('用户删除成功');
        fetchUsers();
      } catch (err) {
        alert('删除失败');
      }
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>小明的个人简介</h1>
        {currentUser && (
          <div className="user-info">
            <span>欢迎，{currentUser}</span>
            <button onClick={handleLogout}>登出</button>
          </div>
        )}
      </header>
      <div className="main">
        {currentUser && (
          <aside className="sidebar">
            <nav>
              <ul>
                <li><button onClick={() => { setShowLogin(false); setShowRegister(false); setShowHistory(false); setShowAdmin(false); }}>首页</button></li>
                <li><button onClick={() => { setShowHistory(true); setShowAdmin(false); }}>留言历史</button></li>
                {isAdmin && <li><button onClick={() => { fetchUsers(); setShowAdmin(true); setShowHistory(false); }}>管理员面板</button></li>}
              </ul>
            </nav>
          </aside>
        )}
        <main className="content">
          <div className="content-inner">
          {showLogin ? (
            <div className="page">
              <h2>登录</h2>
              <form onSubmit={handleLogin}>
                <input
                  type="text"
                  placeholder="用户名"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="密码"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
                <button type="submit">登录</button>
                <button type="button" onClick={() => setShowLogin(false)}>取消</button>
              </form>
            </div>
          ) : showRegister ? (
            <div className="page">
              <div className="register-card">
                <h2>注册新用户</h2>
                <form onSubmit={handleRegister}>
                  <input
                    type="text"
                    placeholder="用户名"
                    value={registerUsername}
                    onChange={(e) => setRegisterUsername(e.target.value)}
                    required
                  />
                  <input
                    type="password"
                    placeholder="密码"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                  />
                  <div className="form-buttons">
                    <button type="submit">注册</button>
                    <button type="button" onClick={() => setShowRegister(false)}>取消</button>
                  </div>
                </form>
              </div>
            </div>
          ) : showHistory ? (
            <div className="page">
              <h2>留言历史</h2>
              <ul>
                {messages.map((msg) => (
                  <li key={msg.id}>
                    {msg.text} - {msg.username}
                    {isAdmin && <button onClick={() => deleteMessage(msg.id)}>删除</button>}
                  </li>
                ))}
              </ul>
            </div>
          ) : showAdmin ? (
            <div className="page">
              <h2>管理员面板</h2>
              {editingUser ? (
                <div className="edit-form">
                  <h3>编辑用户信息</h3>
                  <form onSubmit={handleUpdateUser}>
                    <input
                      type="text"
                      placeholder="用户名"
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      required
                    />
                    <input
                      type="password"
                      placeholder="新密码（留空则不修改）"
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                    />
                    <button type="submit">保存</button>
                    <button type="button" onClick={() => { setEditingUser(null); setEditUsername(''); setEditPassword(''); }}>取消</button>
                  </form>
                </div>
              ) : (
                <div className="user-grid">
                  {usersList.map((user) => (
                    <div key={user.id} className="user-card">
                      <h3>{user.username}</h3>
                      <p>ID: {user.id}</p>
                      <div className="user-actions">
                        <button onClick={() => handleEditUser(user)}>编辑</button>
                        {user.username !== 'xiaoming' && (
                          <button onClick={() => handleDeleteUser(user.id)} className="delete-btn">删除</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="page">
              {currentUser ? (
                <div>
                  <h2>个人简介</h2>
                  <p>你好，我是小明。我是一名[职业]，热爱编程和前端开发。</p>
                  <p>我的兴趣包括阅读、旅行和学习新技术。</p>
                  <p>欢迎访问我的网站！</p>
                  <form onSubmit={handleSubmitMessage}>
                    <input
                      type="text"
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      placeholder="请输入留言"
                      required
                    />
                    <button type="submit">提交留言</button>
                  </form>
                </div>
              ) : (
                <div className="login-container">
                  <h2>欢迎来到小明的个人简介</h2>
                  <form onSubmit={handleLogin}>
                    <input
                      type="text"
                      placeholder="用户名"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      required
                    />
                    <input
                      type="password"
                      placeholder="密码"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                    <button type="submit">登录</button>
                  </form>
                  <button onClick={() => setShowRegister(true)}>注册新用户</button>
                </div>
              )}
            </div>
          )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
