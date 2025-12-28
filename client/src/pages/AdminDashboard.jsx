import React, { useState, useEffect } from 'react';
import { api } from '../api';

const AdminDashboard = ({ user }) => {
    const [activity, setActivity] = useState([]);

    useEffect(() => {
        loadActivity();
    }, []);

    const loadActivity = async () => {
        try {
            const data = await api.getAdminActivity(localStorage.getItem('token'));
            setActivity(data);
        } catch (err) {
            console.error(err);
            alert('Failed to load admin activity');
        }
    };

    return (
        <div className="container" style={{ marginTop: '2rem' }}>
            <h2 className="page-title">System Activity Log (Admin)</h2>
            <div className="card">
                <h3>All Applications</h3>
                <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>Displaying real-time system activity using SQL JOINs across Users and Jobs tables.</p>

                {activity.length === 0 ? <p>No activity found.</p> : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #334155' }}>
                                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Time</th>
                                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Job Seeker</th>
                                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Job Title</th>
                                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Employer</th>
                                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activity.map(item => (
                                <tr key={item.application_id} style={{ borderBottom: '1px solid #1e293b' }}>
                                    <td style={{ padding: '0.5rem' }}>{new Date(item.created_at).toLocaleString()}</td>
                                    <td style={{ padding: '0.5rem', color: '#6366f1' }}>{item.seeker_name}</td>
                                    <td style={{ padding: '0.5rem' }}>{item.job_title}</td>
                                    <td style={{ padding: '0.5rem', color: '#a855f7' }}>{item.employer_name}</td>
                                    <td style={{ padding: '0.5rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '4px',
                                            fontSize: '0.8rem',
                                            background: item.status === 'accepted' ? '#22c55e20' : item.status === 'rejected' ? '#ef444420' : '#f59e0b20',
                                            color: item.status === 'accepted' ? '#22c55e' : item.status === 'rejected' ? '#ef4444' : '#f59e0b'
                                        }}>
                                            {item.status.toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
