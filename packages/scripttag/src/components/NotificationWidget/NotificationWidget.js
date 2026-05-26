/* eslint-disable react/prop-types */
import React from 'preact';
import './NotificationWidget.module.scss';
import { formatRelativeDate } from '@assets/helpers/utils/formatFullTime.js';

const NotificationPopup = ({ notification = {}, setting = {} }) => {
  const {
    firstName = 'Someone',
    city = '',
    country = '',
    productImage = '',
    productName = 'a product'
  } = notification;
  const position = setting.position || 'bottom-left';
  const location = [city, country].filter(Boolean).join(', ');
  const customerName = firstName || 'Someone';
  const customerText = location ? `${customerName} in ${location}` : `${customerName} just`;
  const displayProductName = setting.truncateProductName
    ? truncateText(productName, 38)
    : productName;
  const relativeDate = formatRelativeDate(notification.timestamp);

  const positionClass = {
    'top-left': 'Avava-SP__top-left',
    'top-right': 'Avava-SP__top-right',
    'bottom-left': 'Avava-SP__bottom-left',
    'bottom-right': 'Avava-SP__bottom-right'
  };

  return (
    <div
      className={`Avava-SP__Wrapper fadeInUp animated ${positionClass[position] ||
        positionClass['bottom-left']}`}
    >
      <div className="Avava-SP__Inner">
        <div className="Avava-SP__Container">
          <a href="#" className="Avava-SP__LinkWrapper" onClick={preventClick}>
            <div
              className="Avava-SP__Image"
              style={productImage ? { backgroundImage: `url(${productImage})` } : {}}
            >
              {!productImage && '✓'}
            </div>
            <div className="Avada-SP__Content">
              <div className="Avada-SP__Title">{customerText}</div>
              <div className="Avada-SP__Subtitle">purchased {displayProductName}</div>
              <div className="Avada-SP__Footer">
                {!setting.hideTimeAgo && relativeDate ? `${relativeDate} ` : ''}
                <span className="uni-blue">
                  <span className="Avada-SP__Check">✓</span> by AVADA
                </span>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

NotificationPopup.propTypes = {};

export default NotificationPopup;

function preventClick(event) {
  event.preventDefault();
}

function truncateText(text, maxLength) {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}
