export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'time-and-issue-required': [2, 'always'],
  },
  plugins: [
    {
      rules: {
        'time-and-issue-required': ({ raw }) => {
          const hasTime = /(\d+(?:\.\d+)?)(h|hr|hours?|m|min|minutes?)/i.test(
            raw
          );
          const hasIssue = /#\d+/.test(raw);

          if (!hasTime && !hasIssue) {
            return [
              false,
              'Commit must include both time spent (e.g., "1h", "30m") and issue reference (e.g., "#1")',
            ];
          }
          if (!hasTime) {
            return [
              false,
              'Commit must include time spent (e.g., "1h", "30m", "45min")',
            ];
          }
          if (!hasIssue) {
            return [
              false,
              'Commit must include issue reference (e.g., "#1", "#2")',
            ];
          }

          return [true];
        },
      },
    },
  ],
};
