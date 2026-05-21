import {
  BlockStack,
  Box,
  Checkbox,
  InlineGrid,
  LegacyCard,
  RangeSlider,
  Text,
  TextField
} from '@shopify/polaris';
import PropTypes from 'prop-types';
import React from 'react';
import '@assets/styles/common/SalesPop.scss';

const positionOptions = [
  { label: 'Bottom left', value: 'bottom-left' },
  { label: 'Bottom right', value: 'bottom-right' },
  { label: 'Top left', value: 'top-left' },
  { label: 'Top right', value: 'top-right' }
];
/**
 * @param {Object} props
 * @return {JSX.Element}
 */
const DisplayTab = ({
  position,
  setPosition,
  displayDuration,
  setDisplayDuration,
  firstDelay,
  setFirstDelay,
  popsInterval,
  setPopsInterval,
  maxPopsDisplay,
  setMaxPopsDisplay,
  hideTimeAgo,
  setHideTimeAgo,
  truncateContent,
  setTruncateContent
}) => {
  return (
    <LegacyCard.Section>
      <BlockStack gap="400">
        <Text as="h2" variant="headingMd" tone="subdued">
          APPEARANCE
        </Text>
        <BlockStack>
          <BlockStack gap="100">
            <Text as="p" variant="bodySm" tone="subdued">
              Desktop Position
            </Text>
            <Box className="SalesPop-PositionGrid SalesPop-FieldLabel">
              {positionOptions.map(option => (
                <button
                  aria-label={option.label}
                  className={[
                    'SalesPop-PositionCard',
                    `SalesPop-PositionCard--${option.value}`,
                    position === option.value && 'is-selected'
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  key={option.value}
                  onClick={() => setPosition(option.value)}
                  type="button"
                />
              ))}
            </Box>
          </BlockStack>
          <Text as="p" tone="subdued" variant="bodySm">
            The display position of the pop on your website.
          </Text>
        </BlockStack>
        <Checkbox label="Hide time ago" checked={hideTimeAgo} onChange={setHideTimeAgo} />
        <Checkbox
          label="Truncate content text"
          checked={truncateContent}
          helpText="If your product name is long for one line, it will be truncated to 'Product na...'"
          onChange={setTruncateContent}
        />
        <Text as="h2" variant="headingMd" tone="subdued">
          TIMING
        </Text>
        <InlineGrid columns={{ xs: 1, sm: 2 }} gap="200">
          <BlockStack>
            <RangeSlider
              label="Display duration"
              min={1}
              max={20}
              output
              prefix=""
              suffix={
                <TextField
                  label="Display duration seconds"
                  labelHidden
                  value={`${displayDuration} second(s)`}
                  readOnly
                />
              }
              value={displayDuration}
              onChange={setDisplayDuration}
              helpText="How long each pop will display on your page."
            />
            <RangeSlider
              label="Time before the first pop"
              min={0}
              max={60}
              output
              suffix={
                <TextField
                  label="First pop seconds"
                  labelHidden
                  value={`${firstDelay} second(s)`}
                  readOnly
                />
              }
              value={firstDelay}
              onChange={setFirstDelay}
              helpText="The delay time before the first notification."
            />
          </BlockStack>
          <BlockStack>
            <RangeSlider
              label="Gap time between two pops"
              min={1}
              max={30}
              output
              suffix={
                <TextField
                  label="Gap seconds"
                  labelHidden
                  value={`${popsInterval} second(s)`}
                  readOnly
                />
              }
              value={popsInterval}
              onChange={setPopsInterval}
              helpText="The time interval between two popup notifications."
            />
            <RangeSlider
              label="Maximum of popups"
              min={1}
              max={80}
              output
              suffix={
                <TextField
                  label="Maximum popups"
                  labelHidden
                  value={`${maxPopsDisplay} pop(s)`}
                  readOnly
                />
              }
              value={maxPopsDisplay}
              onChange={setMaxPopsDisplay}
              helpText="The maximum number of popups are allowed to show after page loading. Maximum number is 80."
            />
          </BlockStack>
        </InlineGrid>
      </BlockStack>
    </LegacyCard.Section>
  );
};

export default React.memo(DisplayTab);

DisplayTab.propTypes = {
  position: PropTypes.string.isRequired,
  setPosition: PropTypes.func.isRequired,
  displayDuration: PropTypes.number.isRequired,
  setDisplayDuration: PropTypes.func.isRequired,
  firstDelay: PropTypes.number.isRequired,
  setFirstDelay: PropTypes.func.isRequired,
  popsInterval: PropTypes.number.isRequired,
  setPopsInterval: PropTypes.func.isRequired,
  maxPopsDisplay: PropTypes.number.isRequired,
  setMaxPopsDisplay: PropTypes.func.isRequired,
  hideTimeAgo: PropTypes.bool.isRequired,
  setHideTimeAgo: PropTypes.func.isRequired,
  truncateContent: PropTypes.bool.isRequired,
  setTruncateContent: PropTypes.func.isRequired
};
