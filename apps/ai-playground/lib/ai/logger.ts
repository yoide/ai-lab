export const AILogger = {
  info(event: string, data: unknown) {
    // eslint-disable-next-line no-console -- structured logger is the one sanctioned console user
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        event,
        data,
      }),
    );
  },
};
