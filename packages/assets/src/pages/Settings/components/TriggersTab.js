import '@assets/styles/common/SalesPop.scss';
import { BlockStack, LegacyCard, Select, Text, TextField } from '@shopify/polaris';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * @param {Object} props
 * @return {JSX.Element}
 */
function TriggersTab({
  allowShow,
  setAllowShow,
  includedPages,
  setIncludedPages,
  excludedPages,
  setExcludedPages
}) {
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
          onChange={setAllowShow}
        />

        {isSpecific && (
          <TextField
            label="Included pages"
            multiline={4}
            value={includedPages}
            onChange={setIncludedPages}
            helpText="Page URLs to show the pop-up (separated by new lines)"
          />
        )}
        <TextField
          label="Excluded pages"
          multiline={4}
          value={excludedPages}
          onChange={setExcludedPages}
          helpText="Page URLs NOT to show the pop-up (separated by new lines)"
        />
      </BlockStack>
    </LegacyCard.Section>
  );
}

export default React.memo(TriggersTab);

TriggersTab.propTypes = {
  allowShow: PropTypes.string.isRequired,
  setAllowShow: PropTypes.func.isRequired,
  includedPages: PropTypes.string.isRequired,
  setIncludedPages: PropTypes.func.isRequired,
  excludedPages: PropTypes.string.isRequired,
  setExcludedPages: PropTypes.func.isRequired
};
