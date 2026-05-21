import React from 'react';
import './NoticationPopup.scss';
import PropTypes from 'prop-types';
import { CheckIcon } from '@shopify/polaris-icons';
import { Icon, InlineStack, Text } from '@shopify/polaris';

const NotificationPopup = ({
  firstName = 'Someone',
  city = 'New York',
  country = 'United States',
  productName = 'Sport Sneaker',
  timestamp = 'a day ago',
  productImage = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR59LZe8Dmq_IeJZK8J9FTc17ZGGjMNwHWwSQ&s'
}) => {
  return (
    <div className="Avava-SP__Wrapper fadeInUp animated">
      <div className="Avava-SP__Inner">
        <div className="Avava-SP__Container">
          <a href="/" className={'Avava-SP__LinkWrapper'} onClick={event => event.preventDefault()}>
            <div
              className="Avava-SP__Image"
              style={{
                backgroundImage: `url(${productImage})`
              }}
            ></div>
            <div className="Avada-SP__Content">
              <div className={'Avada-SP__Title'}>
                {firstName} in {city}, {country}
              </div>
              <p className={'Avada-SP__Subtitle'} style={{ fontWeight: 'bold', fontSize: '14px' }}>
                Purchased {productName}
              </p>
              <div className={'Avada-SP__Footer'}>
                {timestamp}{' '}
                <InlineStack className="uni-blue" gap={100}>
                  <Icon source={CheckIcon} tone="info" />
                  <Text as="span" variant="bodySm" tone="success">
                    by AVADA
                  </Text>
                </InlineStack>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

NotificationPopup.propTypes = {
  firstName: PropTypes.string,
  city: PropTypes.string,
  country: PropTypes.string,
  productName: PropTypes.string,
  productImage: PropTypes.string,
  timestamp: PropTypes.string
};

export default NotificationPopup;
