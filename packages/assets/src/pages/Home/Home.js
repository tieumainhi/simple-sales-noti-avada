import React, { useState } from 'react';
import { Button, Card, InlineStack, Layout, Page, Text } from '@shopify/polaris';

/**
 * Render a home page for overview
 *
 * @return {React.ReactElement}
 * @constructor
 */
export default function Home() {
  const [enabled, setEnabled] = useState(false);

  return (
    <Page title="Home">
      <Layout>
        <Layout.Section>
          <Card>
            <InlineStack align="space-between" blockAlign="center">
              <Text as="span">App status is {enabled ? 'enabled' : 'disabled'}</Text>
              <Button
                variant={enabled ? 'secondary' : 'primary'}
                onClick={() => setEnabled(prev => !prev)}
              >
                {enabled ? 'Disable' : 'Enable'}
              </Button>
            </InlineStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
