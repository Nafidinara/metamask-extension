export const AUTOMATION_CONFIG = {
  enabled: false,
  delay: async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  },
  password: 'gantengaja',
};
