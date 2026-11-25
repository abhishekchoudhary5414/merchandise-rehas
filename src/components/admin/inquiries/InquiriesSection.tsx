'use client';

import React, { useState, useEffect } from 'react';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import MarkEmailUnreadOutlinedIcon from '@mui/icons-material/MarkEmailUnreadOutlined';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import LinkIcon from '@mui/icons-material/Link';
import ScheduleIcon from '@mui/icons-material/Schedule';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import TableViewOutlinedIcon from '@mui/icons-material/TableViewOutlined';
import TablePagination from '@/components/admin/common/TablePagination';
import { exportToCSV, exportToXLSX } from '@/lib/export-utils';
import styles from './InquiriesSection.module.css';

export default function InquiriesSection() {
  const [activeTab, setActiveTab] = useState<'contact' | 'whatsapp'>('contact');
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [whatsappClicks, setWhatsappClicks] = useState<any[]>([]);
  const [whatsappStats, setWhatsappStats] = useState<any>({ total: 0, today: 0, sources: [] });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read' | 'contacted' | 'interested' | 'replied' | 'spam'>('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);

  // Pagination states using standard TablePagination pattern
  const [contactPage, setContactPage] = useState(1);
  const [contactPageSize, setContactPageSize] = useState<number | 'all'>(10);

  const [whatsappPage, setWhatsappPage] = useState(1);
  const [whatsappPageSize, setWhatsappPageSize] = useState<number | 'all'>(10);

  useEffect(() => {
    setContactPage(1);
    fetchData();
  }, [filter]);

  useEffect(() => {
    setContactPage(1);
  }, [searchFilter]);

  async function fetchData() {
    setLoading(true);
    try {
      const [contactRes, waRes] = await Promise.all([
        fetch(`/api/admin/contact-submissions?filter=${filter}`),
        fetch('/api/admin/whatsapp-analytics'),
      ]);

      if (contactRes.ok) {
        const cData = await contactRes.json();
        setSubmissions(cData.submissions || []);
      }

      if (waRes.ok) {
        const wData = await waRes.json();
        setWhatsappClicks(wData.clicks || []);
        setWhatsappStats(wData.stats || { total: 0, today: 0, sources: [] });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(id: string, newStatus: string) {
    try {
      const res = await fetch('/api/admin/contact-submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        setSubmissions((prev) =>
          prev.map((sub) => (sub.id === id ? { ...sub, status: newStatus } : sub))
        );
        if (selectedSubmission && selectedSubmission.id === id) {
          setSelectedSubmission((prev: any) => ({ ...prev, status: newStatus }));
        }
        showFeedback(`Marked submission as ${newStatus.toLowerCase()}`);
      }
    } catch {
      showFeedback('Failed to update status');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this contact submission?')) return;
    try {
      const res = await fetch(`/api/admin/contact-submissions?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSubmissions((prev) => prev.filter((s) => s.id !== id));
        if (selectedSubmission && selectedSubmission.id === id) {
          setSelectedSubmission(null);
        }
        showFeedback('Submission deleted successfully');
      }
    } catch {
      showFeedback('Failed to delete submission');
    }
  }

  function showFeedback(msg: string) {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(null), 3000);
  }

  function formatDate(dStr: string) {
    try {
      const d = new Date(dStr);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dStr;
    }
  }

  const unreadCount = submissions.filter((s) => s.status === 'UNREAD').length;

  // Filtered submissions
  const filteredSubmissions = submissions.filter((sub) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      sub.name?.toLowerCase().includes(q) ||
      sub.email?.toLowerCase().includes(q) ||
      sub.phone?.includes(q) ||
      sub.subject?.toLowerCase().includes(q) ||
      sub.message?.toLowerCase().includes(q)
    );
  });

  // Contact Export Handlers
  function handleExportContactCSV() {
    const headers = ['Date & Time', 'Sender Name', 'Email', 'Phone', 'Subject', 'Status', 'Message'];
    const rows = filteredSubmissions.map((sub) => [
      formatDate(sub.createdAt),
      sub.name || '',
      sub.email || '',
      sub.phone || '',
      sub.subject || '',
      sub.status || '',
      sub.message || '',
    ]);
    exportToCSV(`REHAS_Inquiries_${filter.toUpperCase()}`, headers, rows);
  }

  function handleExportContactXLSX() {
    const headers = ['Date & Time', 'Sender Name', 'Email', 'Phone', 'Subject', 'Status', 'Message'];
    const rows = filteredSubmissions.map((sub) => [
      formatDate(sub.createdAt),
      sub.name || '',
      sub.email || '',
      sub.phone || '',
      sub.subject || '',
      sub.status || '',
      sub.message || '',
    ]);
    exportToXLSX(`REHAS_Inquiries_${filter.toUpperCase()}`, headers, rows);
  }

  // WhatsApp Export Handlers
  function handleExportWhatsAppCSV() {
    const headers = ['Date & Time', 'Source', 'Product / Context', 'Target Number', 'Page URL', 'Referrer'];
    const rows = whatsappClicks.map((click) => [
      formatDate(click.createdAt),
      click.source || '',
      click.productTitle || click.productId || 'General Inquiry',
      click.phoneNumber || '',
      click.pageUrl || '',
      click.referrer || 'Direct Navigation',
    ]);
    exportToCSV('REHAS_WhatsApp_Click_Logs', headers, rows);
  }

  function handleExportWhatsAppXLSX() {
    const headers = ['Date & Time', 'Source', 'Product / Context', 'Target Number', 'Page URL', 'Referrer'];
    const rows = whatsappClicks.map((click) => [
      formatDate(click.createdAt),
      click.source || '',
      click.productTitle || click.productId || 'General Inquiry',
      click.phoneNumber || '',
      click.pageUrl || '',
      click.referrer || 'Direct Navigation',
    ]);
    exportToXLSX('REHAS_WhatsApp_Click_Logs', headers, rows);
  }

  // Contact Pagination Calculation
  const totalContactItems = filteredSubmissions.length;
  const paginatedSubmissions =
    contactPageSize === 'all'
      ? filteredSubmissions
      : filteredSubmissions.slice((contactPage - 1) * contactPageSize, contactPage * contactPageSize);

  // WhatsApp Pagination Calculation
  const totalWhatsAppItems = whatsappClicks.length;
  const paginatedWhatsAppClicks =
    whatsappPageSize === 'all'
      ? whatsappClicks
      : whatsappClicks.slice((whatsappPage - 1) * whatsappPageSize, whatsappPage * whatsappPageSize);

  return (
    <div className={styles.container}>
      {/* Header bar */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Inquiries & Interaction Tracking</h2>
          <p className={styles.subtitle}>
            Manage incoming contact inquiries and analyze real-time customer WhatsApp engagements.
          </p>
        </div>

        <div className={styles.headerActions}>
          {/* Top CSV & Excel (XLSX) Export Buttons */}
          <div className={styles.exportGroup}>
            <span className={styles.exportGroupLabel}>Export:</span>
            <button
              type="button"
              className={styles.topExportBtn}
              onClick={activeTab === 'contact' ? handleExportContactCSV : handleExportWhatsAppCSV}
              title={
                activeTab === 'contact'
                  ? 'Download Inquiries CSV Spreadsheet'
                  : 'Download WhatsApp Clicks CSV Spreadsheet'
              }
            >
              <FileDownloadOutlinedIcon style={{ fontSize: 16 }} />
              <span>CSV</span>
            </button>
            <button
              type="button"
              className={`${styles.topExportBtn} ${styles.topExportXlsx}`}
              onClick={activeTab === 'contact' ? handleExportContactXLSX : handleExportWhatsAppXLSX}
              title={
                activeTab === 'contact'
                  ? 'Download Inquiries Excel (XLSX) File'
                  : 'Download WhatsApp Clicks Excel (XLSX) File'
              }
            >
              <TableViewOutlinedIcon style={{ fontSize: 16 }} />
              <span>Excel (XLSX)</span>
            </button>
          </div>

          <button className={styles.refreshBtn} onClick={fetchData} title="Refresh data">
            <RefreshIcon />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {actionMsg && <div className={styles.alertBanner}>{actionMsg}</div>}

      {/* Navigation tabs */}
      <div className={styles.tabBar}>
        <button
          className={`${styles.tabBtn} ${activeTab === 'contact' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('contact')}
        >
          <EmailOutlinedIcon fontSize="small" />
          <span>Contact Submissions</span>
          {unreadCount > 0 && <span className={styles.badge}>{unreadCount} new</span>}
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'whatsapp' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('whatsapp')}
        >
          <WhatsAppIcon fontSize="small" />
          <span>WhatsApp Click Track</span>
          <span className={styles.badgeGreen}>{whatsappStats.total} total</span>
        </button>
      </div>

      {activeTab === 'contact' ? (
        /* CONTACT SUBMISSIONS TABULAR VIEW */
        <div className={styles.sectionContent}>
          {/* Controls Bar */}
          <div className={styles.controlsBar}>
            <div className={styles.filterRow}>
              <span className={styles.filterLabel}>Status:</span>
              {(['all', 'unread', 'contacted', 'interested', 'replied', 'read', 'spam'] as const).map((st) => (
                <button
                  key={st}
                  className={`${styles.filterPill} ${filter === st ? styles.filterPillActive : ''}`}
                  onClick={() => setFilter(st)}
                >
                  {st.toUpperCase()}
                </button>
              ))}
            </div>

            <div className={styles.searchBoxWrap}>
              <SearchIcon className={styles.searchBoxIcon} style={{ fontSize: 18 }} />
              <input
                type="text"
                placeholder="Search by name, email, phone, message..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className={styles.searchBoxInput}
              />
              {searchFilter && (
                <button
                  onClick={() => setSearchFilter('')}
                  className={styles.clearSearchBtn}
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {!loading && filteredSubmissions.length === 0 ? (
            <div className={styles.emptyState}>
              <EmailOutlinedIcon style={{ fontSize: 48, color: '#9CA3AF' }} />
              <h3>No Contact Submissions Found</h3>
              <p>Inquiries submitted via the Contact form will appear here in real time.</p>
            </div>
          ) : (
            <div className={styles.tableCard}>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th style={{ width: '130px' }}>Date &amp; Time</th>
                      <th>Sender / Patron</th>
                      <th>Phone</th>
                      <th>Subject</th>
                      <th>Message Snippet</th>
                      <th style={{ width: '125px' }}>Status</th>
                      <th style={{ width: '190px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      // Shimmer Skeleton Rows for Inquiries
                      [1, 2, 3, 4, 5].map((n) => (
                        <tr key={`skel-inq-${n}`}>
                          <td>
                            <div className={`${styles.skelBox} ${styles.skeletonShimmer}`} style={{ width: '110px' }} />
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <div className={`${styles.skelBox} ${styles.skeletonShimmer}`} style={{ width: '140px', height: '14px' }} />
                              <div className={`${styles.skelBox} ${styles.skeletonShimmer}`} style={{ width: '180px', height: '11px' }} />
                            </div>
                          </td>
                          <td>
                            <div className={`${styles.skelBox} ${styles.skeletonShimmer}`} style={{ width: '100px' }} />
                          </td>
                          <td>
                            <div className={`${styles.skelBox} ${styles.skeletonShimmer}`} style={{ width: '120px' }} />
                          </td>
                          <td>
                            <div className={`${styles.skelBox} ${styles.skeletonShimmer}`} style={{ width: '180px' }} />
                          </td>
                          <td>
                            <div className={`${styles.skelPill} ${styles.skeletonShimmer}`} style={{ width: '90px' }} />
                          </td>
                          <td>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                              <div className={`${styles.skelBox} ${styles.skeletonShimmer}`} style={{ width: '28px', height: '28px', borderRadius: '6px' }} />
                              <div className={`${styles.skelBox} ${styles.skeletonShimmer}`} style={{ width: '28px', height: '28px', borderRadius: '6px' }} />
                              <div className={`${styles.skelBox} ${styles.skeletonShimmer}`} style={{ width: '28px', height: '28px', borderRadius: '6px' }} />
                              <div className={`${styles.skelBox} ${styles.skeletonShimmer}`} style={{ width: '28px', height: '28px', borderRadius: '6px' }} />
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      paginatedSubmissions.map((sub) => (
                      <tr
                        key={sub.id}
                        className={sub.status === 'UNREAD' ? styles.rowUnread : ''}
                      >
                        <td>
                          <span className={styles.timeCell}>
                            <ScheduleIcon fontSize="inherit" />
                            {formatDate(sub.createdAt)}
                          </span>
                        </td>
                        <td>
                          <div className={styles.patronCell}>
                            <span className={styles.patronName}>{sub.name}</span>
                            <span className={styles.patronEmail}>{sub.email}</span>
                          </div>
                        </td>
                        <td>
                          {sub.phone ? (
                            <a href={`tel:${sub.phone}`} className={styles.phoneLink}>
                              <PhoneInTalkIcon fontSize="inherit" />
                              {sub.phone}
                            </a>
                          ) : (
                            <span className={styles.dimText}>—</span>
                          )}
                        </td>
                        <td>
                          <span className={styles.subjectText} title={sub.subject || 'Consultation'}>
                            {sub.subject || 'Consultation'}
                          </span>
                        </td>
                        <td>
                          <span className={styles.snippetText} title={sub.message}>
                            {sub.message}
                          </span>
                        </td>
                        <td>
                          <select
                            value={sub.status}
                            onChange={(e) => handleStatusChange(sub.id, e.target.value)}
                            className={`${styles.statusSelect} ${styles['select_' + sub.status.toLowerCase()]}`}
                          >
                            <option value="UNREAD">UNREAD</option>
                            <option value="CONTACTED">CONTACTED</option>
                            <option value="INTERESTED">INTERESTED</option>
                            <option value="REPLIED">REPLIED</option>
                            <option value="READ">READ</option>
                            <option value="SPAM">SPAM</option>
                          </select>
                        </td>
                        <td>
                          <div className={styles.tableActions}>
                            {/* View */}
                            <button
                              className={styles.actionIconBtn}
                              title="View Full Inquiry"
                              onClick={() => {
                                setSelectedSubmission(sub);
                                if (sub.status === 'UNREAD') {
                                  handleStatusChange(sub.id, 'READ');
                                }
                              }}
                            >
                              <VisibilityOutlinedIcon fontSize="small" />
                            </button>

                            {/* Email */}
                            <a
                              href={`mailto:${sub.email}?subject=RE: ${encodeURIComponent(
                                sub.subject || 'REHAS Vedic Consultation'
                              )}`}
                              className={styles.actionIconBtnPrimary}
                              title="Email Customer"
                            >
                              <EmailOutlinedIcon fontSize="small" />
                            </a>

                            {/* WhatsApp */}
                            {sub.phone ? (
                              <a
                                href={`https://wa.me/${sub.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                                  `Pranam ${sub.name}! Greetings from REHAS Sacred Merchandise regarding your inquiry on "${sub.subject || 'sacred crystal bracelets'}". How may we assist your alignment today?`
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                                className={styles.actionIconBtnWhatsApp}
                                title="Chat on WhatsApp"
                              >
                                <WhatsAppIcon fontSize="small" />
                              </a>
                            ) : (
                              <span
                                className={`${styles.actionIconBtn} ${styles.btnDisabled}`}
                                title="No phone provided for WhatsApp"
                              >
                                <WhatsAppIcon fontSize="small" />
                              </span>
                            )}

                            {/* Call */}
                            {sub.phone ? (
                              <a
                                href={`tel:${sub.phone.replace(/\D/g, '')}`}
                                className={styles.actionIconBtnCall}
                                title={`Call ${sub.name}`}
                              >
                                <PhoneInTalkIcon fontSize="small" />
                              </a>
                            ) : (
                              <span
                                className={`${styles.actionIconBtn} ${styles.btnDisabled}`}
                                title="No phone provided for Call"
                              >
                                <PhoneInTalkIcon fontSize="small" />
                              </span>
                            )}

                            {/* Delete */}
                            <button
                              className={styles.actionIconBtnDanger}
                              title="Delete Submission"
                              onClick={() => handleDelete(sub.id)}
                            >
                              <DeleteOutlinedIcon fontSize="small" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                  </tbody>
                </table>
              </div>

              {/* Predefined TablePagination with CSV & Excel (XLSX) Export */}
              <TablePagination
                totalItems={totalContactItems}
                currentPage={contactPage}
                pageSize={contactPageSize}
                onPageChange={setContactPage}
                onPageSizeChange={setContactPageSize}
                onExportCSV={handleExportContactCSV}
                onExportXLSX={handleExportContactXLSX}
              />
            </div>
          )}
        </div>
      ) : (
        /* WHATSAPP CLICK TRACK TABULAR VIEW */
        <div className={styles.sectionContent}>
          {/* Quick Metrics */}
          <div className={styles.statsRow}>
            <div className={styles.statBox}>
              <span className={styles.statValue}>{whatsappStats.total}</span>
              <span className={styles.statLabel}>Total WhatsApp Leads</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statValue} style={{ color: '#16A34A' }}>
                {whatsappStats.today}
              </span>
              <span className={styles.statLabel}>Clicks Today</span>
            </div>
            {whatsappStats.sources?.map((s: any) => (
              <div key={s.source} className={styles.statBox}>
                <span className={styles.statValue}>{s.count}</span>
                <span className={styles.statLabel}>
                  {s.source.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            ))}
          </div>

          <div className={styles.tableCard}>
            <div className={styles.tableHeaderRow}>
              <h3 className={styles.tableTitle}>WhatsApp Click Logs</h3>
              <span className={styles.totalBadge}>{whatsappClicks.length} Recorded Events</span>
            </div>

            {!loading && whatsappClicks.length === 0 ? (
              <div className={styles.emptyState}>
                <WhatsAppIcon style={{ fontSize: 48, color: '#16A34A' }} />
                <h3>No WhatsApp Clicks Recorded Yet</h3>
                <p>When customers click the floating WhatsApp button or footer link, clicks will show here.</p>
              </div>
            ) : (
              <>
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th style={{ width: '150px' }}>Timestamp</th>
                        <th style={{ width: '180px' }}>Button Source</th>
                        <th>Landing Page / URL</th>
                        <th>Referrer Source</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        // Shimmer Skeleton Rows for WhatsApp Clicks
                        [1, 2, 3, 4, 5].map((n) => (
                          <tr key={`skel-wa-${n}`}>
                            <td>
                              <div className={`${styles.skelBox} ${styles.skeletonShimmer}`} style={{ width: '110px' }} />
                            </td>
                            <td>
                              <div className={`${styles.skelPill} ${styles.skeletonShimmer}`} style={{ width: '140px' }} />
                            </td>
                            <td>
                              <div className={`${styles.skelBox} ${styles.skeletonShimmer}`} style={{ width: '220px' }} />
                            </td>
                            <td>
                              <div className={`${styles.skelBox} ${styles.skeletonShimmer}`} style={{ width: '160px' }} />
                            </td>
                          </tr>
                        ))
                      ) : (
                        paginatedWhatsAppClicks.map((click) => (
                        <tr key={click.id}>
                          <td>
                            <span className={styles.timeCell}>
                              <ScheduleIcon fontSize="inherit" />
                              {formatDate(click.createdAt)}
                            </span>
                          </td>
                          <td>
                            <span className={styles.sourceTag}>
                              <WhatsAppIcon fontSize="inherit" style={{ marginRight: 5 }} />
                              {click.source === 'floating_button'
                                ? 'Bottom Floating Button'
                                : click.source === 'footer_link'
                                ? 'Footer Direct Link'
                                : click.source}
                            </span>
                          </td>
                          <td className={styles.urlCell}>
                            {click.pageUrl ? (
                              <a
                                href={click.pageUrl}
                                target="_blank"
                                rel="noreferrer"
                                className={styles.urlLink}
                                title={click.pageUrl}
                              >
                                <LinkIcon fontSize="inherit" style={{ marginRight: 4 }} />
                                {click.pageUrl}
                              </a>
                            ) : (
                              <span className={styles.dimText}>Direct / Undefined</span>
                            )}
                          </td>
                          <td className={styles.urlCell}>
                            {click.referrer ? (
                              <span title={click.referrer} className={styles.referrerText}>
                                {click.referrer}
                              </span>
                            ) : (
                              <span className={styles.dimText}>Direct Navigation (No Referrer)</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                    </tbody>
                  </table>
                </div>

                {/* Predefined TablePagination with CSV & Excel (XLSX) Export */}
                <TablePagination
                  totalItems={totalWhatsAppItems}
                  currentPage={whatsappPage}
                  pageSize={whatsappPageSize}
                  onPageChange={setWhatsappPage}
                  onPageSizeChange={setWhatsappPageSize}
                  onExportCSV={handleExportWhatsAppCSV}
                  onExportXLSX={handleExportWhatsAppXLSX}
                />
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal to view full submission */}
      {selectedSubmission && (
        <div className={styles.modalOverlay} onClick={() => setSelectedSubmission(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>Inquiry from {selectedSubmission.name}</h3>
                <span className={styles.modalSub}>{formatDate(selectedSubmission.createdAt)}</span>
              </div>
              <button
                className={styles.modalCloseBtn}
                onClick={() => setSelectedSubmission(null)}
              >
                <CloseIcon />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.modalDetailGrid}>
                <div className={styles.modalField}>
                  <label>Full Name</label>
                  <span>{selectedSubmission.name}</span>
                </div>
                <div className={styles.modalField}>
                  <label>Email Address</label>
                  <a href={`mailto:${selectedSubmission.email}`} className={styles.modalLink}>
                    {selectedSubmission.email}
                  </a>
                </div>
                <div className={styles.modalField}>
                  <label>Mobile Number</label>
                  {selectedSubmission.phone ? (
                    <a href={`tel:${selectedSubmission.phone}`} className={styles.modalLink}>
                      {selectedSubmission.phone}
                    </a>
                  ) : (
                    <span>Not provided</span>
                  )}
                </div>
                <div className={styles.modalField}>
                  <label>Status</label>
                  <select
                    value={selectedSubmission.status}
                    onChange={(e) => handleStatusChange(selectedSubmission.id, e.target.value)}
                    className={`${styles.statusSelect} ${styles['select_' + selectedSubmission.status.toLowerCase()]}`}
                  >
                    <option value="UNREAD">UNREAD</option>
                    <option value="CONTACTED">CONTACTED</option>
                    <option value="INTERESTED">INTERESTED</option>
                    <option value="REPLIED">REPLIED</option>
                    <option value="READ">READ</option>
                    <option value="SPAM">SPAM</option>
                  </select>
                </div>
              </div>

              {selectedSubmission.subject && (
                <div className={styles.modalField}>
                  <label>Subject</label>
                  <span className={styles.modalSubject}>{selectedSubmission.subject}</span>
                </div>
              )}

              <div className={styles.modalField}>
                <label>Inquiry Message</label>
                <div className={styles.modalMessageBox}>{selectedSubmission.message}</div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <div className={styles.modalActionGroup}>
                <a
                  href={`mailto:${selectedSubmission.email}?subject=RE: ${encodeURIComponent(
                    selectedSubmission.subject || 'REHAS Vedic Consultation'
                  )}`}
                  className={styles.replyEmailBtn}
                >
                  <EmailOutlinedIcon fontSize="small" />
                  <span>Email</span>
                </a>
                {selectedSubmission.phone && (
                  <a
                    href={`https://wa.me/${selectedSubmission.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                      `Pranam ${selectedSubmission.name}! Greetings from REHAS Sacred Merchandise regarding your inquiry on "${selectedSubmission.subject || 'sacred crystal bracelets'}".`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.replyWhatsAppBtn}
                  >
                    <WhatsAppIcon fontSize="small" />
                    <span>WhatsApp</span>
                  </a>
                )}
                {selectedSubmission.phone && (
                  <a
                    href={`tel:${selectedSubmission.phone.replace(/\D/g, '')}`}
                    className={styles.replyCallBtn}
                  >
                    <PhoneInTalkIcon fontSize="small" />
                    <span>Call</span>
                  </a>
                )}
              </div>

              <div className={styles.modalActionGroup}>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(selectedSubmission.id)}
                  title="Delete"
                >
                  <DeleteOutlinedIcon fontSize="small" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
