import React, { useState, useEffect } from 'react';
import { api } from '../api';

const EmployerDashboard = ({ user }) => {
    const [jobs, setJobs] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [showPostModal, setShowPostModal] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [applications, setApplications] = useState([]);

    const [activeTab, setActiveTab] = useState('jobs');
    const [reports, setReports] = useState([]);

    useEffect(() => {
        loadJobs();
        loadReports();
    }, []);

    const loadJobs = async () => {
        try {
            const allJobs = await api.getJobs();
            setJobs(allJobs.filter(j => j.employer_id === user.id));
        } catch (err) {
            console.error(err);
        }
    };

    const loadReports = async () => {
        try {
            const data = await api.getEmployerReports(localStorage.getItem('token'));
            setReports(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handlePostJob = async (e) => {
        e.preventDefault();
        try {
            await api.postJob(title, description, localStorage.getItem('token'));
            setTitle('');
            setDescription('');
            setShowPostModal(false);
            loadJobs();
        } catch (err) {
            alert(err.message);
        }
    };

    const viewApplications = async (job) => {
        setSelectedJob(job);
        try {
            const apps = await api.getJobApplications(job.id, localStorage.getItem('token'));
            setApplications(apps);
        } catch (err) {
            console.error(err);
        }
    };

    const updateStatus = async (appId, newStatus) => {
        try {
            await api.updateApplicationStatus(appId, newStatus, localStorage.getItem('token'));
            // Refresh applications
            if (selectedJob) viewApplications(selectedJob);
            loadReports(); // Update reports too
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="container" style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 className="page-title">Employer Dashboard</h2>
                <div>
                    <button className={`btn ${activeTab === 'jobs' ? '' : 'btn-secondary'}`} style={{ marginRight: '1rem' }} onClick={() => setActiveTab('jobs')}>My Jobs</button>
                    <button className={`btn ${activeTab === 'reports' ? '' : 'btn-secondary'}`} style={{ marginRight: '1rem' }} onClick={() => setActiveTab('reports')}>Reports</button>
                    <button className="btn" onClick={() => setShowPostModal(true)}>Post New Job</button>
                </div>
            </div>

            {showPostModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
                        <h3>Post a Job</h3>
                        <form onSubmit={handlePostJob}>
                            <input className="input" placeholder="Job Title" value={title} onChange={e => setTitle(e.target.value)} required />
                            <textarea className="input" placeholder="Job Description" rows="5" value={description} onChange={e => setDescription(e.target.value)} required />
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button className="btn" style={{ flex: 1 }}>Post Job</button>
                                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowPostModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {activeTab === 'jobs' ? (
                <div style={{ display: 'grid', gap: '2rem' }}>
                    <div className="card">
                        <h3>My Posted Jobs</h3>
                        {jobs.length === 0 ? <p style={{ color: '#94a3b8' }}>You haven't posted any jobs yet.</p> : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {jobs.map(job => (
                                    <div key={job.id} style={{ padding: '1rem', background: '#0f172a', borderRadius: '0.5rem', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h4 style={{ margin: '0 0 0.5rem 0' }}>{job.title}</h4>
                                            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>Status: {job.status}</p>
                                        </div>
                                        <button className="btn btn-secondary" onClick={() => viewApplications(job)}>View Applications</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {selectedJob && (
                        <div className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3>Applications for: {selectedJob.title}</h3>
                                <button className="btn btn-secondary" onClick={() => setSelectedJob(null)}>Close</button>
                            </div>
                            {applications.length === 0 ? <p style={{ color: '#94a3b8' }}>No applications yet.</p> : (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid #334155' }}>
                                            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Applicant</th>
                                            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Resume</th>
                                            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Status</th>
                                            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {applications.map(app => (
                                            <tr key={app.id} style={{ borderBottom: '1px solid #1e293b' }}>
                                                <td style={{ padding: '0.5rem' }}>{app.seeker_name}</td>
                                                <td style={{ padding: '0.5rem' }}>{app.resume_text}</td>
                                                <td style={{ padding: '0.5rem' }}>
                                                    <span style={{
                                                        padding: '0.25rem 0.5rem',
                                                        borderRadius: '4px',
                                                        fontSize: '0.8rem',
                                                        background: app.status === 'accepted' ? '#22c55e20' : app.status === 'rejected' ? '#ef444420' : '#f59e0b20',
                                                        color: app.status === 'accepted' ? '#22c55e' : app.status === 'rejected' ? '#ef4444' : '#f59e0b'
                                                    }}>
                                                        {app.status.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '0.5rem' }}>
                                                    {app.status === 'pending' && (
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            <button className="btn" style={{ padding: '0.25rem 0.5rem', background: '#22c55e', fontSize: '0.8rem' }} onClick={() => updateStatus(app.id, 'accepted')}>Accept</button>
                                                            <button className="btn" style={{ padding: '0.25rem 0.5rem', background: '#ef4444', fontSize: '0.8rem' }} onClick={() => updateStatus(app.id, 'rejected')}>Reject</button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div className="card">
                    <h3>Detailed Reports</h3>
                    <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>Aggregated view of all applications including candidate profiles.</p>

                    {reports.length === 0 ? <p>No data available.</p> : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #334155' }}>
                                        <th style={{ textAlign: 'left', padding: '0.5rem' }}>Job Title</th>
                                        <th style={{ textAlign: 'left', padding: '0.5rem' }}>Applicant</th>
                                        <th style={{ textAlign: 'left', padding: '0.5rem' }}>Full Name</th>
                                        <th style={{ textAlign: 'left', padding: '0.5rem' }}>Skills</th>
                                        <th style={{ textAlign: 'left', padding: '0.5rem' }}>Contact</th>
                                        <th style={{ textAlign: 'left', padding: '0.5rem' }}>Status</th>
                                        <th style={{ textAlign: 'left', padding: '0.5rem' }}>Applied</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.map((row, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #1e293b' }}>
                                            <td style={{ padding: '0.5rem' }}>{row.job_title}</td>
                                            <td style={{ padding: '0.5rem', color: '#6366f1' }}>{row.applicant_username}</td>
                                            <td style={{ padding: '0.5rem' }}>{row.full_name || '-'}</td>
                                            <td style={{ padding: '0.5rem' }}>{row.skills || '-'}</td>
                                            <td style={{ padding: '0.5rem' }}>{row.contact_email || '-'}</td>
                                            <td style={{ padding: '0.5rem' }}>{row.application_status.toUpperCase()}</td>
                                            <td style={{ padding: '0.5rem' }}>{new Date(row.applied_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default EmployerDashboard;
