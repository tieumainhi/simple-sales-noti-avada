import React, { useState } from 'react';
import { Button, Card, InlineStack, Layout, Page, Text } from '@shopify/polaris';
import './Home.scss';

/**
 * Render a home page for overview
 *
 * @return {React.ReactElement}
 * @constructor
 */
export default function Home() {
  const [enabled, setEnabled] = useState(false);

  return (
    <Page fullWidth title="Home">
      <Layout>
        <Layout.Section>
          <Card>
            <InlineStack align="space-between" blockAlign="center">
              <InlineStack blockAlign="center" gap="100" wrap={false}>
                <Text as="span" variant="bodyMd">
                  App status is
                </Text>
                <Text as="span" variant="bodyMd" fontWeight="bold">
                  {enabled ? 'enabled' : 'disabled'}
                </Text>
              </InlineStack>
              <div className="SalesPop-HomeStatusButton">
                <Button
                  variant={enabled ? 'secondary' : 'primary'}
                  onClick={() => setEnabled(prev => !prev)}
                >
                  {enabled ? 'Disable' : 'Enable'}
                </Button>
              </div>
            </InlineStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
