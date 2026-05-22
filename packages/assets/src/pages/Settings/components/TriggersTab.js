import '@assets/styles/common/SalesPop.scss';
import { BlockStack, LegacyCard, Select, Text, TextField } from '@shopify/polaris';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * @param {Object} props
 * @return {JSX.Element}
 */
function TriggersTab({ settings, onChange }) {
  const { allowShow, includedPages, excludedPages } = settings;
  const isSpecific = allowShow === 'specific';

  return (
    <LegacyCard.Section>
      <BlockStack gap="400">
        <Text as="h2" variant="headingMd" tone="subdued">
          PAGES RESTRICTION
        </Text>

        <Select
          label="Pages restriction"
          labelHidden
          options={[
            { label: 'All pages', value: 'all' },
            { label: 'Specific pages', value: 'specific' }
          ]}
          value={allowShow}
          onChange={value => onChange('allowShow', value)}
        />

        {isSpecific && (
          <TextField
            label="Included pages"
            multiline={4}
            value={includedPages}
            onChange={value => onChange('includedPages', value)}
            helpText="Page URLs to show the pop-up (separated by new lines)"
          />
        )}
        <TextField
          label="Excluded pages"
          multiline={4}
          value={excludedPages}
          onChange={value => onChange('excludedPages', value)}
          helpText="Page URLs NOT to show the pop-up (separated by new lines)"
        />
      </BlockStack>
    </LegacyCard.Section>
  );
}

export default React.memo(TriggersTab);

TriggersTab.propTypes = {
  settings: PropTypes.shape({
    allowShow: PropTypes.string.isRequired,
    includedPages: PropTypes.string.isRequired,
    excludedPages: PropTypes.string.isRequired
  }).isRequired,
  onChange: PropTypes.func.isRequired
};
