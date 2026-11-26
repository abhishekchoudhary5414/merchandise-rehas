'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import DevicesOutlinedIcon from '@mui/icons-material/DevicesOutlined';
import SecurityIcon from '@mui/icons-material/Security';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import RefreshIcon from '@mui/icons-material/Refresh';
import siteConfig from '@/data/site-config.json';
import styles from './AccountSection.module.css';

interface AuthSessionItem {
  id: string;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

interface AccountSectionProps {
  onActivity?: (title: string, description: string, type: 'security' | 'system') => void;
}

type AccountTab = 'profile' | 'password' | 'sessions';

export default function AccountSection({ onActivity }: AccountSectionProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AccountTab>('profile');
  const [loggingOutId, setLoggingOutId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<AuthSessionItem[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  async function fetchSessions() {
    setLoadingSessions(true);
    try {
      const res = await fetch('/api/admin/sessions');
      if (res.ok) {
        const data = await res.json();
        if (data.sessions) setSessions(data.sessions);
      }
    } catch (e) {
      console.error('Error fetching sessions:', e);
    } finally {
      setLoadingSessions(false);
    }
  }

  useEffect(() => {
    fetchSessions();
  }, []);

  async function handleRevokeSession(session: AuthSessionItem) {
    setLoggingOutId(session.id);
    try {
      const res = await fetch('/api/admin/sessions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.id }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.isCurrent) {
          router.push('/admin/login');
          router.refresh();
          return;
        }
        setSessions((prev) => prev.filter((s) => s.id !== session.id));
        if (onActivity) {
          onActivity('Session Revoked', 'Revoked another active browser session.', 'security');
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoggingOutId(null);
    }
  }

  // Profile state
  const [name, setName] = useState('REHAS Admin');
  const [email] = useState(siteConfig.contact.email);
  const [phone, setPhone] = useState('+91 98765 43210');
  const [role] = useState('Super Admin');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);

  function getStrength(pwd: string) {
    if (!pwd) return { label: '', width: '0%', color: 'transparent' };
    if (pwd.length < 6) return { label: 'Weak', width: '30%', color: 'var(--danger)' };
    if (pwd.length >= 10 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) {
      return { label: 'Strong', width: '100%', color: 'var(--success)' };
    }
    return { label: 'Medium', width: '65%', color: 'var(--warning)' };
  }

  const strength = getStrength(newPassword);

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);
    setTimeout(() => {
      setSavingProfile(false);
      setProfileMsg('Profile details saved.');
      if (onActivity) {
        onActivity('Account Profile Updated', `Updated profile for ${name}.`, 'security');
      }
    }, 300);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwdError(null);
    setPwdSuccess(null);

    if (newPassword !== confirmPassword) {
      setPwdError('New password and confirmation do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPwdError('New password must be at least 6 characters long.');
      return;
    }

    setChangingPwd(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password');

      setPwdSuccess(data.message || 'Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      if (onActivity) {
        onActivity('Admin Password Changed', 'Password updated via Account Settings.', 'security');
      }
    } catch (err: any) {
      setPwdError(err.message || 'Unable to change password.');
    } finally {
      setChangingPwd(false);
    }
  }

  return (
    <div className={styles.layout}>
      {/* Left Navigation Rail */}
      <aside className={styles.sideCard}>
        <div className={styles.identityBox}>
          <div className={styles.avatar}>{name.charAt(0).toUpperCase()}</div>
          <h2 className={styles.userName}>{name}</h2>
          <p className={styles.userEmail}>{email}</p>
          <span className={styles.roleBadge}>
            <SecurityIcon fontSize="inherit" />
            {role}
          </span>
        </div>

        <nav className={styles.navMenu}>
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`${styles.navItem} ${activeTab === 'profile' ? styles.navItemActive : ''}`}
          >
            <PersonOutlinedIcon fontSize="small" />
            <span>Profile Details</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('password')}
            className={`${styles.navItem} ${activeTab === 'password' ? styles.navItemActive : ''}`}
          >
            <LockOutlinedIcon fontSize="small" />
            <span>Change Password</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sessions')}
            className={`${styles.navItem} ${activeTab === 'sessions' ? styles.navItemActive : ''}`}
          >
            <DevicesOutlinedIcon fontSize="small" />
            <span>Session &amp; Security</span>
          </button>
        </nav>
      </aside>

      {/* Right Content Panel */}
      <section className={styles.mainCard}>
        {activeTab === 'profile' && (
          <>
            <div className={styles.panelHeader}>
              <div>
                <h3 className={styles.panelTitle}>Profile Details</h3>
                <p className={styles.panelSub}>Manage your REHAS Merchandise administrator identity.</p>
              </div>
              <span className={styles.statusPill}>
                <VerifiedUserOutlinedIcon fontSize="inherit" />
                Verified Admin
              </span>
            </div>

            {profileMsg && <div className={styles.alertSuccess}>{profileMsg}</div>}

            <form onSubmit={handleSaveProfile}>
              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={styles.input}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Contact Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={styles.input}
                  />
                </div>

                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                  <label className={styles.label}>Primary Email Address</label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className={styles.input}
                    style={{ opacity: 0.7, cursor: 'not-allowed' }}
                  />
                </div>
              </div>

              <div className={styles.actionsRow}>
                <button type="submit" disabled={savingProfile} className={styles.primaryBtn}>
                  <SaveOutlinedIcon fontSize="small" />
                  <span>{savingProfile ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </>
        )}

        {activeTab === 'password' && (
          <>
            <div className={styles.panelHeader}>
              <div>
                <h3 className={styles.panelTitle}>Change Password</h3>
                <p className={styles.panelSub}>
                  Update your password. Encrypted with bcrypt in Neon PostgreSQL.
                </p>
              </div>
            </div>

            {pwdError && <div className={styles.alertError}>{pwdError}</div>}
            {pwdSuccess && <div className={styles.alertSuccess}>{pwdSuccess}</div>}

            <form onSubmit={handleChangePassword}>
              <div className={styles.formGrid}>
                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                  <label className={styles.label}>Current Password</label>
                  <div className={styles.inputWrap}>
                    <input
                      type={showCurrent ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className={styles.input}
                      required
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className={styles.eyeBtn}
                      title={showCurrent ? 'Hide password' : 'Show password'}
                    >
                      {showCurrent ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
                    </button>
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>New Password</label>
                  <div className={styles.inputWrap}>
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={styles.input}
                      required
                      placeholder="Minimum 6 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className={styles.eyeBtn}
                      title={showNew ? 'Hide password' : 'Show password'}
                    >
                      {showNew ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
                    </button>
                  </div>
                  {newPassword && (
                    <div className={styles.strengthRow}>
                      <div className={styles.strengthTrack}>
                        <div
                          className={styles.strengthFill}
                          style={{ width: strength.width, backgroundColor: strength.color }}
                        />
                      </div>
                      <span className={styles.strengthLabel} style={{ color: strength.color }}>
                        {strength.label}
                      </span>
                    </div>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={styles.input}
                    required
                    placeholder="Re-enter new password"
                  />
                </div>
              </div>

              <div className={styles.actionsRow}>
                <button type="submit" disabled={changingPwd} className={styles.primaryBtn}>
                  <LockOutlinedIcon fontSize="small" />
                  <span>{changingPwd ? 'Updating...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          </>
        )}

        {activeTab === 'sessions' && (
          <>
            <div className={styles.panelHeader}>
              <div>
                <h3 className={styles.panelTitle}>
                  Session &amp; Security ({sessions.length} Active)
                </h3>
                <p className={styles.panelSub}>
                  All active browser &amp; device sessions stored in Neon PostgreSQL.
                </p>
              </div>
              <button
                type="button"
                onClick={fetchSessions}
                disabled={loadingSessions}
                className={styles.navItem}
                style={{ border: '1px solid var(--border)', padding: '0.4rem 0.8rem' }}
              >
                <RefreshIcon fontSize="small" />
                <span>{loadingSessions ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>

            <div className={styles.sessionList}>
              {sessions.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  {loadingSessions ? 'Loading active sessions...' : 'No active sessions found.'}
                </p>
              ) : (
                sessions.map((s) => (
                  <div key={s.id} className={styles.sessionRow}>
                    <div className={styles.sessionInfo}>
                      <div className={styles.sessionIcon}>
                        <DevicesOutlinedIcon fontSize="small" />
                      </div>
                      <div>
                        <p className={styles.sessionTitle}>
                          {s.isCurrent ? 'Current Browser Session (This Device)' : 'Other Browser / Device Session'}
                        </p>
                        <p className={styles.sessionSub}>
                          Signed in: {new Date(s.createdAt).toLocaleString('en-IN')} · Expires:{' '}
                          {new Date(s.expiresAt).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span className={styles.statusPill}>
                        {s.isCurrent ? 'Current' : 'Active'}
                      </span>
                      <button
                        type="button"
                        disabled={loggingOutId === s.id}
                        onClick={() => handleRevokeSession(s)}
                        className={styles.logoutSessionBtn}
                      >
                        <LogoutIcon fontSize="small" />
                        <span>
                          {loggingOutId === s.id
                            ? 'Ending...'
                            : s.isCurrent
                            ? 'Log Out'
                            : 'Revoke'}
                        </span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
