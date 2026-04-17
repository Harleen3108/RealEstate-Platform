import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { CalendarDays, Clock3, Mail, MapPin, Phone, X } from 'lucide-react';
import API_BASE_URL from '../../apiConfig';
import { useAuth } from '../../context/AuthContext';
import { formatINR, titleCase, resolveImage } from '../../utils/format';
import { BACKEND_URL } from '../../apiConfig';

const defaultForm = {
  name: '',
  email: '',
  phone: '',
  date: '',
  time: '',
  message: '',
};

const timeSlots = ['09:00 AM', '11:00 AM', '01:00 PM', '03:00 PM', '05:00 PM', '07:00 PM'];

const ScheduleTourModal = ({ open, property, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (!open) return;

    setFormData({
      ...defaultForm,
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phoneNumber || user?.phone || '',
    });
    setFeedback('');
  }, [open, property?._id, user]);

  if (!open || !property) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setFeedback('');

    try {
      await axios.post(`${API_BASE_URL}/schedule-tour`, {
        propertyId: property._id,
        ...formData,
      });
      setFeedback('Tour request submitted successfully.');
      onSuccess?.();
      setTimeout(() => onClose?.(), 900);
    } catch (error) {
      setFeedback(error.response?.data?.message || 'Unable to submit tour request at the moment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="tour-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="tour-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Schedule a tour"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="tour-modal__hero">
          <div className="tour-modal__hero-media">
            <img
              src={resolveImage(property.images?.[0], BACKEND_URL)}
              alt={titleCase(property.title)}
              onError={(event) => {
                event.currentTarget.src = resolveImage('', BACKEND_URL);
              }}
            />
          </div>
          <div className="tour-modal__hero-copy">
            <p className="eyebrow">Private Tour</p>
            <h3>{titleCase(property.title)}</h3>
            <p>{titleCase(property.location)}</p>
            <div className="tour-modal__price">{formatINR(property.price)}</div>
            <div className="tour-modal__badges">
              <span><MapPin size={14} /> {property.state || 'Premium listing'}</span>
              <span><CalendarDays size={14} /> Flexible scheduling</span>
            </div>
          </div>
          <button type="button" className="tour-modal__close" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="tour-modal__body">
          <div className="tour-modal__note">
            <strong>Guest bookings are supported.</strong>
            <span>Sign in for faster form fill and follow-up visibility.</span>
            {!user ? (
              <Link to="/login" className="tour-modal__login-link">
                Login for auto-fill
              </Link>
            ) : null}
          </div>

          <form className="tour-modal__form" onSubmit={handleSubmit}>
            <div className="tour-modal__grid">
              <input
                className="tour-modal__input"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full name"
                required
              />
              <input
                className="tour-modal__input"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email address"
                required
              />
              <input
                className="tour-modal__input"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone number"
                required
              />
              <input
                className="tour-modal__input"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="tour-modal__slots">
              <div className="tour-modal__slots-label">
                <Clock3 size={15} /> Preferred Time Slot
              </div>
              <div className="tour-modal__chips">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    className={`tour-slot ${formData.time === slot ? 'tour-slot--active' : ''}`}
                    onClick={() => setFormData((current) => ({ ...current, time: slot }))}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              className="tour-modal__textarea"
              name="message"
              rows="4"
              value={formData.message}
              onChange={handleChange}
              placeholder="Message for the advisory team, preferred move-in timeline, or special requests"
            />

            {feedback ? <div className="tour-modal__feedback">{feedback}</div> : null}

            <div className="tour-modal__actions">
              <button type="button" className="tour-modal__secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="tour-modal__primary" disabled={submitting || !formData.time}>
                {submitting ? 'Submitting...' : 'Confirm Tour'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ScheduleTourModal;
