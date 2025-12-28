import React, { useState, useEffect } from 'react';
import { api } from '../api';
import Profile from '../components/Profile';

const JobSeekerDashboard = ({ user }) => {
    const [jobs, setJobs] = useState([]);
    const [myApplications, setMyApplications] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [applyingJob, setApplyingJob] = useState(null);
    const [resumeText, setResumeText] = useState('');
    const [showProfile, setShowProfile] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [allJobs, myApps] = await Promise.all([
                api.getJobs(),
                api.getMyApplications(localStorage.getItem('token'))
            ]);
            setJobs(allJobs);
            setMyApplications(myApps);
        } catch (err) {
            console.error(err);
        }
    };

    const handleApply = async (e) => {
        e.preventDefault();
        try {
            await api.apply(applyingJob.id, resumeText, localStorage.getItem('token'));
            setApplyingJob(null);
            setResumeText('');
            loadData(); // Refresh to update button state or lists
        } catch (err) {
            alert(err.message);
        }
    };

    // Filter jobs
    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Check if applied
    const hasApplied = (jobId) => myApplications.some(app => app.job_id === jobId);

    return (
        <div className="container" style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 className="page-title">Job Seeker Dashboard</h2>
                <button className="btn btn-secondary" onClick={() => setShowProfile(true)}>Edit Profile</button>
            </div>

            {showProfile && <Profile user={user} onClose={() => setShowProfile(false)} />}

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                <div>
                    <div className="card" style={{ marginBottom: '2rem' }}>
                        <h3>Find Jobs</h3>
                        <input
                            className="input"
                            placeholder="Search by title or description..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                            {filteredJobs.length === 0 ? <p>No jobs found.</p> : filteredJobs.map(job => (
                                <div key={job.id} style={{ padding: '1.5rem', background: '#0f172a', borderRadius: '0.5rem', border: '1px solid #334155' }}>
                                    <div style={{ display: 'flex', justifySelf: 'space-between', marginBottom: '0.5rem' }}>
                                        <h4 style={{ margin: 0, fontSize: '1.2rem', color: '#6366f1' }}>{job.title}</h4>
                                    </div>
                                    <p style={{ margin: '0 0 0.5rem 0', color: '#94a3b8', fontSize: '0.9rem' }}>Posted by {job.employer_name}</p>
                                    <p style={{ margin: '0 0 1rem 0' }}>{job.description}</p>

                                    {hasApplied(job.id) ? (
                                        <button className="btn btn-secondary" disabled style={{ opacity: 0.5 }}>Applied</button>
                                    ) : (
                                        <button className="btn" onClick={() => setApplyingJob(job)}>Apply Now</button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div>
                    <div className="card" style={{ position: 'sticky', top: '100px' }}>
                        <h3>My Applications</h3>
                        {myApplications.length === 0 ? <p style={{ color: '#94a3b8' }}>You haven't applied to any jobs yet.</p> : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {myApplications.map(app => (
                                    <div key={app.id} style={{ padding: '1rem', background: '#0f172a', borderRadius: '0.5rem', border: '1px solid #334155' }}>
                                        <h4 style={{ margin: '0 0 0.25rem 0' }}>{app.job_title}</h4>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{new Date(app.created_at).toLocaleDateString()}</span>
                                            <span style={{
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '4px',
                                                fontSize: '0.8rem',
                                                background: app.status === 'accepted' ? '#22c55e20' : app.status === 'rejected' ? '#ef444420' : '#f59e0b20',
                                                color: app.status === 'accepted' ? '#22c55e' : app.status === 'rejected' ? '#ef4444' : '#f59e0b'
                                            }}>
                                                {app.status.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {applyingJob && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
                        <h3>Apply to {applyingJob.title}</h3>
                        <form onSubmit={handleApply}>
                            <textarea className="input" placeholder="Resume / Cover Letter Short Text" rows="5" value={resumeText} onChange={e => setResumeText(e.target.value)} required />
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button className="btn" style={{ flex: 1 }}>Submit Application</button>
                                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setApplyingJob(null)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobSeekerDashboard;
