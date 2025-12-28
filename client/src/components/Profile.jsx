import React, { useState, useEffect } from 'react';
import { api } from '../api';

const Profile = ({ user, onClose }) => {
    const [formData, setFormData] = useState({
        full_name: '',
        bio: '',
        skills: '',
        contact_email: '',
        phone: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await api.getProfile('me', localStorage.getItem('token'));
            if (data.id) {
                setFormData({
                    full_name: data.full_name || '',
                    bio: data.bio || '',
                    skills: data.skills || '',
                    contact_email: data.contact_email || '',
                    phone: data.phone || ''
                });
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.updateProfile(formData, localStorage.getItem('token'));
            alert('Profile updated successfully!');
            onClose();
        } catch (err) {
            alert('Failed to update profile');
        }
    };

    if (loading) return <div>Loading Profile...</div>;

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <div className="card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3>Edit Proflle</h3>
                    <button className="btn btn-secondary" onClick={onClose}>Close</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Full Name</label>
                    <input className="input" name="full_name" value={formData.full_name} onChange={handleChange} />

                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Bio</label>
                    <textarea className="input" name="bio" rows="3" value={formData.bio} onChange={handleChange} />

                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Skills (comma separated)</label>
                    <input className="input" name="skills" value={formData.skills} onChange={handleChange} placeholder="e.g. React, Node.js, Leadership" />

                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Contact Email</label>
                    <input className="input" name="contact_email" type="email" value={formData.contact_email} onChange={handleChange} />

                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Phone</label>
                    <input className="input" name="phone" value={formData.phone} onChange={handleChange} />

                    <button className="btn" style={{ width: '100%', marginTop: '1rem' }}>Save Profile</button>
                </form>
            </div>
        </div>
    );
};

export default Profile;
