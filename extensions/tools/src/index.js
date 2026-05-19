const MOCK_RECORDS = [
  {id: 'cmp_001', type: 'campaign', title: 'Welcome Series — New Subscribers', url: 'shopify:admin/apps/joy-sample-new-app/campaigns/cmp_001'},
  {id: 'cmp_002', type: 'campaign', title: 'Black Friday Early Access', url: 'shopify:admin/apps/joy-sample-new-app/campaigns/cmp_002'},
  {id: 'cmp_003', type: 'campaign', title: 'Abandoned Cart Recovery', url: 'shopify:admin/apps/joy-sample-new-app/campaigns/cmp_003'},
  {id: 'cmp_004', type: 'campaign', title: 'Post-Purchase Thank You', url: 'shopify:admin/apps/joy-sample-new-app/campaigns/cmp_004'},
  {id: 'seg_001', type: 'segment', title: 'VIP customers (lifetime spend > $500)', url: 'shopify:admin/apps/joy-sample-new-app/segments/seg_001'},
  {id: 'seg_002', type: 'segment', title: 'Cart abandoners — last 7 days', url: 'shopify:admin/apps/joy-sample-new-app/segments/seg_002'},
  {id: 'seg_003', type: 'segment', title: 'Subscribers without a purchase', url: 'shopify:admin/apps/joy-sample-new-app/segments/seg_003'},
  {id: 'rpt_001', type: 'report', title: 'Campaign performance — last 30 days', url: 'shopify:admin/apps/joy-sample-new-app/reports/rpt_001'},
  {id: 'rpt_002', type: 'report', title: 'Subscriber growth report', url: 'shopify:admin/apps/joy-sample-new-app/reports/rpt_002'},
  {id: 'rpt_003', type: 'report', title: 'Revenue attribution by campaign', url: 'shopify:admin/apps/joy-sample-new-app/reports/rpt_003'},
];

export default async function extension() {
  shopify.tools.register('search', (input) => {
    const {query = '', first = 10, after} = input;

    console.log('[sidekick:search] invoked', {query, first, after});

    const STOPWORDS = new Set([
      'a', 'an', 'the', 'my', 'me', 'i', 'show', 'find', 'list', 'get',
      'what', 'which', 'are', 'is', 'do', 'have', 'any', 'for', 'in', 'of', 'to',
    ]);
    const stem = (t) => (t.length > 3 && t.endsWith('s') ? t.slice(0, -1) : t);
    const tokens = query
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((t) => t && !STOPWORDS.has(t))
      .map(stem);
    const matches = tokens.length
      ? MOCK_RECORDS.map((r) => {
          const haystack = `${r.title} ${r.type}`.toLowerCase();
          const score = tokens.reduce((n, t) => n + (haystack.includes(t) ? 1 : 0), 0);
          return {record: r, score};
        })
          .filter(({score}) => score > 0)
          .sort((a, b) => b.score - a.score)
          .map(({record}) => record)
      : MOCK_RECORDS;

    const startIndex = after ? Number(after) + 1 : 0;
    const endIndex = Math.min(startIndex + first, matches.length);
    const page = matches.slice(startIndex, endIndex);

    return {
      results: page,
      pageInfo: {
        hasNextPage: endIndex < matches.length,
        hasPreviousPage: startIndex > 0,
        startCursor: page.length ? String(startIndex) : null,
        endCursor: page.length ? String(endIndex - 1) : null,
      },
    };
  });
}
