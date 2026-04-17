import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Move, CalendarDays } from 'lucide-react';
import { BACKEND_URL } from '../../apiConfig';
import { formatINR, titleCase, resolveImage, FALLBACK_IMAGE } from '../../utils/format';

const PropertyCard = ({
  property,
  variant = 'default', // 'default' | 'compact' | 'investment'
  ctaLabel = 'View Details',
  ctaTo,
  onCtaClick,
  onScheduleClick,
  requiresAuthFor,
  user,
}) => {
  const imgSrc = resolveImage(property.images?.[0], BACKEND_URL);
  const to = ctaTo || `/property/${property._id}`;
  const isInvestment = variant === 'investment';
  const gated = requiresAuthFor && !user;

  const handleClick = (e) => {
    if (gated) {
      e.preventDefault();
      onCtaClick?.(e);
    }
  };

  return (
    <article className="lx-card">
      <div className="lx-card__media">
        <img
          src={imgSrc}
          alt={titleCase(property.title)}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = FALLBACK_IMAGE;
          }}
        />
        {property.propertyType && (
          <span className="lx-card__tag">{property.propertyType}</span>
        )}
        <span className="lx-card__price">{formatINR(property.price)}</span>
      </div>

      <div className="lx-card__body">
        <h3 className="lx-card__title">{titleCase(property.title)}</h3>

        <div className="lx-card__location">
          <MapPin size={13} />
          <span>{titleCase(property.location)}</span>
        </div>

        <div className="lx-card__meta">
          {property.size ? (
            <span><Move size={13} /> {property.size.toLocaleString('en-IN')} sqft</span>
          ) : null}
          {property.bedrooms ? (
            <span><Bed size={13} /> {property.bedrooms} Beds</span>
          ) : null}
          {property.bathrooms ? (
            <span><Bath size={13} /> {property.bathrooms} Baths</span>
          ) : null}
        </div>

        <div className="lx-card__actions">
          <Link
            to={gated ? '/login' : to}
            onClick={handleClick}
            className={`lx-card__cta ${isInvestment ? 'lx-card__cta--solid' : ''}`}
          >
            {gated ? 'Login to Continue' : ctaLabel}
          </Link>

          <button
            type="button"
            className="lx-card__cta lx-card__cta--ghost"
            onClick={() => onScheduleClick?.(property)}
          >
            <CalendarDays size={14} /> Schedule a Tour
          </button>
        </div>
      </div>
    </article>
  );
};

export default PropertyCard;
