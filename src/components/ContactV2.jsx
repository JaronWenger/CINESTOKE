import React, { useState, useEffect } from 'react';
import './Contact.css';

const ContactV2 = ({ isOpen, onClose, subtitle, formKey = '152bc921-6006-46a7-a309-9c58d44bff4a', subject = 'CINESTOKE HOMEPAGE', defaultMessage = '' }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [statusMessage, setStatusMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({ ...prev, message: defaultMessage }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: formKey,
        subject,
        name: formData.name,
        email: formData.email,
        message: formData.message,
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStatusMessage('Your message has been sent successfully!');
          setFormData({ name: '', email: '', message: '' });
        } else {
          setStatusMessage('Something went wrong. Please try again later.');
        }
      })
      .catch(() => {
        setStatusMessage('Something went wrong. Please try again later.');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleClose = () => {
    setFormData({ name: '', email: '', message: '' });
    setStatusMessage('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="contact-modal-overlay" onClick={handleClose}>
      <div className="contact-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="contact-modal-close" onClick={handleClose}>
          ×
        </button>
        <section className="contact-section">
          <h2>CONTACT</h2>
          {subtitle && (
            <p style={{
              marginBottom: '1.5rem',
              color: 'rgba(255,255,255,0.6)',
              fontSize: '1rem',
              lineHeight: 1.7,
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              letterSpacing: 0,
            }}>
              {subtitle}
            </p>
          )}
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                placeholder="Your Message"
                rows="5"
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Submit'}
            </button>
          </form>
          {statusMessage && <p className="status-message">{statusMessage}</p>}
        </section>
      </div>
    </div>
  );
};

export default ContactV2;
